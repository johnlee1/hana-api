'use strict';


let routes = [];


const usersRoutes = require('../src/users/users-routes');
routes = routes.concat(usersRoutes);

const postsRoutes = require('../src/posts/posts-routes');
routes = routes.concat(postsRoutes);

const pagesRoutes = require('../src/pages/pages-routes');
routes = routes.concat(pagesRoutes);

const listsRoutes = require('../src/lists/lists-routes');
routes = routes.concat(listsRoutes);


module.exports = routes;
