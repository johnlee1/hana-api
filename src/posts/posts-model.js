'use strict';

const Mongoose = require('mongoose');

const Schema = new Mongoose.Schema({
    subject: {
        type: String,
        required: true
    },
    story: {
        type: String, 
        required: true
    },
    prayer: {
        type: String,
        required: true
    },
    create_date: {
        type: Date,
        default: Date.now
    },
    urgent: {
        type: Boolean,
        default: false
    },
    resolution: {
        type: String
    },
    resolved: {
        type: Boolean,    
        default: false
    },
    page_name: {
        type: String
    },
    author_name: {
        type: String
    },
    author_id: { 
        type : Mongoose.Schema.ObjectId, 
        ref : 'User' 
    }
});

module.exports = Mongoose.model('Post', Schema);
