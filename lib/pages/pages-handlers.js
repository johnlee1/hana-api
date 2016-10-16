'use strict';


const Joi = require('joi');
const Boom = require('boom');

const Page = require('./pages-model');
const User = require('../users/users-model');


// [POST] api/pages
exports.createPage = {   
	auth: 'jwt',
	validate: {
        payload: {
            name: Joi.string().required(),
            description: Joi.string().required()
        }
    },
	handler: (request, reply) => {

        let user_id = request.auth.credentials.user_id;

        User.findById(user_id, (err, user) => {

            if (err) {
                return reply(Boom.internal('Error retrieving user'));
            }

            // create page
            let name = request.payload.name;
            let description = request.payload.description;
            let page = new Page({
                name: name,
                description: description,
            });
            page.admins.push(user_id);

            page.save((err, page) => {
                if (err) {
                    return reply(Boom.badRequest());
                }
                // update user's admin pages
                user.adminPages.push(page._id);
                user.save();    
                return reply(page);
            }) 
        });
	}
};


// [GET] /api/pages/me
exports.getPages = {
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


// [GET] /api/pages/{page_id}
exports.getPage = {
    auth: 'jwt',
    handler: (request, reply) => { 

        let user_id = request.auth.credentials.user_id;
        let page_id = request.params.page_id;

        Page.findById(page_id)
            .populate('posts')
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
            })
    }
};


// [GET] /api/pages/search
exports.searchPages = {
    auth: 'jwt',
    handler: (request, reply) => {
        
        Page.find({name: new RegExp(request.query.q,'i')}, function(err, pages) {
            if (err) {
                return reply(Boom.badRequest());
            }
            else {
                return reply(pages);
            }
        })  
    }
};


// [PUT] /api/pages/follow/{page_id}
exports.followPage = {
    auth: 'jwt',
    handler: (request, reply) => {

        let user_id = request.auth.credentials.user_id;
        let page_id = request.params.page_id;
        
        User.findById(user_id, (err, user) => {

            if (err) {
                return reply(Boom.internal('Error retrieving user'));
            }

            user.memberPages.push(page_id);

            Page.findById(page_id, (err, page) => {

                if (err) {
                    return reply(Boom.badRequest());
                } 

                page.followers.push(user_id);

                user.save();
                page.save();

                return reply({level:'follower'});
            }) 
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

            if (err) {
                return reply(Boom.internal('Error retrieving user'));
            }

            user.memberPages.pull({_id: page_id});

            Page.findById(page_id, (err, page) => {

                if (err) {
                    return reply(Boom.badRequest());
                } 

                page.followers.pull({_id: user_id});

                user.save();
                page.save();

                return reply({level:'none'});
            }) 
        });
    }
};