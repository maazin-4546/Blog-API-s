const Comment = require('../models/Comment');
const Blog = require('../models/Blog');


const createComment = async (req, res) => {
    try {
        const { blogId, commentText, parentCommentId } = req.body;

        if (!blogId || !commentText) {
            return res.status(400).send({ message: 'Blog ID and Comment Text are required.' });
        }

        // Check if the blog exists and is not deleted
        const blog = await Blog.findOne({ _id: blogId, isDeleted: false });
        if (!blog) {
            return res.status(404).send({ message: 'Blog not found.' });
        }

        const comment = new Comment({
            blogId,
            userId: req.user._id,
            commentText,
            parentCommentId: parentCommentId || null,
        });

        await comment.save();

        res.status(201).send({
            sucess: true,
            message: 'Comment created successfully.',
            comment,
        });

    } catch (error) {
        console.error('Error creating comment:', error);
        res.status(500).send({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message,
        });
    }
};


const deleteComment = async (req, res) => {
    try {
        const { id } = req.params;

        const comment = await Comment.findById(id);
        if (!comment) {
            return res.status(404).send({ message: 'Comment not found.' });
        }

        const blog = await Blog.findById(comment.blogId);
        if (!blog) {
            return res.status(404).send({ message: 'Blog related to the comment not found.' });
        }

        // Check if the user is Admin
        if (req.user.role === 'admin') {
            await comment.deleteOne();
            return res.status(200).send({ message: 'Comment deleted successfully by Admin.' });
        }

        // Check if the user is the Blog Author
        if (blog.author.toString() === req.user._id.toString()) {
            await comment.deleteOne();
            return res.status(200).send({ message: 'Comment deleted successfully by Blog Author.' });
        }

        // Check if the user is the Comment Creator
        if (comment.userId.toString() === req.user._id.toString()) {
            await comment.deleteOne();
            return res.status(200).send({ message: 'Comment deleted successfully by Comment Owner.' });
        }

        // If none of the above, forbid deletion
        return res.status(403).send({
            sucess: false,
            message: 'You are not authorized to delete this comment.',
            error: error.message
        });

    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).send({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message,
        });
    }
};


const updateComment = async (req, res) => {
    try {
        const { id } = req.params;
        const { commentText } = req.body;

        if (!commentText || commentText.trim() === '') {
            return res.status(400).send({ success: false, message: 'Comment text is required.' });
        }

        const comment = await Comment.findById(id);

        if (!comment) {
            return res.status(404).send({ success: false, message: 'Comment not found.' });
        }

        // Check if the logged-in user is the owner of the comment
        if (comment.userId.toString() !== req.user._id.toString()) {
            return res.status(403).send({ success: false, message: 'You are not authorized to edit this comment.' });
        }

        comment.commentText = commentText.trim();
        await comment.save();

        res.status(200).send({
            success: true,
            message: 'Comment updated successfully.',
            comment,
        });

    } catch (error) {
        console.error('Error updating comment:', error);
        res.status(500).send({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message,
        });
    }
};


const getBlogComments = async (req, res) => {
    try {
        const { blogId } = req.params;

        const comments = await Comment.find({ blogId })
            .populate('userId', 'name')
            .lean(); // convert to plain JS objects

        const commentMap = {};
        comments.forEach(comment => {
            comment.replies = [];
            commentMap[comment._id] = comment;
        });

        const rootComments = [];
        comments.forEach(comment => {
            if (comment.parentCommentId) {
                const parent = commentMap[comment.parentCommentId];
                if (parent) {
                    parent.replies.push(comment);
                }
            } else {
                rootComments.push(comment);
            }
        });

        res.status(200).send({
            success: true,
            message: 'Comments fetched successfully.',
            comments: rootComments,
        });

    } catch (error) {
        console.error('Error fetching blog comments:', error);
        res.status(500).send({
            success: false,
            message: 'Server error. Please try again later.',
            error: error.message,
        });
    }
};



module.exports = {
    createComment,
    deleteComment,
    updateComment,
    getBlogComments
};
