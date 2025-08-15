/** @format */

const Controller = require('../controllers/UserBank');
const authentication = require('../middleware/Authentication');

const userRoute = require('express').Router();

userRoute.post('/register', authentication, Controller.register);
userRoute.post('/scanToPay', authentication, Controller.scanToPay);

module.exports = userRoute;
