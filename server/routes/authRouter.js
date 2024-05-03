const express = require('express');
const { getSignin } = require('../controllers/signinController');
const { getSignup } = require('../controllers/signupController');
const router = express.Router();
const app = express()

router.post('/signIn', getSignin)
router.post('/signUp', getSignup)

module.exports = router