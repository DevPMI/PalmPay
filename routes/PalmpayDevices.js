const palmpayDevices = require("../controllers/PalmpayDevices.js");

module.exports = app => {
  var router = require("express").Router();

  // Create a new PalmpayDevices
  router.post("/", palmpayDevices.create);

  // Retrieve all PalmpayDevices
  router.get("/", palmpayDevices.findAll);

  // Retrieve a single PalmpayDevices with id
  router.get("/:sn_palmpay", palmpayDevices.findOne);

  // Update a PalmpayDevices with id
  router.put("/:sn_palmpay", palmpayDevices.update);

  // Delete a PalmpayDevices with id
  router.delete("/:sn_palmpay", palmpayDevices.delete);

  // Delete all PalmpayDevices
  router.delete("/", palmpayDevices.deleteAll);

  app.use('/api/palmpaydevices', router);
};