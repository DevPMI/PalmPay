const transactions = require("../controllers/Transactions.js");

module.exports = app => {
  var router = require("express").Router();

  // Create a new Transaction
  router.post("/", transactions.create);

  // Retrieve all Transactions
  router.get("/", transactions.findAll);

  // Retrieve a single Transaction with id
  router.get("/:transaction_id", transactions.findOne);

  // Update a Transaction with id
  router.put("/:transaction_id", transactions.update);

  // Delete a Transaction with id
  router.delete("/:transaction_id", transactions.delete);

  // Delete all Transactions
  router.delete("/", transactions.deleteAll);

  app.use('/api/transactions', router);
};