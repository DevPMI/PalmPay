const merchantRoute = require('./Merchants');

const router = require('express').Router();

router.use('/merchant', merchantRoute);

module.exports = router;
