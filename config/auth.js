'use strict';

const HapiAuthJwt = require('hapi-auth-jwt2');
const Moment = require('moment');

function validate(decoded, token, cb) {
    let ttl = 90000000;
    let diff = Moment().diff(Moment(token.iat * 1000));
    if (diff > ttl)
        return cb(null, false);

    return cb(null, true, decoded);
}


const register =  (server, options, next) => {
    server.register(HapiAuthJwt, (err) => {
        if (err)
            return next(err);

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
