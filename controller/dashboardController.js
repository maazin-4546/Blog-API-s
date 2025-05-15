const Blog = require("../models/Blog");
const User = require("../models/User");
const { sendError, sendSuccess } = require('../utils/responseService');

const getTotalUsers = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        sendSuccess(res, 200, req.t('users_count_fetched'), totalUsers);

    } catch (error) {
        console.error('Error fetching total users:', error);
        sendError(res, req.t('Server error. Please try again later.'), error);
    }
};


const getTotalBlogsCount = async (req, res) => {
    try {
        const totalBlogs = await Blog.countDocuments();

        sendSuccess(res, 200, req.t('blogs_count_fetched'), totalBlogs);

    } catch (error) {
        console.error('Error fetching total blogs:', error);
        sendError(res, req.t('Server error. Please try again later.'), error);
    }
};


const getTotalInactiveUsers = async (req, res) => {
    try {
        const totalInactiveUsers = await User.countDocuments({ status: 'inactive' });
        sendSuccess(res, 200, req.t('inactive_users_fetched'), totalInactiveUsers);

    } catch (error) {
        console.error('Error fetching total inactive users:', error);
        sendError(res, req.t('Server error. Please try again later.'), error);
    }
};


module.exports = {
    getTotalUsers,
    getTotalBlogsCount,
    getTotalInactiveUsers,
}