/** @format */

const Controller = require('../controllers/Merchants');
const authentication = require('../middleware/Authentication');

const userRoute = require('express').Router();

userRoute.post('/register', Controller.register);
userRoute.post('/login', Controller.login);

module.exports = userRoute;
