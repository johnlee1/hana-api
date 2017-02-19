'use strict';


const Mongoose = require('mongoose');


Mongoose.connect(process.env.DB_CONNECTION)

const db = Mongoose.connection;
db.on('error', console.error.bind(console, 'Connection error'));
db.once('open', () => {
    console.log('Connection with database succeeded');
});


module.exports = db;
