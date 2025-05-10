const express = require('express');
const router = express.Router();
const authorize = require('../middleware/authorize');

const { getTotalUsers, getTotalBlogsCount, getTotalInactiveUsers } = require('../controller/dashboardController');


router.get('/users-count', authorize(['admin']), getTotalUsers)

router.get('/blogs-count', authorize(['admin']), getTotalBlogsCount)

router.get('/inactive-users', authorize(['admin']), getTotalInactiveUsers)


module.exports = router;