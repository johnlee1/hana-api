'use strict';


// dependencies
const Hapi = require('hapi');


// configurations files
// const parameters = require('./parameters');
const auth = require('./auth');
const routes = require('./routes');
const db = require('./database');


// create a hapi server
const server = new Hapi.Server();
const plugins = [];

server.connection({
    host: "0.0.0.0",
    port: 3000,
    routes: { cors: true }
});

server.database = db;


// plugins management
plugins.push({register: auth});
server.register(plugins, (err) => {
    if (err) {
        throw err;
    }
    console.log('Server plugins were successfully loaded');
});


// set up routes
server.route(routes);


module.exports = server;