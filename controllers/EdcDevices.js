const db = require('../models');
const EdcDevices = db.EdcDevices;

// Create and Save a new EdcDevices
exports.create = (req, res) => {
  // Validate request
  if (!req.body.sn_edc) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a EdcDevices
  const edcDevice = {
    sn_edc: req.body.sn_edc,
    device_id: req.body.device_id,
    merchant_id: req.body.merchant_id,
    sn_palmpay: req.body.sn_palmpay
  };

  // Save EdcDevices in the database
  EdcDevices.create(edcDevice)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the EdcDevices."
      });
    });
};

// Retrieve all EdcDevices from the database.
exports.findAll = (req, res) => {
  EdcDevices.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving edcDevices."
      });
    });
};

// Find a single EdcDevices with an id
exports.findOne = (req, res) => {
  const sn_edc = req.params.sn_edc;

  EdcDevices.findByPk(sn_edc)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find EdcDevices with sn_edc=${sn_edc}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving EdcDevices with sn_edc=" + sn_edc
      });
    });
};

// Update a EdcDevices by the id in the request
exports.update = (req, res) => {
  const sn_edc = req.params.sn_edc;

  EdcDevices.update(req.body, {
    where: { sn_edc: sn_edc }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "EdcDevices was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update EdcDevices with sn_edc=${sn_edc}. Maybe EdcDevices was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating EdcDevices with sn_edc=" + sn_edc
      });
    });
};

// Delete a EdcDevices with the specified id in the request
exports.delete = (req, res) => {
  const sn_edc = req.params.sn_edc;

  EdcDevices.destroy({
    where: { sn_edc: sn_edc }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "EdcDevices was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete EdcDevices with sn_edc=${sn_edc}. Maybe EdcDevices was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete EdcDevices with sn_edc=" + sn_edc
      });
    });
};

// Delete all EdcDevices from the database.
exports.deleteAll = (req, res) => {
  EdcDevices.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} EdcDevices were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all edcDevices."
      });
    });
};