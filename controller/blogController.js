const Blog = require('../models/Blog');
const Category = require('../models/Category');
const Tag = require('../models/Tag');
const User = require('../models/User');
const slugs = require("../utils/slugs")


const createBlog = async (req, res) => {
    try {
        const { title, content, featuredImage, category, tags, status } = req.body;

        if (!title || !content || !category) {
            return res.status(400).json({ message: 'Title, Content, and Category are required.' });
        }

        const generatedSlug = slugs(title.toLowerCase());

        const existingBlog = await Blog.findOne({ slug: generatedSlug });
        if (existingBlog) {
            return res.status(400).json({ message: 'Slug already exists. Please choose another one.' });
        }

        const categoryExists = await Category.findById(category);
        if (!categoryExists) {
            return res.status(400).json({ message: 'Invalid category selected.' });
        }

        let validTags = [];
        if (tags && tags.length > 0) {
            validTags = await Tag.find({ _id: { $in: tags } });
            if (validTags.length !== tags.length) {
                return res.status(400).json({ message: 'One or more invalid tags selected.' });
            }
        }

        const blog = new Blog({
            title,
            content,
            slug: generatedSlug,
            featuredImage: featuredImage || '',
            category,
            tags: tags || [],
            status: status || 'draft',
            author: req.user._id,
        });

        await blog.save();

        res.status(201).json({
            success: true,
            message: 'Blog created successfully.',
            blog,
        });

    } catch (error) {
        console.error('Error creating blog:', error);
        res.status(500).json({ success: false, message: 'Server error. Please try again later.', error: error.message });
    }
};


const updateBlog = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const blog = await Blog.findById(id);
        if (!blog) {
            return res.status(404).json({ message: 'Blog not found.' });
        }

        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized. You can only update your own blogs.' });
        }

        // If title is updated, regenerate slug
        if (updates.title) {
            const generatedSlug = slugs(updates.title);

            // Check if new slug already exists (for other blogs)
            const existingBlogWithSlug = await Blog.findOne({ slug: generatedSlug, _id: { $ne: id } });
            if (existingBlogWithSlug) {
                return res.status(400).json({ message: 'Slug already exists for another blog. Please change the title.' });
            }

            updates.slug = generatedSlug;
        }

        // Update blog with the provided fields
        Object.keys(updates).forEach((key) => {
            blog[key] = updates[key];
        });

        const updatedBlog = await blog.save();

        res.status(200).json({
            message: 'Blog updated successfully.',
            blog: updatedBlog,
        });

    } catch (error) {
        console.error('Error updating blog:', error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};


const deleteBlog = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);

        if (!blog || blog.isDeleted) {
            return res.status(404).json({ message: 'Blog not found.' });
        }

        // Check if the user is Admin
        if (req.user.role === 'admin') {
            blog.isDeleted = true;
            await blog.save();
            return res.status(200).send({ message: 'Blog deleted successfully by Admin.' });
        }

        // Check if the user is the Blog Author
        if (blog.author.toString() === req.user._id.toString()) {
            blog.isDeleted = true;
            await blog.save();
            return res.status(200).send({ message: 'Blog deleted successfully by Blog Author.' });
        }

        return res.status(403).send({
            sucess: false,
            message: 'You are not authorized to delete this blog.',
        });

    } catch (error) {
        console.error('Error deleting blog:', error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};


const getAllBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ isDeleted: false })
            .populate('author', 'name')
            .sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Blogs fetched successfully.',
            blogs,
        });

    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({ message: 'Internal server error. Please try again later.' });
    }
};


const getSingleBlog = async (req, res) => {
    try {
        const { id } = req.params

        const blog = await Blog.findById(id)

        if (!blog) {
            return res.status(404).send({ message: "Blog not found" })
        }

        res.status(200).send({
            success: true,
            message: "Blog found successfully",
            blog,
        })

    } catch (error) {
        console.log(error)
        res.status(500).send({
            success: false,
            message: "Internal server error",
            error: error.message
        })
    }
}


const changeBlogStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const blog = await Blog.findById(id);

        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found.' });
        }

        if (blog.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized. You can only publish your own blogs.' });
        }

        // Toggle the status
        blog.status = blog.status === 'published' ? 'draft' : 'published';

        await blog.save();

        res.status(200).json({
            success: true,
            message: `Blog status updated to ${blog.status}.`,
            blog,
        });

    } catch (error) {
        console.error('Error toggling blog status:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message,
        });
    }
};


const likeOrDislikeBlog = async (req, res) => {
    try {
        const { blogId } = req.params;
        const { action } = req.body; // 'like' or 'dislike'
        const userId = req.user._id;

        if (!['like', 'dislike'].includes(action)) {
            return res.status(400).json({ success: false, message: 'Invalid action.' });
        }

        const blog = await Blog.findById(blogId);
        if (!blog) {
            return res.status(404).json({ success: false, message: 'Blog not found.' });
        }

        // Remove user from both arrays first (if present)
        blog.likes = blog.likes.filter(uid => uid.toString() !== userId.toString());
        blog.dislikes = blog.dislikes.filter(uid => uid.toString() !== userId.toString());

        // Add based on action
        if (action === 'like') {
            blog.likes.push(userId);
        } else if (action === 'dislike') {
            blog.dislikes.push(userId);
        }

        await blog.save();

        res.status(200).json({
            success: true,
            message: `Blog ${action}d successfully.`,
            totalLikes: blog.likes.length,
            totalDislikes: blog.dislikes.length,
        });

    } catch (error) {
        console.error('Error liking/disliking blog:', error);
        res.status(500).json({ success: false, message: 'Server error.', error: error.message });
    }
};

//! ------------ Search, Filters and Pagination -------------------

const filterBlogs = async (req, res) => {
    try {
        const { title, authorName, category, tags, page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

        let query = { isDeleted: false };

        // If title is provided, search with regex
        if (title) {
            query.title = { $regex: title, $options: 'i' };
        }

        // Filter by author name
        if (authorName) {
            const matchingAuthors = await User.find({
                name: { $regex: authorName, $options: 'i' }
            }).select('_id');

            const authorIds = matchingAuthors.map(author => author._id);
            query.author = { $in: authorIds };
        }

        // Filter by category
        if (category) {
            query.category = category;
        }

        // Filter by tags
        if (tags) {
            const tagsArray = Array.isArray(tags) ? tags : tags.split(',');
            query.tags = { $all: tagsArray };
        }

        // Pagination setup
        const skip = (parseInt(page) - 1) * parseInt(limit);
        const sortOption = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

        // Fetch blogs
        const blogs = await Blog.find(query)
            .populate('author', 'name email')
            .populate('category', 'name')
            .populate('tags', 'name')
            .sort(sortOption)
            .skip(skip)
            .limit(parseInt(limit));

        const totalBlogs = await Blog.countDocuments(query);

        res.status(200).json({
            success: true,
            message: 'Blogs fetched successfully.',
            totalBlogs,
            currentPage: parseInt(page),
            totalPages: Math.ceil(totalBlogs / parseInt(limit)),
            blogs,
        });

    } catch (error) {
        console.error('Error fetching blogs:', error);
        res.status(500).json({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message,
        });
    }
};



module.exports = {
    createBlog,
    updateBlog,
    deleteBlog,
    getAllBlogs,
    getSingleBlog,
    changeBlogStatus,
    likeOrDislikeBlog,
    filterBlogs
}