'use strict';


const Posts = require('./posts-handlers');  


module.exports = [{
    method: 'GET',
    path: '/api/posts/me',
    config: Posts.getPosts,
}, {
    method: 'GET',
    path: '/api/posts/users/{user_id}',
    config: Posts.getUserPosts,
}, {
    method: 'GET',
    path: '/api/posts/{post_id}',
    config: Posts.getPost,
}, {
    method: 'POST',
    path: '/api/posts',
    config: Posts.createPost,
}, {
    method: 'POST',
    path: '/api/posts/group/{group_id}',
    config: Posts.createGroupPost,
}, {
    method: 'POST',
    path: '/api/posts/pages/{page_id}',
    config: Posts.createPagePost,
}, {
    method: 'PUT',
    path: '/api/posts/{post_id}',
    config: Posts.updatePost,
}, {
    method: 'DELETE',
    path: '/api/posts/{post_id}',
    config: Posts.deletePost,
}];
