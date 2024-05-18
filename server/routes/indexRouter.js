const express = require('express');
const { getRecentFollowerPosts } = require('../controllers/indexController');
const router = express.Router();
const app = express()

router.get('/', getRecentFollowerPosts)

module.exports = router