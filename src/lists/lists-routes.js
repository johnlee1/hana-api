'use strict';


const Lists = require('./lists-handlers');  


module.exports = [{
    method: 'GET',
    path: '/api/lists/me',
    config: Lists.getLists,
}, {
    method: 'GET',
    path: '/api/lists/{list_id}',
    config: Lists.getPage,
}, {
    method: 'POST',
    path: '/api/lists/',
    config: Lists.createPage,
}, {
    method: 'PUT',
    path: '/api/lists/{list_id}',
    config: Lists.updatePage,
}];
