/** @format */

const express = require('express');
const router = express.Router();
const Controller = require('../controllers/Merchant');
const authentication = require('../middleware/Authentication');

router.post('/login', Controller.login);
router.post('/register', Controller.register);
router.get('/profile', authentication, Controller.getProfile); // Rute baru

module.exports = router;
