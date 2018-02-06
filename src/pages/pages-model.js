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
    private: {
        type: Boolean,
        required: true,
        default: true
    },
    admin_code: {
        type: String
    },
    contributor_code: {
        type: String
    },
    admins: 
        [{ type : Mongoose.Schema.ObjectId, ref : 'User' }],
    contributors: 
        [{ type : Mongoose.Schema.ObjectId, ref : 'User' }],
    followers: 
        [{ type : Mongoose.Schema.ObjectId, ref : 'User' }],
    posts: 
        [{ type : Mongoose.Schema.ObjectId, ref : 'Post' }],
});


module.exports = Mongoose.model('Page', Schema);
