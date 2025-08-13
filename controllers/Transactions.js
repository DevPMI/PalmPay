const db = require('../models');
const Transactions = db.Transactions;

// Create and Save a new Transaction
exports.create = (req, res) => {
  // Validate request
  if (!req.body.transaction_type) {
    res.status(400).send({
      message: "Content can not be empty!"
    });
    return;
  }

  // Create a Transaction
  const transaction = {
    transaction_type: req.body.transaction_type,
    user_id: req.body.user_id,
    amount: req.body.amount,
    status: req.body.status,
    timestamp: req.body.timestamp,
    merchant_id: req.body.merchant_id,
    sn_edc: req.body.sn_edc
  };

  // Save Transaction in the database
  Transactions.create(transaction)
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while creating the Transaction."
      });
    });
};

// Retrieve all Transactions from the database.
exports.findAll = (req, res) => {
  Transactions.findAll()
    .then(data => {
      res.send(data);
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while retrieving transactions."
      });
    });
};

// Find a single Transaction with an id
exports.findOne = (req, res) => {
  const transaction_id = req.params.transaction_id;

  Transactions.findByPk(transaction_id)
    .then(data => {
      if (data) {
        res.send(data);
      } else {
        res.status(404).send({
          message: `Cannot find Transaction with id=${transaction_id}.`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error retrieving Transaction with id=" + transaction_id
      });
    });
};

// Update a Transaction by the id in the request
exports.update = (req, res) => {
  const transaction_id = req.params.transaction_id;

  Transactions.update(req.body, {
    where: { transaction_id: transaction_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Transaction was updated successfully."
        });
      } else {
        res.send({
          message: `Cannot update Transaction with id=${transaction_id}. Maybe Transaction was not found or req.body is empty!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Error updating Transaction with id=" + transaction_id
      });
    });
};

// Delete a Transaction with the specified id in the request
exports.delete = (req, res) => {
  const transaction_id = req.params.transaction_id;

  Transactions.destroy({
    where: { transaction_id: transaction_id }
  })
    .then(num => {
      if (num == 1) {
        res.send({
          message: "Transaction was deleted successfully!"
        });
      } else {
        res.send({
          message: `Cannot delete Transaction with id=${transaction_id}. Maybe Transaction was not found!`
        });
      }
    })
    .catch(err => {
      res.status(500).send({
        message: "Could not delete Transaction with id=" + transaction_id
      });
    });
};

// Delete all Transactions from the database.
exports.deleteAll = (req, res) => {
  Transactions.destroy({
    where: {},
    truncate: false
  })
    .then(nums => {
      res.send({ message: `${nums} Transactions were deleted successfully!` });
    })
    .catch(err => {
      res.status(500).send({
        message:
          err.message || "Some error occurred while removing all transactions."
      });
    });
};