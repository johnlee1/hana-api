'use strict';


const Pages = require('./pages-handlers');  


module.exports = [{
    method: 'POST',
    path: '/api/pages/',
    config: Pages.createPage,
}, {
    method: 'GET',
    path: '/api/pages/me',
    config: Pages.getPages,
}, {
    method: 'GET',
    path: '/api/pages/{page_id}',
    config: Pages.getPage,
}, {
    method: 'GET',
    path: '/api/pages/search',
    config: Pages.searchPages,
}, {
    method: 'PUT',
    path: '/api/pages/follow/{page_id}',
    config: Pages.followPage,
}, {
    method: 'PUT',
    path: '/api/pages/unfollow/{page_id}',
    config: Pages.unfollowPage,
}];