const express = require('express');
const { getUser, updateUser, deleteUser, getFollowers, getFollowing } = require('../controllers/userController');
const router = express.Router();
const app = express()

router.get('/:userId', getUser)
router.put('/:userId', updateUser)
router.delete('/:userId', deleteUser)

router.get('/:userId/followers', getFollowers)
router.get('/:userId/following', getFollowing)
module.exports = router