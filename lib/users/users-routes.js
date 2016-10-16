'use strict';


const Users = require('./users-handlers');  


module.exports = [{
    method: 'GET',
    path: '/api/test',
    config: Users.test,
}, {
    method: 'POST',
    path: '/api/users',
    config: Users.register,
}, {
    method: 'GET',
    path: '/api/users/confirm/{token}',
    config: Users.confirm,
}, {
    method: 'POST',
    path: '/api/users/login',
    config: Users.login,
}];