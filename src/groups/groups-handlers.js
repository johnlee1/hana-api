'use strict';


const Boom = require('boom');
const Joi = require('joi');

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

        // create group
        const name = request.payload.name;
        const description = request.payload.description;
        const group = new Group({
            name: name,
            description: description,
        });
        const userIds = request.payload.memberIds;
        group.members.push.apply(group.members, userIds);

        group.save((err, group) => {
            if (err)
                return reply(Boom.badRequest());
            group.members.map((userId => {
                User.findById(userId, (err, user) => {
                    if (err) {
                        return reply(Boom.internal('Error retrieving user'));
                    }
                    user.groups.push(group._id);
                    user.save();
                });
            }));
            return reply(group);
        }); 
    }
};


// [GET] /api/groups/me
exports.getGroups = {
    auth: 'jwt',
    handler: (request, reply) => {

        const user_id = request.auth.credentials.user_id;

        User.findById(user_id)
            .populate('groups')
            .exec(function (err, user) {
                if (err)
                    return reply(Boom.badRequest());
                const groups = {
                    groups: user.goups, 
                };
                return reply(groups);
            });
    }
};


// [GET] /api/groups/{group_id}
exports.getGroup = {
    auth: 'jwt',
    handler: (request, reply) => { 

        const user_id = request.auth.credentials.user_id;
        const group_id = request.params.group_id;

        Group.findById(group_id, (err, group) => {

            if (err)
                return reply(Boom.badRequest());
            else if (group.members.indexOf(user_id) > -1)
                return reply({msg: 'member', group: group});
            else
                return reply({msg: 'notAllowed'});
        }); 
    }
};


// [PUT] /api/groups/{group_id}
exports.updateGroup = {
    auth: 'jwt',
    handler: (request, reply) => { 

        const group_id = request.params.group_id;

        Group.findById(group_id, (err, group) => {

            if (err)
                return reply(Boom.badRequest());

            const name = request.payload.name;
            const description = request.payload.description;

            group.name = name;
            group.description = description;
            group.save((err, group) => {
                if (err)
                    return reply(Boom.badRequest());
                else
                    return reply(group);
            });
        });
    }
};


// [PUT] /api/groups/leave/{group_id}
exports.leaveGroup = {
    auth: 'jwt',
    handler: (request, reply) => { 

        const user_id = request.auth.credentials.user_id;
        const group_id = request.params.group_id;

        User.findById(user_id, (err, user) => {

            if (err)
                return reply(Boom.internal('Error retrieving user'));

            const memberIndex = user.groups.indexOf(group_id);

            // remove group reference from user
            if (memberIndex > -1)
                user.groups.splice(memberIndex, 1);

            Group.findById(group_id, (err, group) => {

                if (err)
                    return reply(Boom.badRequest());

                const memberIndex = group.members.indexOf(user_id);
                group.members.splice(memberIndex, 1);

                user.save();
                group.save();
                return reply({msg: 'success'});
            });
        });
    }
};
