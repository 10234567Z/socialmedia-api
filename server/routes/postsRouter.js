const express = require('express');
const { getPost, createPost, deletePost, updatePost, getLikes, likePost, unlikePost } = require('../controllers/postController');
const router = express.Router();
const app = express()

router.get("/:postId" , getPost)
router.post("/" , createPost)
router.delete("/:postId" , deletePost)
router.put("/:postId" , updatePost)

router.get('/:postId/like' , getLikes)
router.post('/:postId/like' , likePost)
router.delete('/:postId/like' , unlikePost)

module.exports = router