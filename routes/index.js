const merchantRoute = require('./Merchant');
const deviceRoute = require('./Device');
const bankRoute = require('./UserBank');
const transactionRoute = require('./Transaction');

const router = require('express').Router();

router.use('/merchant', merchantRoute);
router.use('/device', deviceRoute);
router.use('/bank', bankRoute);
router.use('/transaction', transactionRoute);

module.exports = router;
