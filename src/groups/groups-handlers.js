'use strict';


const Boom = require('boom');
const Joi = require('joi');

const Group = require('./groups-model');
const User = require('../users/users-model');


// [POST] api/circles
exports.createCircle = {   
    auth: 'jwt',
    validate: {
        payload: {
            name: Joi.string().required(),
            description: Joi.string().required(),
            members: Joi.array().required(),
        }
    },
    handler: (request, reply) => {

        const user_id = request.auth.credentials.user_id;

        const name = request.payload.name;
        const description = request.payload.description;
        let members = request.payload.members;
        members.push(user_id);
        const group = new Group({
            name: name,
            description: description,
            members: members,
        });

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
            .populate('groups', '-posts -members')
            .exec(function (err, user) {
                if (err)
                    return reply(Boom.badRequest());
                const circles = {
                    circles: user.groups, 
                };
                return reply(circles);
            });
    }
};


// [GET] /api/circles/{circle_id}
exports.getCircle = {
    auth: 'jwt',
    handler: (request, reply) => { 

        const user_id = request.auth.credentials.user_id;
        const circle_id = request.params.circle_id;

        Group.findById(circle_id)
            .populate({path: 'posts', options: {sort: { 'create_date': -1} }})
            .exec((err, circle) => {
                if (err)
                    return reply(Boom.badRequest());
                else if (circle.members.indexOf(user_id) > -1)
                    return reply({msg: 'member', circle: circle});
                else
                    return reply({msg: 'notAllowed'});
            }); 
    }
};


// [PUT] /api/circles/{id}
exports.updateCircle = {
    auth: 'jwt',
    validate: {
        payload: {
            name: Joi.string().required(),
            description: Joi.string()
        }
    },
    handler: (request, reply) => { 

        const group_id = request.params.id;

        Group.findById(group_id, (err, group) => {

            if (err)
                return reply(Boom.badRequest());
            group.name = request.payload.name;
            group.description = request.payload.description;
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
