const db = require('../models');
const PalmpayDevices = db.PalmpayDevices;

// Create and Save a new PalmpayDevices
exports.create = (req, res) => {
  // Validate request
  if (!req.body.sn_palmpay) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a PalmpayDevices
  const palmpayDevice = {
    sn_palmpay: req.body.sn_palmpay,
    merchant_id: req.body.merchant_id,
    sn_edc: req.body.sn_edc
  };

  // Save PalmpayDevices in the database
  PalmpayDevices.create(palmpayDevice)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the PalmpayDevices."
      });
    });
};

// Retrieve all PalmpayDevices from the database.
exports.findAll = (req, res) => {
  PalmpayDevices.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving palmpayDevices."
      });
    });
};

// Find a single PalmpayDevices with an id
exports.findOne = (req, res) => {
  const sn_palmpay = req.params.sn_palmpay;

  PalmpayDevices.findByPk(sn_palmpay)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find PalmpayDevices with sn_palmpay=${sn_palmpay}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving PalmpayDevices with sn_palmpay=" + sn_palmpay
      });
    });
};

// Update a PalmpayDevices by the id in the request
exports.update = (req, res) => {
  const sn_palmpay = req.params.sn_palmpay;

  PalmpayDevices.update(req.body, {
    where: { sn_palmpay: sn_palmpay }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "PalmpayDevices was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update PalmpayDevices with sn_palmpay=${sn_palmpay}. Maybe PalmpayDevices was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating PalmpayDevices with sn_palmpay=" + sn_palmpay
      });
    });
};

// Delete a PalmpayDevices with the specified id in the request
exports.delete = (req, res) => {
  const sn_palmpay = req.params.sn_palmpay;

  PalmpayDevices.destroy({
    where: { sn_palmpay: sn_palmpay }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "PalmpayDevices was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete PalmpayDevices with sn_palmpay=${sn_palmpay}. Maybe PalmpayDevices was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete PalmpayDevices with sn_palmpay=" + sn_palmpay
      });
    });
};

// Delete all PalmpayDevices from the database.
exports.deleteAll = (req, res) => {
  PalmpayDevices.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} PalmpayDevices were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all palmpayDevices."
      });
    });
};