const express = require('express');
const authorize = require('../middleware/authorize');
const router = express.Router();

const { createComment, deleteComment, updateComment, getBlogComments } = require('../controller/commentController');


router.post('/create', authorize(['user', 'author']), createComment);

router.delete('/delete/:id', authorize(['user', 'author', 'admin']), deleteComment);

router.put('/update/:id', authorize(['user', 'author']), updateComment);

router.get('/all-comments/:blogId', authorize(['user', 'author', 'admin']), getBlogComments);


module.exports = router;