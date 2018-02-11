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
    userId: {
        type: String
    }
});

module.exports = Mongoose.model('Post', Schema);
