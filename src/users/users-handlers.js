'use strict';


const Bcrypt = require('bcrypt');
const Boom = require('boom');
const Joi = require('joi');
const Jwt = require('jsonwebtoken');
const Moment = require('moment');

const MailService = require('../mail/mail');
const Profile = require('../profiles/profiles-model');
const User = require('./users-model');

const _privateKey = process.env.JWT_PRIVATE_KEY;


// [GET] /api/test
exports.test = {
    handler: (request,reply) => {
        console.log('noway');
        return reply('ecs updated!! :)');
    }
};


// [GET] /api/users/confirm/{token}
exports.confirm = {
    validate: {
        params: {
            token: Joi.string().required()
        }
    },
    handler: (request, reply) => {

        let token = request.params.token;

        Jwt.verify(token, _privateKey, (err, decoded) => {
            if (decoded === undefined) {
                return reply(Boom.badRequest('Invalid verification link'));
            }
            let ttl = 90000000;
            let diff = Moment().diff(Moment(decoded.iat * 1000));
            if (diff > ttl) {
                return reply(Boom.badRequest('The token expired'));
            } else if (decoded.user_id) {
                User.findById(decoded.user_id, (err, user) => {
                    if (err) {
                        return reply(Boom.internal());
                    } else if (!user) {
                        return reply(Boom.badRequest('Invalid verification link'));
                    } else {
                        user.isVerified = true;
                        user.save((err) => {
                            if (err) {
                                return reply(Boom.internal());
                            } else {

                                Profile.findById(decoded.profile_id, (err, profile) => {

                                    if (err) {
                                        return reply(Boom.internal());  
                                    } else {
                                        let tokenData = {
                                            user_id: user._id,
                                            profile_id: profile._id
                                        };
                                        let token = Jwt.sign(tokenData, _privateKey);
                                        return reply({message: 'success', token: token});
                                    }
                                });
                            }
                        });
                    }
                });
            } else {
                return reply(Boom.badRequest('Invalid verification link'));
            }
        });
    }
};


// [POST] /api/users
exports.register = {
    validate: {
        payload: {
            name: Joi.string().min(1).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(80).required()
        }
    },
    handler: (request, reply) => {

        let name = request.payload.name;
        let email = request.payload.email;
        let password = request.payload.password;

        Bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                return reply({error:'Sign up unsuccessful. Try again later.'});
            }
            Bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    return reply({error:'Invalid Sign Up Information'});
                }
                // create new profile
                let profile = new Profile({
                    name: name
                });
                profile.save((err, profile) => {
                    if (!err) {
                        // create new user
                        let user = new User({
                            email: email,
                            password: hash,
                            profile: profile.id
                        });
                        user.save((err, user) => {
                            if (!err) {
                                let tokenData = {
                                    user_id: user._id,
                                    profile_id: profile._id
                                };
                                let token = Jwt.sign(tokenData, _privateKey);
                                try {
                                    let templateFile = MailService.getMailTemplate('./lib/mail/register.ejs');
                                    MailService.sendEmail('Verify your email address', templateFile, user.email, {token: token});
                                    return reply({token: token});
                                } catch (e) {
                                    return reply({error:'Sign up unsuccessful. Try again later.'});
                                }
                            } else {
                                return reply({error:'Invalid Sign Up Information'});
                            }
                        });
                    } else {
                        return reply({error:'Invalid Sign Up Information'});
                    }
                });
            });
        });
    }
};


// [POST] /api/users/login
exports.login = {
    validate: {
        payload: {
            email: Joi.string().email().required(),
            password: Joi.string().min(8).max(80).required()
        }
    },
    handler: (request, reply) => {
        
        let email = request.payload.email;
        let password = request.payload.password;

        User.findOne({email: email}, (err, user) => {
            if (err) {
                return reply({error:'Incorrect Login Information'});
            } else if (user && user.isVerified) {
                Bcrypt.compare(password, user.password, (err, res) => {
                    if (err) {
                        return reply({error:'Incorrect Login Information'});
                    }
                    else if (res) {
                        let tokenData = {
                            user_id: user._id,
                            profile_id: user.profile
                        };
                        let token = Jwt.sign(tokenData, _privateKey);
                        return reply({token: token});
                    } 
                    else {
                        return reply({error:'Incorrect Login Information'});
                    }
                });
            } else if (user && !user.isVerified) {
                return reply({error:'Email Address Verification Required'});
            } else {
                return reply({error:'Incorrect Login Information'});
            }
        });
    }
};

// [POST] /api/users/password
exports.updatePassword = {
    auth: 'jwt',
    validate: {
        payload: {
            oldPassword: Joi.string().required(),
            newPassword: Joi.string().required(),
            confirmNewPassword: Joi.string().required(),
        }
    },
    handler: (request, reply) => {
        
        let oldPassword = request.payload.oldPassword;
        let newPassword = request.payload.newPassword;
        let confirmNewPassword = request.payload.confirmNewPassword;

        if (newPassword != confirmNewPassword) {
            return reply(Boom.badRequest('Bad credentials'));
        } else {

            let user_id = request.auth.credentials.user_id;

            User.findById(user_id, (err, user) => {
                if (err) {
                    return reply(Boom.internal('Error retrieving user'));
                } else if (user && user.isVerified) {
                    Bcrypt.compare(oldPassword, user.password, (err, res) => {
                        if (err) {
                            return reply(Boom.internal('Bcrypt comparison error'));
                        } else if (res) {
                            Bcrypt.genSalt(10, (err, salt) => {
                                if (err) {
                                    return reply(Boom.internal());
                                } else {
                                    Bcrypt.hash(newPassword, salt, (err, hash) => {
                                        if (err) {
                                            return reply(Boom.internal());
                                        } else {
                                            user.password = hash;
                                            user.save((err, user) => {

                                                if (!err) {
                                                    return reply({success:'success'});
                                                } else {
                                                    return reply(Boom.forbidden(err));
                                                }
                                            });
                                        }
                                    });
                                }
                            });
                        } else {
                            return reply(Boom.badRequest('Bad credentials'));
                        }
                    });
                } else if (user && !user.isVerified) {
                    return reply(Boom.forbidden('You must verify your email address'));
                } else {
                    return reply(Boom.badRequest('Bad credentials'));
                }
            });
        }
    }
};

// [DELETE] /api/users/delete
exports.delete = {
    validate: {
        params: {
            password: Joi.string().required()
        }
    },
    handler: (request, reply) => {

        const password = request.payload.password;
        const user_id = request.auth.credentials.user_id;
        
        User.findById(user_id, (err, user) => {
            if (err) {
                return reply(Boom.internal('Error retrieving user'));
            } else if (user) {
                Bcrypt.compare(password, user.password, (err, res) => {
                    if (err) {
                        return reply(Boom.internal('Bcrypt comparison error'));
                    } else if (res) {        
                        User.findByIdAndRemove(user_id, (err, user) => {
                            if (err) {
                                return reply(Boom.internal('Error retrieving user'));
                            } else if (user) {
                                return reply({success:'success'});
                            } else {
                                return reply(Boom.badRequest('Bad credentials'));
                            }
                        });
                    } else {
                        return reply(Boom.badRequest('Bad credentials'));
                    }
                });
            } else {
                return reply(Boom.badRequest('Bad credentials'));
            }
        });
    }
};