const merchantRoute = require('./Merchant');
const deviceRoute = require('./Device');
const bankRoute = require('./UserBank');

const router = require('express').Router();

router.use('/merchant', merchantRoute);
router.use('/device', deviceRoute);
router.use('/bank', bankRoute);

module.exports = router;
