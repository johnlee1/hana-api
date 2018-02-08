'use strict';

const Mongoose = require('mongoose');

const Schema = new Mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    created_date: {
        type: Date,
        default: Date.now
    },
    posts: 
        [{ type : Mongoose.Schema.ObjectId, ref : 'Post' }],
});

module.exports = Mongoose.model('List', Schema);
