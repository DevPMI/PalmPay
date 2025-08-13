const edcDevicesControllers = require('../controllers/EdcDevices.js');

module.exports = (app) => {
  var router = require('express').Router();

  // Create a new edcDevicesControllers
  router.post('/', edcDevicesControllers.create);

  // Retrieve all edcDevicesControllers
  router.get('/', edcDevicesControllers.findAll);

  // Retrieve a single edcDevicesControllers with id
  router.get('/:sn_edc', edcDevicesControllers.findOne);

  // Update a edcDevicesControllers with id
  router.put('/:sn_edc', edcDevicesControllers.update);

  // Delete a edcDevicesControllers with id
  router.delete('/:sn_edc', edcDevicesControllers.delete);

  // Delete all edcDevicesControllers
  router.delete('/', edcDevicesControllers.deleteAll);

  app.use('/api/edcdevices', router);
};
