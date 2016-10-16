'use strict';


const Groups = require('./groups-handlers');  


module.exports = [{
    method: 'POST',
    path: '/api/groups/',
    config: Groups.createGroup,
}, {
    method: 'GET',
    path: '/api/groups/me',
    config: Groups.getGroups,
}, {
    method: 'GET',
    path: '/api/groups/{group_id}',
    config: Groups.getGroup,
}, {
    method: 'PUT',
    path: '/api/groups/{group_id}',
    config: Groups.updateGroup,
}, {
    method: 'PUT',
    path: '/api/groups/leave/{group_id}',
    config: Groups.leaveGroup,
}];