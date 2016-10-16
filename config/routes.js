'use strict';


let routes = [];


const usersRoutes = require('../lib/users/users-routes');
routes = routes.concat(usersRoutes);

const postsRoutes = require('../lib/posts/posts-routes');
routes = routes.concat(postsRoutes);

const profilesRoutes = require('../lib/profiles/profiles-routes');
routes = routes.concat(profilesRoutes);

const pagesRoutes = require('../lib/pages/pages-routes');
routes = routes.concat(pagesRoutes);

const groupsRoutes = require('../lib/groups/groups-routes');
routes = routes.concat(groupsRoutes);


module.exports = routes;