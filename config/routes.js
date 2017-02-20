'use strict';


let routes = [];


const usersRoutes = require('../src/users/users-routes');
routes = routes.concat(usersRoutes);

const postsRoutes = require('../src/posts/posts-routes');
routes = routes.concat(postsRoutes);

const profilesRoutes = require('../src/profiles/profiles-routes');
routes = routes.concat(profilesRoutes);

const pagesRoutes = require('../src/pages/pages-routes');
routes = routes.concat(pagesRoutes);

const groupsRoutes = require('../src/groups/groups-routes');
routes = routes.concat(groupsRoutes);


module.exports = routes;
