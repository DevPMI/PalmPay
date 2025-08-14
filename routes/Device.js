/** @format */

const Controller = require('../controllers/Device');
const authentication = require('../middleware/Authentication');

const userRoute = require('express').Router();

userRoute.post('/pairing', Controller.pairing);

module.exports = userRoute;
