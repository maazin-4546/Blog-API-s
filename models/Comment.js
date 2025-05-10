const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    blogId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog',
        required: true,
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    commentText: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000,
    },
    parentCommentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Comment',
        default: null,
    },
}, { timestamps: true });

module.exports = mongoose.model('Comment', commentSchema);
