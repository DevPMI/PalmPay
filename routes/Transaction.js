/** @format */

const Controller = require('../controllers/Transaction');
const authentication = require('../middleware/Authentication');
// const XenditTransactionController = require('../controllers/Xendit/xenditTransactionController');

const userRoute = require('express').Router();

userRoute.post('/', authentication, Controller.palmpay);

userRoute.post('/getstatus-qr', authentication, Controller.getQRCodeStatus);
userRoute.post('/create-qr', authentication, Controller.createQRCode);
userRoute.get('/get-static-qr/:merchantId', authentication, Controller.getStaticQRCode);
userRoute.get('/get-qrid/:qrId', authentication, Controller.getQRCodeByID);
userRoute.get('/get-all-trx', authentication, Controller.inquiryAllTransaction);
userRoute.post('/payment-callback', Controller.callbackQRTransaction);
userRoute.get('/receipt/:referenceId', authentication, Controller.streamPDFInvoice);

module.exports = userRoute;
