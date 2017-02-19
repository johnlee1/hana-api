'use strict';


const Profiles = require('./profiles-handlers');  


module.exports = [{
    method: 'GET',
    path: '/api/profiles/followers',
    config: Profiles.followers,
}, {
    method: 'GET',
    path: '/api/profiles/following',
    config: Profiles.following,
}, {
    method: 'GET',
    path: '/api/profiles/me',
    config: Profiles.getMyProfile,
}, {
    method: 'GET',
    path: '/api/profiles/search',
    config: Profiles.searchProfiles,
}, {
    method: 'GET',
    path: '/api/profiles/{profile_id}',
    config: Profiles.getProfile,
}, {
    method: 'PUT',
    path: '/api/profiles/follow/{profile_id}',
    config: Profiles.followProfile,
}, {
    method: 'PUT',
    path: '/api/profiles/me',
    config: Profiles.updateMyProfile,
}, {
    method: 'PUT',
    path: '/api/profiles/unfollow/{profile_id}',
    config: Profiles.unfollowProfile,
}];
