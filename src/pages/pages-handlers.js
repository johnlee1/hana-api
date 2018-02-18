'use strict';

const Boom = require('boom');
const Joi = require('joi');

const Page = require('./pages-model');
const User = require('../users/users-model');
const Queries = require('../utils/queries');
const Utils = require('../utils/utils');


// [GET] /api/pages/me
exports.getPages = {
    auth: 'jwt',
    handler: (request, reply) => {

        let user_id = request.auth.credentials.user_id;

        User.findById(user_id)
            .populate('adminPages contributorPages memberPages')
            .exec(function (err, user) {
                if (err)
                    return reply(Boom.badRequest());

                let pages = {
                    adminPages: user.adminPages,
                    contributorPages: user.contributorPages,
                    memberPages: user.memberPages
                };
                return reply(pages);
            });
    }
};


// [GET] /api/pages/{page_id}
exports.getPage = {
    auth: {
        strategy: 'jwt',
        mode: 'try'
    }, 
    handler: (request, reply) => { 

        let user_id = request.auth.credentials != null ? request.auth.credentials.user_id : null;
        let page_id = request.params.page_id;

        Page.findById(page_id)
            .populate([{path: 'posts', options: {sort: { 'create_date': -1} }}, {path: 'admins'}, {path: 'contributors'}])
            .exec((err, page) => {
                if (err)
                    return reply(Boom.badRequest());
                else if (page.admins.filter(admin => admin._id == user_id).length > 0)
                    return reply({level: 'admin', page: page});
                else if (page.contributors.filter(contributor => contributor._id == user_id).length > 0)
                    return reply({level: 'contributor', page: page});
                else if (page.followers.indexOf(user_id) > -1)
                    return reply({level: 'follower', page: page});
                else
                    return reply({level: 'none', page: page});          
            });
    }
};


// [GET] /api/pages/{query}
exports.searchPages = {
    auth: {
        strategy: 'jwt',
        mode: 'try'
    },     
    handler: (request, reply) => {

        const query = request.params.query;

        Page.find({name: new RegExp(query,'i'), private: false}, function(err, pages) {
            if (err)
                return reply(Boom.badRequest());

            // const user_id = request.auth.credentials.user_id;
            // pages = pages.filter((page) => {
            //     !page.admins.includes(user_id) &&
            //     !page.contributors.includes(user_id) &&
            //     !page.followers.includes(user_id)
            // })

            return reply(pages);
        });
    }
};


// [POST] api/pages
exports.createPage = {   
    auth: 'jwt',
    validate: {
        payload: {
            name: Joi.string().required(),
            description: Joi.string().required(),
            private: Joi.string().required()
        }
    },
    handler: async (request, reply) => {
        console.log(request.payload);
        let user_id = request.auth.credentials.user_id;

        let user = await Queries.getUser(user_id);
        if (user === "error")
            return reply(Boom.badRequest());

        let page = new Page({
            name: request.payload.name,
            description: request.payload.description,
            private: request.payload.private != 'public',
            admin_code: Utils.guid(),
            contributor_code: Utils.guid()
        });
        page.admins.push(user_id);

        page.save((err, page) => {
            if (err)
                return reply(Boom.badRequest());

            user.adminPages.push(page._id);
            user.save();    
            return reply(page);
        });
    }
};


// [PUT] /api/pages/join/{page_id}/{page_code}
exports.joinPage = {
    auth: 'jwt',
    handler: async (request, reply) => {

        let user_id = request.auth.credentials.user_id;
        let page_id = request.params.page_id;
        let page_code = request.params.page_code;

        let user = await Queries.getUser(user_id);
        if (user === "error")
            return reply(Boom.badRequest());

        let page = await Queries.getPage(page_id);
        if (page === "error")
            return reply(Boom.badRequest());

        if (user.adminPages.includes(page_code) || user.contributorPages.includes(page_code))
            return reply({message: "already"});
        
        if (page_code === page.admin_code) {
            user.adminPages.push(page_id);
            page.admins.push(user_id);
            user.save();
            page.save();
        }

        if (page_code === page.contributor_code) {
            user.contributorPages.push(page_id);
            page.contributors.push(user_id)
            user.save();
            page.save();
        }

        return reply({message: "success"});
    }
};


// [PUT] /api/pages/follow/{page_id}
exports.followPage = {
    auth: 'jwt',
    handler: (request, reply) => {

        let user_id = request.auth.credentials.user_id;
        let page_id = request.params.page_id;
        
        User.findById(user_id, (err, user) => {

            if (err)
                return reply(Boom.internal('Error retrieving user'));

            user.memberPages.push(page_id);

            Page.findById(page_id, (err, page) => {

                if (err)
                    return reply(Boom.badRequest());

                page.followers.push(user_id);
                user.save();
                page.save();

                return reply({level:'follower'});
            });
        });
    }
};


// [PUT] /api/pages/unfollow/{page_id}
exports.unfollowPage = {
    auth: 'jwt',
    handler: (request, reply) => {

        let user_id = request.auth.credentials.user_id;
        let page_id = request.params.page_id;
        
        User.findById(user_id, (err, user) => {

            if (err)
                return reply(Boom.internal('Error retrieving user'));

            user.memberPages.pull({_id: page_id});

            Page.findById(page_id, (err, page) => {

                if (err) {
                    return reply(Boom.badRequest());
                } 

                page.followers.pull({_id: user_id});

                user.save();
                page.save();

                return reply({level:'none'});
            });
        });
    }
};


// [PUT] /api/pages/{page_id}
exports.updatePage = {
    auth: 'jwt',    
    validate: {
        payload: {
            name: Joi.string().required(),
            description: Joi.string().required()
        }
    },
    handler: (request, reply) => {

        let user_id = request.auth.credentials.user_id;
        let page_id = request.params.page_id;

        Page.findById(page_id, (err, page) => {
            let admins = page.admins.map((admin) => admin.toString());
            if (err)
                return reply(Boom.badRequest());
            else if (admins.includes(user_id)) {
                page.name = request.payload.name;
                page.description = request.payload.description;
                page.save((err) => {
                    if (err)
                        return reply(Boom.badRequest());
                    else
                        return reply({message: 'success'});
                });
            } else
                return reply(Boom.forbidden('You must be an admin to perform this action.'));
        });
    }
};
