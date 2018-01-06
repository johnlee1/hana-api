'use strict';

const List = require('../lists/lists-model');
const Page = require('../pages/pages-model');
const User = require('../users/users-model');

exports.guid = function guid() {
    function s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
                   .toString(16)
                   .substring(1);
    }
    return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
           s4() + '-' + s4() + s4() + s4();
}
