'use strict';


const Lists = require('./lists-handlers');  


module.exports = [{
    method: 'GET',
    path: '/api/lists/me',
    config: Lists.getLists,
}, {
    method: 'GET',
    path: '/api/lists/{list_id}',
    config: Lists.getList,
}, {
    method: 'POST',
    path: '/api/lists',
    config: Lists.createList,
}, {
    method: 'PUT',
    path: '/api/lists/addPost/{list_id}',
    config: Lists.addPost,
}, {
    method: 'PUT',
    path: '/api/lists/removePost/{list_id}',
    config: Lists.removePost,
}, {
    method: 'PUT',
    path: '/api/lists/{list_id}',
    config: Lists.updateList,
}];
