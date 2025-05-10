const Blog = require("../models/Blog");
const User = require("../models/User");


const getTotalUsers = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();

        res.status(200).json({
            sucess: true,
            message: 'Total users count fetched successfully.',
            totalUsers,
        });

    } catch (error) {
        console.error('Error fetching total users:', error);
        res.status(500).json({ sucess: false, message: 'Server error. Please try again later.' });
    }
};


const getTotalBlogsCount = async (req, res) => {
    try {
        const totalBlogs = await Blog.countDocuments();

        res.status(200).json({
            sucess: true,
            message: 'Total blogs count fetched successfully.',
            totalBlogs,
        });

    } catch (error) {
        console.error('Error fetching total blogs:', error);
        res.status(500).json({ sucess: false, message: 'Server error. Please try again later.', error: error.message });
    }
};


const getTotalInactiveUsers = async (req, res) => {
    try {
        const totalInactiveUsers = await User.countDocuments({ status: 'inactive' });

        res.status(200).json({
            success: true,
            message: 'Total inactive users count fetched successfully.',
            totalInactiveUsers,
        });

    } catch (error) {
        console.error('Error fetching total inactive users:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message,
        });
    }
};


module.exports = {
    getTotalUsers,
    getTotalBlogsCount,
    getTotalInactiveUsers,
}