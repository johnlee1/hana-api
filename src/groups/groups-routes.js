'use strict';


const Groups = require('./groups-handlers');  


module.exports = [{
    method: 'POST',
    path: '/api/circles',
    config: Groups.createCircle,
}, {
    method: 'GET',
    path: '/api/groups/me',
    config: Groups.getGroups,
}, {
    method: 'GET',
    path: '/api/circles/{circle_id}',
    config: Groups.getCircle,
}, {
    method: 'PUT',
    path: '/api/groups/{group_id}',
    config: Groups.updateGroup,
}, {
    method: 'PUT',
    path: '/api/groups/leave/{group_id}',
    config: Groups.leaveGroup,
}];
