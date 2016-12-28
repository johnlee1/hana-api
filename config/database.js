'use strict';


const Mongoose = require('mongoose');


//const parameters = require('./parameters.json');
//Mongoose.connect('mongodb://' + parameters.database.host + '/' + parameters.database.db);
//Mongoose.connect(process.env.DB_CONNECTION)
Mongoose.connect("mongodb://prayforhana:kjlraylicc!!1@ds031835.mlab.com:31835/prayforhana");

const db = Mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error'));
db.once('open', () => {
    console.log('Connection with database succeeded');
});


module.exports = db;