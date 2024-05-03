const express = require('express');
const { getPost, createPost, deletePost, updatePost } = require('../controllers/postController');
const router = express.Router();
const app = express()

router.get("/:postId" , getPost)
router.post("/:postId" , createPost)
router.delete("/:postId" , deletePost)
router.put("/:postId" , updatePost)

module.exports = router