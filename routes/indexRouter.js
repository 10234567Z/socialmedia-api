const express = require('express');
const { getRecentFollowerPosts, getRandomPosts } = require('../controllers/indexController');
const router = express.Router();
const app = express()

router.get('/', getRecentFollowerPosts)
router.get('/random' , getRandomPosts)

module.exports = router