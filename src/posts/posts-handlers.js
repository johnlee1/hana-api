'use strict';

const Boom = require('boom');
const Joi  = require('joi');

const Group = require('../groups/groups-model');
const Page  = require('../pages/pages-model');
const Post  = require('./posts-model');
const User  = require('../users/users-model');
const Queries = require('../utils/queries');


// [GET] /api/posts/me
exports.getPosts = {
    auth: 'jwt',
    handler: (request, reply) => {
        
        const user_id = request.auth.credentials.user_id;

        User.findById(user_id)
            .populate({path: 'posts', options: { sort: { 'create_date': -1 } }})
            .exec(function (err, user) {
                if (err) 
                    return reply(Boom.badRequest());

                return reply(user);
            });
    }
};


// [GET] /api/posts/{user_id}
exports.getUserPosts = {
    auth: 'jwt',
    handler: async (request, reply) => {

        const user_id = request.params.user_id;

        let user = await Queries.getUserWithPosts(user_id);
        if (user === "error")
            return reply(Boom.badRequest());

        return reply(user);
    }
};


// [GET] /api/posts/{post_id}
exports.getPost = {
    auth: 'jwt',
    handler: (request, reply) => { 

        const post_id = request.params.post_id;

        Post.findById(post_id, (err, post) => {
            if (err) 
                return reply(Boom.badRequest());

            return reply(post);
        });
    }
};


// [POST] /api/posts
exports.createPost = {   
    auth: 'jwt',
    validate: {
        payload: {
            id: Joi.string().required(), // page id
            prayer: Joi.string().required(),
            resolution: Joi.string().required(),
            resolved: Joi.boolean().required(),
            story: Joi.string().required(),
            subject: Joi.string().required(),
            urgent: Joi.boolean().required(),
        }
    },
    handler: async (request, reply) => {

        const id = request.payload.id;
        const user_id = request.auth.credentials.user_id;
        
        let page = await Queries.getPage(id);
        if (page === "error")
            return reply(Boom.badRequest());

        let post = new Post({
            subject: request.payload.subject,
            story: request.payload.story,
            prayer: request.payload.prayer,
            resolved: request.payload.resolved,
            resolution: request.payload.resolution,
            urgent: request.payload.urgent,
            userId: user_id
        });

        post.save((err, post) => {
            if (err)
                return reply(Boom.badRequest());

            page.posts.push(post._id);
            page.save();
            return reply({message: 'success'});
        });
    }
};


// [PUT] /api/posts/{post_id}
exports.updatePost = {
    auth: 'jwt',
    validate: {
        payload: {
            prayer: Joi.string().required(),
            private: Joi.boolean().required(),
            public: Joi.boolean(),
            resolution: Joi.string().required(),
            resolved: Joi.boolean().required(),
            story: Joi.string().required(),
            subject: Joi.string().required(),
            urgent: Joi.boolean().required(),
        }
    },
    handler: (request, reply) => { 

        const post_id = request.params.post_id;
        const update = {
            prayer: request.payload.prayer,
            private: request.payload.private,
            resolution: request.payload.resolution,
            resolved: request.payload.resolved,
            story: request.payload.story,
            subject: request.payload.subject,
            urgent: request.payload.urgent,
        };

        Post.findByIdAndUpdate(post_id, {$set:update}, (err) => {
            if (err) 
                return reply(Boom.badRequest());

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

        User.findById(user_id, 'posts', (err, user) => {
            if (err) 
                return reply(Boom.badRequest());

            user.posts.pull({_id: post_id});
            user.save();

            Post.findByIdAndRemove(post_id, (err) => {
                if (err) 
                    return reply(Boom.badRequest());

                return reply({message: 'success'});
            });
        });
    }
};
