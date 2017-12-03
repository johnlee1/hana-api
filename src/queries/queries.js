'use strict';

const User = require('../users//users-model');

exports.getUser = async function getUser(user_id) {
    return await User.findById(user_id, (err, user) => {
        if (err)
            return "error";
        return user;
    });
}

exports.getUserWithPosts = async function getUser(user_id) {
    return await User.findById(user_id)
                     .populate('posts', null, { private: false })
                     .exec(function (err, user) {
                        if (err)
                            return "error";
                        return user;
                     });
}
