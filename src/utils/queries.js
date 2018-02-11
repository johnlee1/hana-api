'use strict';

const List = require('../lists/lists-model');
const Page = require('../pages/pages-model');
const User = require('../users/users-model');
const Posts = require('../posts/posts-model');

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

exports.getUserWithPosts = async function getUserWithPosts(user_id) {
    return await User.findById(user_id)
                     .populate('posts')
                     .exec((err, user) => {
                        if (err)
                            return "error";
                        return user;
                     });
}

exports.getUserWithLists = async function getUserWithLists(user_id) {
    return await User.findById(user_id)
                     .populate('lists')
                     .exec((err, user) => {
                        if (err)
                            return "error";
                        return user;
                     });
}

exports.getPostsWithUser = async function getPostsWithUser(user_id) {
    return await Posts.find({userId: user_id})
                            .exec((err, post) => {
                                if (err)
                                    return "error";
                                return post;
                            });
}

exports.getListsWithUser = async function getPostsWithUser(user_id) {
    return await List.find({userId: user_id})
                            .exec((err, post) => {
                                if (err)
                                    return "error";
                                return post;
                            });
}
