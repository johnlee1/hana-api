'use strict';

const Boom = require('boom');
const Joi = require('joi');

const List = require('./lists-model');
const Post = require('../posts/posts-model');
const User = require('../users/users-model');
const Queries = require('../utils/queries');


// [GET] /api/lists/me
exports.getLists = {
    auth: 'jwt',
    handler: async (request, reply) => {

        let user_id = request.auth.credentials.user_id;

        let user = await Queries.getUserWithLists(user_id);
        if (user === "error")
            return reply(Boom.badRequest());
        
        return reply(user.lists);
    }
};


// [GET] /api/lists/{list_id}
exports.getList = {
    auth: 'jwt',
    handler: (request, reply) => { 

        let user_id = request.auth.credentials.user_id;
        let list_id = request.params.list_id;

        List.findById(list_id)
            .populate({path: 'posts', options: {sort: { 'create_date': -1} }})
            .exec((err, list) => {
                if (err) {
                    return reply(Boom.badRequest());
                } 
                else { 
                    return reply(list);
                }                
            });
    }
};


// [POST] api/lists
exports.createList = {
    auth: 'jwt',
    validate: {
        payload: {
            name: Joi.string().required()
        }
    },
    handler: async(request, reply) => {

        let user_id = request.auth.credentials.user_id;

        let user = await Queries.getUser(user_id);
        if (user === "error")
            return reply(Boom.badRequest());

        // create list
        let name = request.payload.name;
        let list = new List({
            name: name,
        });

        list.save((err, list) => {
            if (err)
                return reply(Boom.badRequest());
            // update user's lists
            user.lists.push(list._id);
            user.save();    
            return reply(list);
        });
    }
};


// [PUT] /api/lists/addPost/{list_id}
exports.addPost = {
    auth: 'jwt',    
    validate: {
        payload: {
            post_id: Joi.string().required()
        }
    },
    handler: async (request, reply) => {

        let user_id = request.auth.credentials.user_id;
        let list_id = request.params.list_id;

        let list = await Queries.getList(list_id);
        if (list === "error")
            return reply(Boom.badRequest());

        const post_id = request.payload.post_id;

        list.posts.push(post_id);
        list.save((err) => {
            if (err)
                return reply(Boom.badRequest());
            else
                return reply(list);
        });
    }
};


// [PUT] /api/lists/removePost/{list_id}
exports.removePost = {
    auth: 'jwt',    
    validate: {
        payload: {
            post_id: Joi.string().required()
        }
    },
    handler: async (request, reply) => {

        let user_id = request.auth.credentials.user_id;
        let list_id = request.params.list_id;

        let list = await Queries.getList(list_id);
        if (list === "error")
            return reply(Boom.badRequest());

        const post_id = request.payload.post_id;

        // Find the index of the post in the list.
        const index = list.posts.indexOf(post_id);
        if (index != -1) {
            // Remove 1 element from index location.
            list.posts.splice(index, 1);
        }

        list.save((err) => {
            if (err)
                return reply(Boom.badRequest());
            else
                return reply(list);
        });
    }
};


// [PUT] /api/lists/{list_id}
exports.updateList = {
    auth: 'jwt',    
    validate: {
        payload: {
            name: Joi.string().required()
        }
    },
    handler: async (request, reply) => {

        let user_id = request.auth.credentials.user_id;
        let list_id = request.params.list_id;

        let list = await Queries.getList(list_id);
        if (list === "error")
            return reply(Boom.badRequest());

        list.name = request.payload.name;
        list.save((err) => {
            if (err)
                return reply(Boom.badRequest());
            else
                return reply({message: 'success'});
        });
    }
};
