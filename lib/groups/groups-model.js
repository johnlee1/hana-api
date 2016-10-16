'use strict';


const Mongoose = require('mongoose');


const Schema = new Mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    admins: 
        [{ type : Mongoose.Schema.ObjectId, ref : 'User' }],
    members: 
        [{ type : Mongoose.Schema.ObjectId, ref : 'User' }],
    posts: 
        [{ type : Mongoose.Schema.ObjectId, ref : 'Post' }],
});


module.exports = Mongoose.model('Group', Schema);