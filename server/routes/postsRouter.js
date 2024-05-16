const express = require("express");
const {
  getPost,
  createPost,
  deletePost,
  updatePost,
  getLikes,
  likePost,
  unlikePost,
  getComments,
  postNewComment,
  replyToComment,
  updateComment,
  deleteComment,
} = require("../controllers/postController");
const router = express.Router();
const app = express();

router.get("/:postId", getPost);
router.post("/", createPost);
router.delete("/:postId", deletePost);
router.put("/:postId", updatePost);

router.get("/:postId/like", getLikes);
router.post("/:postId/like", likePost);
router.delete("/:postId/like", unlikePost);

router.get("/:postId/comment", getComments);
router.post("/:postId/comment", postNewComment);
router.post("/:postId/comment/:commentId", replyToComment);
router.put("/:postId/comment/:commentId", updateComment);
router.delete("/:postId/comment/:commentId", deleteComment);

module.exports = router;
