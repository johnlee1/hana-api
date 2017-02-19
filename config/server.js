'use strict';


// dependencies
const Hapi = require('hapi');


// configurations files
const auth = require('./auth');
const db = require('./database');
const routes = require('./routes');


// create a hapi server
const server = new Hapi.Server();

server.connection({
    host: "0.0.0.0",
    port: 3000,
    //routes: { cors: true },
    routes: {
        cors: {
            //origin: ['*'],
            additionalHeaders: ['hanaauthtoken']
        }
      }    
});

server.database = db;


// plugins management
const plugins = [];
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
