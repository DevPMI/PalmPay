const merchantRoute = require('./Merchant');
const deviceRoute = require('./Device');

const router = require('express').Router();

router.use('/merchant', merchantRoute);
router.use('/device', deviceRoute);

module.exports = router;
