'use strict';


const Joi = require('joi');
const Boom = require('boom');

const Profile = require('./profiles-model');
const User = require('../users/users-model');


// [GET] /api/profile/search
exports.searchProfiles = {
    auth: 'jwt',
    handler: (request, reply) => {
        
        let profile_id = request.auth.credentials.profile_id;
        
        Profile.find({name: new RegExp(request.query.q,'i'), _id: { $ne: profile_id }}, function(err, profiles) {
            if(err) {
                return reply(Boom.badRequest());
            }
            else {
                return reply(profiles);
            }
        })  
    }
};


// [PUT] /api/profiles/follow/{profile_id}
exports.followProfile = {
    auth: 'jwt',
    handler: (request, reply) => {

        let user_id = request.auth.credentials.user_id;
        let followed_profile_id = request.params.profile_id;
        
        User.findById(user_id, (err, user) => {

            if (err) {
                return reply(Boom.internal('Error retrieving user'));
            }

            user.following.push(followed_profile_id);

            Profile.findById(followed_profile_id, (err, followed_profile) => {

                if (err) {
                    return reply(Boom.badRequest());
                } 

                followed_profile.followers.push(user_id);

                user.save();
                followed_profile.save();

                return reply({message:'success'});
            }) 
        });
    }
};


// [PUT] /api/profiles/unfollow/{profile_id}
exports.unfollowProfile = {
    auth: 'jwt',
    handler: (request, reply) => {

        let user_id = request.auth.credentials.user_id;
        let unfollowed_profile_id = request.params.profile_id;
        
        User.findById(user_id, (err, user) => {

            if (err) {
                return reply(Boom.internal('Error retrieving user'));
            }

            user.following.pull({_id: unfollowed_profile_id});

            Profile.findById(unfollowed_profile_id, (err, unfollowed_profile) => {

                if (err) {
                    return reply(Boom.badRequest());
                } 

                unfollowed_profile.following.pull({_id: user_id});

                user.save();
                unfollowed_profile.save();

                return reply({message:'success'});
            }) 
        });
    }
};


// [GET] /api/profiles/following
exports.following = {
    auth: 'jwt',
    handler: (request, reply) => {

        let user_id = request.auth.credentials.user_id;

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


// [GET] /api/profiles/me
exports.getMyProfile = {
    auth: 'jwt',
    handler: (request, reply) => {

        let profile_id = request.auth.credentials.profile_id;

        Profile.findById(profile_id, (err, profile) => {
            if (err) {
                return reply(Boom.badRequest());
            } else {
                return reply(profile);
            }
        })
    }
};


// [PUT] /api/profiles/me
exports.updateMyProfile = {
    auth: 'jwt',
    validate: {
        payload: {
            name: Joi.string().required(),
            bio: Joi.string()
        }
    },
    handler: (request, reply) => {

        let profile_id = request.auth.credentials.profile_id

        let update = {
            name: request.payload.name,
            bio: request.payload.bio
        };

        Profile.findByIdAndUpdate(profile_id, {$set:update}, (err, profile) => {
            if (err) {
                return reply(Boom.badRequest());
            }
            return reply({message: 'success'});
        })  
    }
};


// [GET] /api/profiles/{profile_id}
exports.getProfile = {
    auth: 'jwt',
    handler: (request, reply) => {
        console.log('whatever');
        let user_id = request.auth.credentials.user_id;
        let profile_id = request.params.profile_id;

        User.findById(user_id, (err, me) => {

            if (err) {
                return reply(Boom.internal('Error retrieving profile'));
            }

            Profile.findById(profile_id)
                .populate('posts', null, { private: false })
                .exec(function (err, profile) {
                    if (err) {
                        return reply(Boom.badRequest());
                    }
                    else if (me.following.indexOf(profile_id) > -1) {
                        return reply({level: "following", profile: profile});
                    }
                    else {
                        return reply({level: "notFollowing", profile: profile});
                    }
                });
        });
    }
};