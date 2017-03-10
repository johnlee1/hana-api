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
    user: {
        type : Mongoose.Schema.ObjectId, 
        ref : 'User',
    },
    create_date: {
        type: Date,
        default: Date.now
    },
    expiration_date: {
        type: Date
    },
    private: {
        type: Boolean,
        default: false
    },
    urgent: {
        type: Boolean,
        default: false
    }
});


module.exports = Mongoose.model('Post', Schema);
