'use strict';

const List = require('../lists/lists-model');
const Page = require('../pages/pages-model');
const User = require('../users/users-model');

exports.getList = async function getList(list_id) {
    return await List.findById(list_id, (err, list) => {
        if (err)
            return "error";
        return list;
    })
}

exports.getPage = async function getPage(page_id) {
    return await Page.findById(page_id, (err, page) => {
        if (err)
            return "error";
        return page;
    })
}

exports.getUser = async function getUser(user_id) {
    return await User.findById(user_id, (err, user) => {
        if (err)
            return "error";
        return user;
    });
}

exports.getUserWithPosts = async function getUser(user_id) {
    return await User.findById(user_id)
                     .populate('posts')
                     .exec((err, user) => {
                        if (err)
                            return "error";
                        return user;
                     });
}
