'use strict';


const Mongoose = require('mongoose');


const Schema = new Mongoose.Schema({
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
    followers: {
    	type: [{ type: Mongoose.Schema.ObjectId, ref: 'User' }],
    	default: []
    },
});


module.exports = Mongoose.model('Profile', Schema);