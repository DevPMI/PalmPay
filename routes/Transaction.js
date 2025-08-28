/** @format */

const Controller = require('../controllers/Transaction');
const authentication = require('../middleware/Authentication');

const userRoute = require('express').Router();

userRoute.post('/', authentication, Controller.transaction);

module.exports = userRoute;
