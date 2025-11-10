const express = require('express');
const router = express.Router();
const HistoryController = require('../controllers/HistoryController');

router.get('/', HistoryController.getHistory);

module.exports = router;
