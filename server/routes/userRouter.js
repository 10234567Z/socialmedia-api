const express = require('express');
const { getUser, updateUser, deleteUser, getFollowers, getFollowing } = require('../controllers/userController');
const router = express.Router();
const app = express()

router.get('/:username', getUser)
router.put('/', updateUser)
router.delete('/', deleteUser)

router.get('/:username/followers', getFollowers)
router.get('/:username/following', getFollowing)
module.exports = router