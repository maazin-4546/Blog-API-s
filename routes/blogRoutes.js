const express = require('express');
const router = express.Router();
const authorize = require("../middleware/authorize")

const {
    createBlog,
    updateBlog,
    deleteBlog,
    getAllBlogs,
    getSingleBlog,
    changeBlogStatus,
    likeOrDislikeBlog,
    filterBlogs
} = require('../controller/blogController');


router.post('/create', authorize(['author']), createBlog)

router.put('/update/:id', authorize(['author']), updateBlog)

router.put('/publish/:id', authorize(['author']), changeBlogStatus)

router.delete('/delete/:id', authorize(['author', 'admin']), deleteBlog)

router.get('/all-blogs', authorize(['user', 'admin', 'author']), getAllBlogs)

router.get('/single-blog/:id', authorize(['user', 'admin', 'author']), getSingleBlog)

router.put('/reaction/:blogId', authorize(['user', 'author']), likeOrDislikeBlog);

//! ------------ Search, Filters and Pagination -------------------

router.get('/filter-blogs', authorize(['user', 'admin', 'author']), filterBlogs);



module.exports = router;