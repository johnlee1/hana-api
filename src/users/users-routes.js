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
    method: 'GET',
    path: '/api/users/followers',
    config: Users.followers,
}, {
    method: 'GET',
    path: '/api/users/following',
    config: Users.following,
}, {
    method: 'GET',
    path: '/api/users/me',
    config: Users.getMe,
}, {
    method: 'GET',
    path: '/api/users/me/queue',
    config: Users.queue,
}, {
    method: 'GET',
    path: '/api/users/me/queue_sorted',
    config: Users.queueSorted,
}, {
    method: 'GET',
    path: '/api/users/search',
    config: Users.searchUsers,
}, {
    method: 'GET',
    path: '/api/users/{user_id}',
    config: Users.getUser,
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
}, {
    method: 'PUT',
    path: '/api/users/follow/{user_id}',
    config: Users.followUser,
}, {
    method: 'PUT',
    path: '/api/users/me',
    config: Users.updateMe,
}, {
    method: 'PUT',
    path: '/api/users/unfollow/{user_id}',
    config: Users.unfollowUser,
}, {
    method: 'DELETE',
    path: '/api/users',
    config: Users.delete,
}];
