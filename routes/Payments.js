const payments = require('../controllers/Payments.js');

module.exports = (app) => {
  var router = require('express').Router();

  router.post('/process', paymentsController.processPayment);

  app.use('/payments', router);
};
