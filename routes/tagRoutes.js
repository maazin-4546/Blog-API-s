const express = require('express');
const router = express.Router();
const authorize = require("../middleware/authorize");

const { createTag, getAllTags, deleteTag } = require('../controller/tagController');


router.post('/create', authorize(['admin']), createTag);

router.get('/all-tags', authorize(['admin', 'author']), getAllTags);

router.delete('/delete-tag/:id', authorize(['admin']), deleteTag);



module.exports = router;