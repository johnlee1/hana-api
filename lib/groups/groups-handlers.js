'use strict';


const Joi = require('joi');
const Boom = require('boom');

const Group = require('./groups-model');
const User = require('../users/users-model');


// [POST] api/groups
exports.createGroup = {   
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

            // create group
            let name = request.payload.name;
            let description = request.payload.description;
            let group = new Group({
                name: name,
                description: description,
            });
            group.admins.push(user_id);

            group.save((err, group) => {
                if (err) {
                    return reply(Boom.badRequest());
                }
                // update user's admin pages
                user.adminGroups.push(group._id);
                user.save();    
                return reply(group);
            }) 
        });
	}
};


// [GET] /api/groups/me
exports.getGroups = {
    auth: 'jwt',
    handler: (request, reply) => {

        let user_id = request.auth.credentials.user_id;

        User.findById(user_id)
            .populate('adminGroups memberGroups')
            .exec(function (err, user) {
                if (err) {
                    return reply(Boom.badRequest());
                }
                let groups = {
                	adminGroups: user.adminGroups, 
                	memberGroups: user.memberGroups
                };
                return reply(groups);
            });
    }
};


// [GET] /api/groups/{group_id}
exports.getGroup = {
    auth: 'jwt',
    handler: (request, reply) => { 

        let user_id = request.auth.credentials.user_id;
        let group_id = request.params.group_id;

        Group.findById(group_id, (err, group) => {

            if (err) {
                return reply(Boom.badRequest());
            } 
            else if (group.admins.indexOf(user_id) > -1) {
                return reply({level: 'admin', group: group});
            } 
            else if (group.members.indexOf(user_id) > -1) {
                return reply({level: 'members', group: group});
            } 
            else { 
                return reply({level: 'notAllowed', group: group});
            }
        }) 
    }
};


// [PUT] /api/groups/{group_id}
exports.updateGroup = {
    auth: 'jwt',
    handler: (request, reply) => { 

        let user_id = request.auth.credentials.user_id;
        let group_id = request.params.group_id;

        Group.findById(group_id, (err, group) => {

            if (err) {
                return reply(Boom.badRequest());
            } 

            let name = request.payload.name;
            let description = request.payload.description;

            group.name = name;
            group.description = description;
            group.save();
        }) 
    }
};


// [PUT] /api/groups/leave/{group_id}
exports.leaveGroup = {
    auth: 'jwt',
    handler: (request, reply) => { 

        let user_id = request.auth.credentials.user_id;
        let group_id = request.params.group_id;

        User.findById(user_id, (err, user) => {

            if (err) {
                return reply(Boom.internal('Error retrieving user'));
            }

            let adminIndex = user.adminGroups.indexOf(user_id);
            let memberIndex = user.memberGroups.indexOf(member_id);

            // remove group reference from user
            if (adminIndex > -1) {
                user.adminGroups.splice(adminIndex, 1);
            } 
            if (memberIndex > -1) {
                user.memberGroups.splice(memberIndex, 1);
            } 

            Group.findById(group_id, (err, group) => {

                if (err) {
                    return reply(Boom.badRequest());
                } 

                let adminIndex = group.admins.indexOf(user_id);
                let memberIndex = group.members.indexOf(user_id);

                // remove user reference from group
                if (adminIndex > -1) {
                    group.admins.splice(adminIndex, 1);
                } 
                if (memberIndex > -1) {
                    group.members.splice(memberIndex, 1);
                } 

                user.save();
                group.save();
                return reply({msg: 'success'});
            }) 
        })
    }
};