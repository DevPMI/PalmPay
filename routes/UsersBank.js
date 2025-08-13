const usersBankController = require('../controllers/UsersBank.js');

module.exports = (app) => {
  var router = require('express').Router();

  router.post('/users/register', usersBankController.register);

  app.use('/api/usersbank', router);
};
