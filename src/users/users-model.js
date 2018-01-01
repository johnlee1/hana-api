'use strict';


const Mongoose = require('mongoose');


const Schema = new Mongoose.Schema({
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String, 
        required: true,
        select: false
    },
    isVerified: {
        type: Boolean,
        default: false
    },  
    name: {
        type: String,
        required: true
    },
    bio: { 
        type: String
    },
    posts: {
        type: [{ type: Mongoose.Schema.ObjectId, ref: 'Post' }],
        default: []
    },
    lists: {
        type: [{ type: Mongoose.Schema.ObjectId, ref: 'List' }],
        default: []
    },
    adminPages: {
        type: [{ type: Mongoose.Schema.ObjectId, ref: 'Page' }],
        default: []
    },
    memberPages: {
        type: [{ type: Mongoose.Schema.ObjectId, ref: 'Page' }],
        default: []
    },
});


module.exports = Mongoose.model('User', Schema);
