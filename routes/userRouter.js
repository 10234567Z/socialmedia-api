const express = require('express');
const { getUser, updateUser, deleteUser, getFollowers, getFollowing, followUser, unfollowUser } = require('../controllers/userController');
const router = express.Router();
const app = express()

router.get('/:username', getUser)
router.put('/', updateUser)
router.delete('/', deleteUser)

router.post('/:username/follow', followUser)
router.delete('/:username/unfollow', unfollowUser)

router.get('/:username/followers', getFollowers)
router.get('/:username/following', getFollowing)
module.exports = router