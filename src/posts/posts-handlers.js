'use strict';


const Boom = require('boom');
const Joi  = require('joi');

const Group = require('../groups/groups-model');
const Page  = require('../pages/pages-model');
const Post  = require('./posts-model');
const User  = require('../users/users-model');


// [GET] /api/posts/me
exports.getPosts = {
    auth: 'jwt',
    handler: (request, reply) => {
        
        const user_id = request.auth.credentials.user_id;

        User.findById(user_id)
            .populate({path: 'posts', options: { sort: { 'create_date': -1 } }})
            .exec(function (err, user) {
                if (err) {
                    return reply(Boom.badRequest());
                }
                return reply(user);
            });
    }
};


// [GET] /api/posts/{user_id}
exports.getUserPosts = {
    auth: 'jwt',
    handler: (request, reply) => {

        const user_id = request.params.user_id;

        User.findById(user_id)
            .populate('posts')
            .exec(function (err, user) {
                if (err) {
                    return reply(Boom.badRequest());
                }
                return reply(user.posts);
            });
    }
};


// [GET] /api/posts/{post_id}
exports.getPost = {
    auth: 'jwt',
    handler: (request, reply) => { 

        const post_id = request.params.post_id;

        Post.findById(post_id, (err, post) => {
            if (err) {
                return reply(Boom.badRequest());
            }
            return reply(post);
        });
    }
};


// [POST] /api/posts
exports.createPost = {   
    auth: 'jwt',
    validate: {
        payload: {
            subject: Joi.string().required(),
            story: Joi.string().required(),
            prayer: Joi.string().required(),
            private: Joi.boolean().required()
        }
    },
    handler: (request, reply) => {

        const user_id = request.auth.credentials.user_id;

        User.findById(user_id, (err, user) => {

            if (err) {

                return reply(Boom.internal('Error retrieving user'));
            }

            // create post
            const subject = request.payload.subject;
            const story = request.payload.story;
            const prayer = request.payload.prayer;
            const privat = request.payload.private;
            const post = new Post({
                subject: subject,
                story: story,
                prayer: prayer,
                user: user_id,
                private: privat
            });

            post.save((err, post) => {
                if (err) {
                    return reply(Boom.badRequest());
                }
                // update user's posts
                user.posts.push(post._id);
                user.save();    
                return reply({message: 'success'});
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
        
        let user_id = request.auth.credentials.user_id;
        let group_id = request.params.page_id;

        User.findById(user_id, (err, user) => {

            const authorName = user.name;

            if (err) 
                return reply(Boom.internal('Error retrieving user'));

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

                if (err)
                    return reply(Boom.badRequest());

                post.save((err, post) => {
                    if (err) {
                        return reply(Boom.badRequest());
                    }

                    group.posts.push(post);
                    group.save();    
                    return reply({msg: 'success'});
                });
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
        
        const user_id = request.auth.credentials.user_id;
        const page_id = request.params.page_id;

        User.findById(user_id, (err, user) => {

            let authorName = user.name;

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

                    // update user's posts
                    page.posts.push(post);
                    page.save();    
                    return reply({message: 'success'});
                });
            });
        });
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

        const post_id = request.params.post_id;
        const update = {
            subject: request.payload.subject,
            story: request.payload.story,
            prayer: request.payload.prayer
        };

        Post.findByIdAndUpdate(post_id, {$set:update}, (err) => {
            if (err) {
                return reply(Boom.badRequest());
            }
            return reply({message: 'success'});
        });
    }
};


// [DELETE] /api/posts/{post_id}
exports.deletePost = {
    auth: 'jwt',
    handler: (request, reply) => { 

        const user_id = request.auth.credentials.user_id;
        const post_id = request.params.post_id;

        // find user and delete reference to post 
        User.findById(user_id, 'posts', (err, user) => {
            if (err) {
                return reply(Boom.badRequest());
            }
            user.posts.pull({_id: post_id});
            user.save();

            // find post and delete post
            Post.findByIdAndRemove(post_id, (err) => {
                if (err) {
                    return reply(Boom.badRequest());
                }
                return reply({message: 'success'});
            });
        });
    }
};
