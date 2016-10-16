'use strict';


const Profiles = require('./profiles-handlers');  


module.exports = [{
    method: 'GET',
    path: '/api/profiles/search',
    config: Profiles.searchProfiles,
}, {
    method: 'PUT',
    path: '/api/profiles/follow/{profile_id}',
    config: Profiles.followProfile,
}, {
    method: 'PUT',
    path: '/api/profiles/unfollow/{profile_id}',
    config: Profiles.unfollowProfile,
}, {
    method: 'GET',
    path: '/api/profiles/following',
    config: Profiles.following,
}, {
    method: 'GET',
    path: '/api/profiles/me',
    config: Profiles.getMyProfile,
}, {
    method: 'PUT',
    path: '/api/profiles/me',
    config: Profiles.updateMyProfile,
}, {
    method: 'GET',
    path: '/api/profiles/{profile_id}',
    config: Profiles.getProfile,
}];