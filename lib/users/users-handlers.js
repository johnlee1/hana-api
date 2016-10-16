'use strict';


const Joi = require('joi');
const Boom = require('boom');
const Bcrypt = require('bcrypt');
const Moment = require('moment');
const Jwt = require('jsonwebtoken');

const User = require('./users-model');
const Profile = require('../profiles/profiles-model');
// const Parameters = require('../../config/parameters');
const MailService = require('../mail/mail');

const _privateKey = process.env.JWT_PRIVATE_KEY;


exports.test = {
    handler: (request,reply) => {
        console.log("noway");
        return reply('ecs updated!! :)');
    }
}

// [POST] /api/user
exports.register = {
    validate: {
        payload: {
            name: Joi.string().required(),
            email: Joi.string().email().required(),
            password: Joi.string().required()
        }
    },
    handler: (request, reply) => {

        let name = request.payload.name;
        let email = request.payload.email;
        let password = request.payload.password;

        Bcrypt.genSalt(10, (err, salt) => {

            if (err) {
                return reply(Boom.internal());
            }
            Bcrypt.hash(password, salt, (err, hash) => {

                if (err) {
                    return reply(Boom.internal());
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
                                    MailService.sendHtmlEmail('Welcome to the Prayer App', templateFile, user.email, {token: token});
                                    return reply({token: token});
                                } catch (e) {
                                    return reply(Boom.internal());
                                }
                            } else {
                                return reply(Boom.forbidden(err));
                            }
                        });
                    } else {
                        return reply(Boom.forbidden(err));
                    }
                });
            });
        });
    }
};


// GET /api/user/confirm/{token}
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
                                        return reply({message: "success", token: token});
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


// [POST] /api/user/login
exports.login = {
    validate: {
        payload: {
            email: Joi.string().email().required(),
            password: Joi.string().required()
        }
    },
    handler: (request, reply) => {
        
        let email = request.payload.email;
        let password = request.payload.password;

        User.findOne({email: email}, (err, user) => {
            
            if (err) {
                return reply(Boom.internal('Error retrieving user'));
            }
            if (user && user.isVerified) {

                Bcrypt.compare(password, user.password, (err, res) => {

                    if (err) {
                        return reply(Boom.internal('Bcrypt comparison error'));
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
};