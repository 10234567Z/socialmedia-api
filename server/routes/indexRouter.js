const express = require('express');
const { getHome } = require('../controllers/indexController');
const router = express.Router();
const app = express()

router.get('/', getHome)

module.exports = router