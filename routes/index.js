const merchantRoute = require('./Merchant');
const deviceRoute = require('./Device');
const bankRoute = require('./UserBank');
const transactionRoute = require('./Transaction');
const historyRoute = require('./History'); // Import history routes

const router = require('express').Router();

router.use('/merchant', merchantRoute);
router.use('/device', deviceRoute);
router.use('/bank', bankRoute);
router.use('/transaction', transactionRoute);
router.use('/history', historyRoute); // Use history routes

module.exports = router;
