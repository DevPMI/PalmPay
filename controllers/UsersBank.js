const db = require('../models');
const UsersBank = db.UsersBank;

// Create and Save a new UsersBank
exports.create = (req, res) => {
  // Validate request
  if (!req.body.username) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a UsersBank
  const usersBank = {
    username: req.body.username,
    email: req.body.email,
    phone_number: req.body.phone_number,
    nik: req.body.nik,
    palmpay_image: req.body.palmpay_image,
    balance: req.body.balance
  };

  // Save UsersBank in the database
  UsersBank.create(usersBank)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the UsersBank."
      });
    });
};

// Retrieve all UsersBank from the database.
exports.findAll = (req, res) => {
  UsersBank.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving usersBank."
      });
    });
};

// Find a single UsersBank with an id
exports.findOne = (req, res) => {
  const user_id = req.params.user_id;

  UsersBank.findByPk(user_id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find UsersBank with id=${user_id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving UsersBank with id=" + user_id
      });
    });
};

// Update a UsersBank by the id in the request
exports.update = (req, res) => {
  const user_id = req.params.user_id;

  UsersBank.update(req.body, {
    where: { user_id: user_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "UsersBank was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update UsersBank with id=${user_id}. Maybe UsersBank was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating UsersBank with id=" + user_id
      });
    });
};

// Delete a UsersBank with the specified id in the request
exports.delete = (req, res) => {
  const user_id = req.params.user_id;

  UsersBank.destroy({
    where: { user_id: user_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "UsersBank was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete UsersBank with id=${user_id}. Maybe UsersBank was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete UsersBank with id=" + user_id
      });
    });
};

// Delete all UsersBank from the database.
exports.deleteAll = (req, res) => {
  UsersBank.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} UsersBank were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all usersBank."
      });
    });
};