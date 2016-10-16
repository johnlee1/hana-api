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
		required: true
	},
    isVerified: {
        type: Boolean,
        default: false
    },  
    profile: { 
        type: Mongoose.Schema.ObjectId, 
        ref : 'Profile',
        required: true
    },
    following: {
        type: [{ type: Mongoose.Schema.ObjectId, ref: 'Profile' }],
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
    adminGroups: {
        type: [{ type: Mongoose.Schema.ObjectId, ref: 'Group' }],
        default: []
    },
    memberGroups: {
        type: [{ type: Mongoose.Schema.ObjectId, ref: 'Group' }],
        default: []
    }
});


module.exports = Mongoose.model('User', Schema);