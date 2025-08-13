const db = require('../models');
const Payments = db.Payments;

// Create and Save a new Payment
exports.create = (req, res) => {
  // Validate request
  if (!req.body.transaction_id) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Payment
  const payment = {
    transaction_id: req.body.transaction_id,
    payment_method: req.body.payment_method,
    payment_status: req.body.payment_status,
    amount: req.body.amount,
    paid_at: req.body.paid_at
  };

  // Save Payment in the database
  Payments.create(payment)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Payment."
      });
    });
};

// Retrieve all Payments from the database.
exports.findAll = (req, res) => {
  Payments.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving payments."
      });
    });
};

// Find a single Payment with an id
exports.findOne = (req, res) => {
  const payment_id = req.params.payment_id;

  Payments.findByPk(payment_id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Payment with id=${payment_id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Payment with id=" + payment_id
      });
    });
};

// Update a Payment by the id in the request
exports.update = (req, res) => {
  const payment_id = req.params.payment_id;

  Payments.update(req.body, {
    where: { payment_id: payment_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Payment was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Payment with id=${payment_id}. Maybe Payment was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Payment with id=" + payment_id
      });
    });
};

// Delete a Payment with the specified id in the request
exports.delete = (req, res) => {
  const payment_id = req.params.payment_id;

  Payments.destroy({
    where: { payment_id: payment_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Payment was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Payment with id=${payment_id}. Maybe Payment was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Payment with id=" + payment_id
      });
    });
};

// Delete all Payments from the database.
exports.deleteAll = (req, res) => {
  Payments.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Payments were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all payments."
      });
    });
};