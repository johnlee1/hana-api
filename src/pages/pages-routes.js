'use strict';


const Pages = require('./pages-handlers');  


module.exports = [{
    method: 'GET',
    path: '/api/pages/code/{page_code}',
    config: Pages.getPageCode,
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
    method: 'GET',
    path: '/api/pages/search/code',
    config: Pages.searchCode,
}, {
    method: 'POST',
    path: '/api/pages/',
    config: Pages.createPage,
}, {
    method: 'PUT',
    path: '/api/join_page/{page_id}/{page_code}',
    config: Pages.joinPage,
}, {
    method: 'PUT',
    path: '/api/pages/follow/{page_id}',
    config: Pages.followPage,
}, {
    method: 'PUT',
    path: '/api/pages/refresh_code/{page_id}',
    config: Pages.refreshCode,
}, {
    method: 'PUT',
    path: '/api/pages/unfollow/{page_id}',
    config: Pages.unfollowPage,
}, {
    method: 'PUT',
    path: '/api/pages/{page_id}',
    config: Pages.updatePage,
}];
