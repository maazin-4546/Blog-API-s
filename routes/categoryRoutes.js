const express = require('express');
const router = express.Router();
const authorize = require("../middleware/authorize");

const { createCategory, getAllCategories, deleteCategory } = require('../controller/categoryController');


router.post('/create', authorize(['admin']), createCategory);

router.get('/all-categories', authorize(['admin', 'author']), getAllCategories);

router.delete('/delete-category/:id', authorize(['admin']), deleteCategory);


module.exports = router;