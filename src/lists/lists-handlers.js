'use strict';

const Boom = require('boom');
const Joi = require('joi');

const Page = require('./lists-model');
const User = require('../users/users-model');
const Queries = require('../queries/queries');


// [GET] /api/lists/me
exports.getLists = {
    auth: 'jwt',
    handler: (request, reply) => {

        let user_id = request.auth.credentials.user_id;

        User.findById(user_id)
            .populate('adminPages memberPages')
            .exec(function (err, user) {
                if (err) {
                    return reply(Boom.badRequest());
                }
                let pages = {
                    adminPages: user.adminPages, 
                    memberPages: user.memberPages
                };
                return reply(pages);
            });
    }
};


// [GET] /api/lists/{list_id}
exports.getList = {
    auth: 'jwt',
    handler: (request, reply) => { 

        let user_id = request.auth.credentials.user_id;
        let page_id = request.params.page_id;

        Page.findById(page_id)
            .populate({path: 'posts', options: {sort: { 'create_date': -1} }})
            .exec((err, page) => {
                if (err) {
                    return reply(Boom.badRequest());
                } 
                else if (page.admins.indexOf(user_id) > -1) {
                    return reply({level: 'admin', page: page});
                } 
                else if (page.followers.indexOf(user_id) > -1) {
                    return reply({level: 'follower', page: page});
                } 
                else { 
                    return reply({level: 'none', page: page});
                }                
            });
    }
};


// [POST] api/lists
exports.createList = {   
    auth: 'jwt',
    validate: {
        payload: {
            name: Joi.string().required(),
            description: Joi.string().required()
        }
    },
    handler: (request, reply) => {

        let user_id = request.auth.credentials.user_id;

        let user = await Queries.getUser(user_id);
        if (user === "error")
            return reply(Boom.badRequest());

        // create page
        let name = request.payload.name;
        let description = request.payload.description;
        let page = new Page({
            name: name,
            description: description,
        });
        page.admins.push(user_id);

        page.save((err, page) => {
            if (err)
                return reply(Boom.badRequest());

            // update user's admin pages
            user.adminPages.push(page._id);
            user.save();    
            return reply(page);
        });
    }
};


// [PUT] /api/lists/{list_id}
exports.updateList = {
    auth: 'jwt',    
    validate: {
        payload: {
            name: Joi.string().required(),
            description: Joi.string().required()
        }
    },
    handler: (request, reply) => {

        let user_id = request.auth.credentials.user_id;
        let list_id = request.params.list_id;

        let list = await Queries.getList(list_id);
        if (list === "error")
            return reply(Boom.badRequest());

        list.name = request.payload.name;
        list.description = request.payload.description;
        list.save((err) => {
            if (err)
                return reply(Boom.badRequest());
            else
                return reply({message: 'success'});
        });
    }
};
