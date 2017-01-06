'use strict';


const Users = require('./users-handlers');  


module.exports = [{
    method: 'GET',
    path: '/api/test',
    config: Users.test,
}, {
    method: 'GET',
    path: '/api/users/confirm/{token}',
    config: Users.confirm,
}, {
    method: 'POST',
    path: '/api/users',
    config: Users.register,
}, {
    method: 'POST',
    path: '/api/users/login',
    config: Users.login,
}, {
    method: 'POST',
    path: '/api/users/password',
    config: Users.updatePassword,
}];