'use strict';


const Joi  = require('joi');
const Boom = require('boom');

const Post    = require('./posts-model');
const User    = require('../users/users-model');
const Page    = require('../pages/pages-model');
const Group   = require('../groups/groups-model');
const Profile = require('../profiles/profiles-model');


// [POST] /api/posts
exports.createPost = {   
    auth: 'jwt',
    validate: {
        payload: {
            subject: Joi.string().required(),
            story: Joi.string().required(),
            prayer: Joi.string().required()
        }
    },
    handler: (request, reply) => {

        let profile_id = request.auth.credentials.profile_id;

        Profile.findById(profile_id, (err, profile) => {

            if (err) {

                return reply(Boom.internal('Error retrieving user'));
            }

            // create post
            let subject = request.payload.subject;
            let story = request.payload.story;
            let prayer = request.payload.prayer;
            let post = new Post({
                subject: subject,
                story: story,
                prayer: prayer
            });

            post.save((err, post) => {
                if (err) {
                    return reply(Boom.badRequest());
                }
                // update profile's posts
                profile.posts.push(post._id);
                profile.save();    
                return reply({message: 'success'});
            }) 
        });
    }
};


// [GET] /api/posts/me
exports.getPosts = {
    auth: 'jwt',
    handler: (request, reply) => {
        console.log('made it to getPosts function');
        let profile_id = request.auth.credentials.profile_id;

        Profile.findById(profile_id)
            .populate('posts')
            .exec(function (err, profile) {
                if (err) {
                    return reply(Boom.badRequest());
                }
                console.log('going to return posts');
                return reply(profile);
            });
    }
};


// [GET] /api/posts/{profile_id}
exports.getProfilePosts = {
    auth: 'jwt',
    handler: (request, reply) => {

        let profile_id = request.params.profile_id;

        Profile.findById(profile_id)
            .populate('posts')
            .exec(function (err, profile) {
                if (err) {
                    return reply(Boom.badRequest());
                }
                return reply(profile.posts);
            });
    }
};


// [GET] /api/posts/{post_id}
exports.getPost = {
    auth: 'jwt',
    handler: (request, reply) => { 

        let post_id = request.params.post_id

        Post.findById(post_id, (err, post) => {
            if (err) {
                return reply(Boom.badRequest());
            }
            return reply(post);
        })  
    }
};


// [PUT] /api/posts/{post_id}
exports.updatePost = {
    auth: 'jwt',
    validate: {
        payload: {
            subject: Joi.string().required(),
            story: Joi.string().required(),
            prayer: Joi.string().required()
        }
    },
    handler: (request, reply) => { 

        let post_id = request.params.post_id
        let update = {
            subject: request.payload.subject,
            story: request.payload.story,
            prayer: request.payload.prayer
        };

        Post.findByIdAndUpdate(post_id, {$set:update}, (err, post) => {
            if (err) {
                return reply(Boom.badRequest());
            }
            return reply({message: 'success'});
        })  
    }
};


// [DELETE] /api/posts/{post_id}
exports.deletePost = {
    auth: 'jwt',
    handler: (request, reply) => { 

        let profile_id = request.auth.credentials.profile_id;
        let post_id = request.params.post_id

        // find profile and delete reference to post 
        Profile.findById(profile_id, 'posts', (err, profile) => {
            if (err) {
                return reply(Boom.badRequest());
            }
            profile.posts.pull({_id: post_id});
            profile.save();

            // find post and delete post
            Post.findByIdAndRemove(post_id, (err, post) => {
                if (err) {
                    return reply(Boom.badRequest());
                }
                return reply({message: 'success'});
            });
        });
    }
};


// [POST] /api/posts/page/{page_id}
exports.createPagePost = {   
    auth: 'jwt',
    validate: {
        payload: {
            subject: Joi.string().required(),
            story: Joi.string().required(),
            prayer: Joi.string().required()
        }
    },
    handler: (request, reply) => {
        
        let profile_id = request.auth.credentials.profile_id;
        let page_id = request.params.page_id;

        Profile.findById(profile_id, (err, profile) => {

            let authorName = profile.name;

            if (err) {

                return reply(Boom.internal('Error retrieving user'));
            }

            // create post
            let subject = request.payload.subject;
            let story = request.payload.story;
            let prayer = request.payload.prayer;
            let post = new Post({
                subject: subject,
                story: story,
                prayer: prayer,
                author: authorName
            });

            Page.findById(page_id, (err, page) => {

                if (err) {
                    return reply(Boom.badRequest());
                }

                post.save((err, post) => {
                    if (err) {
                        return reply(Boom.badRequest());
                    }

                    // update profile's posts
                    page.posts.push(post);
                    page.save();    
                    return reply({message: 'success'});
                }) 
            });
        });
    }
};


// [POST] /api/posts/group/{group_id}
exports.createGroupPost = {   
    auth: 'jwt',
    validate: {
        payload: {
            subject: Joi.string().required(),
            story: Joi.string().required(),
            prayer: Joi.string().required()
        }
    },
    handler: (request, reply) => {
        
        let profile_id = request.auth.credentials.profile_id;
        let group_id = request.params.page_id;

        Profile.findById(profile_id, (err, profile) => {

            let authorName = profile.name;

            if (err) {

                return reply(Boom.internal('Error retrieving user'));
            }

            // create post
            let subject = request.payload.subject;
            let story = request.payload.story;
            let prayer = request.payload.prayer;
            let post = new Post({
                subject: subject,
                story: story,
                prayer: prayer,
                author: authorName
            });

            Group.findById(group_id, (err, group) => {

                if (err) {
                    return reply(Boom.badRequest());
                }

                post.save((err, post) => {
                    if (err) {
                        return reply(Boom.badRequest());
                    }

                    // update profile's posts
                    group.posts.push(post);
                    group.save();    
                    return reply({message: 'success'});
                }) 
            });
        });
    }
};