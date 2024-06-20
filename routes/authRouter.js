const express = require('express');
const { signin, signup, signOut, signinGoogle } = require('../controllers/authController');
const router = express.Router();
const app = express()

router.post('/signIn', signin)
router.post('/signUp', signup)
router.post('/signOut', signOut)

module.exports = router