'use strict';


const Bcrypt = require('bcrypt');
const Boom = require('boom');
const Joi = require('joi');
const Jwt = require('jsonwebtoken');
const Moment = require('moment');

const MailService = require('../mail/mail');
const User = require('./users-model');

const _privateKey = process.env.JWT_PRIVATE_KEY;


// [GET] /api/test
exports.test = {
    handler: (request,reply) => {
        return reply('cc :)');
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

        const token = request.params.token;

        Jwt.verify(token, _privateKey, (err, decoded) => {
            if (decoded === undefined) {
                return reply(Boom.badRequest('Invalid verification link 1'));
            }
            const ttl = 90000000;
            const diff = Moment().diff(Moment(decoded.iat * 1000));
            if (diff > ttl) {
                return reply(Boom.badRequest('The token expired'));
            } else if (decoded.user_id) {
                User.findById(decoded.user_id, (err, user) => {
                    if (err) {
                        return reply(Boom.internal());
                    } else if (!user) {
                        return reply(Boom.badRequest('Invalid verification link 2'));
                    } else {
                        user.isVerified = true;
                        user.save((err) => {
                            if (err) {
                                return reply(Boom.internal());
                            } else {
                                let tokenData = {
                                    user_id: user._id,
                                };
                                let token = Jwt.sign(tokenData, _privateKey);
                                return reply({message: 'success', token: token, user_id: user._id});
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


// [GET] /api/users/followers
exports.followers = {
    auth: 'jwt',
    handler: (request, reply) => {

        const user_id = request.auth.credentials.user_id;

        User.findById(user_id)
            .populate('followers', '-password')
            .exec(function (err, user) {
                if (err) {
                    return reply(Boom.badRequest());
                }
                return reply(user.followers);
            });
    }
};


// [GET] /api/users/following
exports.following = {
    auth: 'jwt',
    handler: (request, reply) => {

        const user_id = request.auth.credentials.user_id;

        User.findById(user_id)
            .populate('following', '-password')
            .exec(function (err, user) {
                if (err) {
                    return reply(Boom.badRequest());
                }
                return reply(user.following);
            });
    }
};


// [GET] /api/users/me
exports.getMe = {
    auth: 'jwt',
    handler: (request, reply) => {

        const user_id = request.auth.credentials.user_id;

        User.findById(user_id, (err, user) => {
            if (err) {
                return reply(Boom.badRequest());
            } else {
                return reply(user);
            }
        });
    }
};


// [GET] /api/users/search
exports.searchUsers = {
    auth: 'jwt',
    handler: (request, reply) => {
        
        const user_id = request.auth.credentials.user_id;

        // const regexQuery = '^.*( |\\b)'+request.query.q+'( |\\b).*$';
        const regexQuery = request.query.q;
        User.find({name: new RegExp(regexQuery, 'i'), _id: { $ne: user_id }})
            .select('-groups -adminPages -memberPages -following -followers -posts -email -isVerified')
            .exec(function(err, users) {
                if(err) {
                    return reply(Boom.badRequest());
                }
                else {
                    return reply(users);
                }
            });
    }
};


// [GET] /api/users/{user_id}
exports.getUser = {
    auth: 'jwt',
    handler: (request, reply) => {

        const my_user_id = request.auth.credentials.user_id;
        const user_id = request.params.user_id;

        User.findById(my_user_id, (err, me) => {

            if (err) {
                return reply(Boom.internal('Error retrieving user'));
            }

            User.findById(user_id)
                .populate('posts', null, { private: false })
                .exec(function (err, user) {
                    if (err) {
                        return reply(Boom.badRequest());
                    }
                    else if (me.following.indexOf(user_id) > -1) {
                        return reply({level: 'following', user: user});
                    }
                    else {
                        return reply({level: 'notFollowing', user: user});
                    }
                });
        });
    }
};


// [POST] /api/users
exports.register = {
    validate: {
        payload: {
            name: Joi.string().min(1).max(30).required(),
            email: Joi.string().email().required(),
            password: Joi.string().min(1).max(80).required()
        }
    },
    handler: (request, reply) => {

        const name = request.payload.name;
        const email = request.payload.email;
        const password = request.payload.password;

        Bcrypt.genSalt(10, (err, salt) => {
            if (err) {
                return reply({error:'Sign up unsuccessful. Try again later.'});
            }
            Bcrypt.hash(password, salt, (err, hash) => {
                if (err) {
                    return reply({error:'Invalid Sign Up Information'});
                }
                // create new user
                let user = new User({
                    email: email,
                    password: hash,
                    name: name
                });
                user.save((err, user) => {
                    if (!err) {
                        let tokenData = {
                            user_id: user._id
                        };
                        let token = Jwt.sign(tokenData, _privateKey);
                        try {
                            let templateFile = MailService.getMailTemplate('./src/mail/register.ejs');
                            MailService.sendEmail('Verify your email address', templateFile, user.email, {token: token});
                            return reply({token: token, user_id: user._id});
                        } catch (e) {
                            return reply({error:'Sign up unsuccessful. Try again later.'});
                        }         
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
            password: Joi.string().min(1).max(80).required()
        }
    },
    handler: (request, reply) => {
        
        const email = request.payload.email;
        const password = request.payload.password;

        User.findOne({email: email})
            .select('+password -groups -adminPages -memberPages -following -followers -posts -email')
            .exec((err, user) => {
                if (err) {
                    return reply({error:'Incorrect Login Information (1)'});
                } else if (user && user.isVerified) {
                    Bcrypt.compare(password, user.password, (err, res) => {
                        if (err) {
                            return reply({error:'Incorrect Login Information'});
                        }
                        else if (res) {
                            let tokenData = {
                                user_id: user._id
                            };
                            let token = Jwt.sign(tokenData, _privateKey);
                            return reply({token: token, user_id: user._id});
                        } 
                        else {
                            return reply({error:'Incorrect Login Information (2)'});
                        }
                    });
                } else if (user && !user.isVerified) {
                    return reply({error:'Email Address Verification Required'});
                } else {
                    return reply({error:'Incorrect Login Information (3)'});
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
        
        const oldPassword = request.payload.oldPassword;
        const newPassword = request.payload.newPassword;
        const confirmNewPassword = request.payload.confirmNewPassword;

        if (newPassword != confirmNewPassword) {
            return reply(Boom.badRequest('Bad credentials'));
        } else {

            const user_id = request.auth.credentials.user_id;

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
                                            user.save((err) => {
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


// [PUT] /api/users/follow/{user_id}
exports.followUser = {
    auth: 'jwt',
    handler: (request, reply) => {

        const user_id = request.auth.credentials.user_id;
        const followed_user_id = request.params.user_id;
        
        User.findById(user_id, (err, user) => {

            if (err) {
                return reply(Boom.internal('Error retrieving user'));
            }

            user.following.push(followed_user_id);

            User.findById(followed_user_id, (err, followed_user) => {

                if (err) {
                    return reply(Boom.badRequest());
                } 

                followed_user.followers.push(user_id);

                user.save();
                followed_user.save();

                return reply({message:'success'});
            });
        });
    }
};


// [PUT] /api/users/me
exports.updateMe = {
    auth: 'jwt',
    validate: {
        payload: {
            name: Joi.string().required(),
            bio: Joi.string()
        }
    },
    handler: (request, reply) => {

        const user_id = request.auth.credentials.user_id;

        const update = {
            name: request.payload.name,
            bio: request.payload.bio
        };

        User.findByIdAndUpdate(user_id, {$set:update}, (err) => {
            if (err) {
                return reply(Boom.badRequest());
            }
            return reply({message: 'success'});
        });
    }
};


// [PUT] /api/users/unfollow/{user_id}
exports.unfollowUser = {
    auth: 'jwt',
    handler: (request, reply) => {

        const user_id = request.auth.credentials.user_id;
        const unfollowed_user_id = request.params.user_id;
        
        User.findById(user_id, (err, user) => {

            if (err) {
                return reply(Boom.internal('Error retrieving user'));
            }

            user.following.pull({_id: unfollowed_user_id});

            User.findById(unfollowed_user_id, (err, unfollowed_user) => {

                if (err) {
                    return reply(Boom.badRequest());
                } 

                unfollowed_user.followers.pull({_id: user_id});

                user.save();
                unfollowed_user.save();

                return reply({message:'success'});
            });
        });
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
