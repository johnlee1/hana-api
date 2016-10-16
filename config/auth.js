'use strict';


const HapiAuthJwt = require('hapi-auth-jwt2');
// const Parameters = require('./parameters');
const Moment = require('moment');

const User = require('../lib/users/users-model');


function validate(decoded, token, cb) {
    console.log('helloone');
    console.log(decoded);
    console.log(token);
    console.log(cb);
    console.log(token.iat);
    let ttl = 90000000;
    let diff = Moment().diff(Moment(token.iat * 1000));
    console.log(diff);
    if (diff > ttl) {
        console.log('hellotwo');
        return callback(null, false);
    }
    console.log('hellothree');
    return cb(null, true, decoded);
}


const register =  (server, options, next) => {
    server.register(HapiAuthJwt, (err) => {
        if (err) {
            return next(err);
        }

        server.auth.strategy('jwt', 'jwt', {
            key: process.env.JWT_PRIVATE_KEY,
            validateFunc: validate,
            headerKey: 'hanaauthtoken'
        });

        return next();
    });
};


register.attributes = {
    name: 'auth-jwt',
    version: '1.0.0'
};


module.exports = register;