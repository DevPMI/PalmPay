// const bcrypt = require('bcryptjs');
// const { JWTSECRET, SECRET_NEWLAND_API, TOMS_APP_ID } = require('../config/constant');
// const jwt = require('jsonwebtoken');
// const crypto = require('crypto');
// const CryptoJS = require('crypto-js');

// const generateToken = (id) => {
//   return jwt.sign({ id }, JWTSECRET, { expiresIn: '24h' });
// };

// const matchPassword = async function (enteredPassword, storedPassword) {
//   return await bcrypt.compare(enteredPassword, storedPassword);
// };

// const encryptPass = async function (enteredPassword) {
//   return await bcrypt.hash(enteredPassword, 10);
// };

const formatRupiah = (number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
  }).format(number);
};

// const generateReferenceID = (deviceId) => {
//   try {
//     const id = crypto.randomBytes(10).toString('hex');
//     return `order-${id}`;
//   } catch (error) {
//     throw error;
//   }
// };

// const unixTimestamp = () => {
//   return Math.floor(Date.now() / 1000);
// };

// const headersToms = (url, method, body) => {
//   try {
//     var timestamp = (new Date().getTime() / 1000) | 0;
//     // var timestamp = 1753324471;
//     let nonce = CryptoJS.lib.WordArray.random(3).toString();
//     // let nonce = "ae64d8";
//     const appId = TOMS_APP_ID;
//     const md5Body = CryptoJS.MD5(JSON.stringify(body)).toString().toUpperCase();

//     console.log('MD5 Body => ', md5Body);

//     let TBSStr = '';
//     const whetherInclude = url.includes('?');
//     if (whetherInclude) {
//       TBSStr = method + url + '&appId=' + appId + '&nonce=' + nonce + '&timestamp=' + timestamp + '&body=' + md5Body;
//     } else {
//       TBSStr = method + url + '?appId=' + appId + '&nonce=' + nonce + '&timestamp=' + timestamp + '&body=' + md5Body;
//     }

//     console.log('TBSStr => ', TBSStr);
//     const result = CryptoJS.HmacSHA256(TBSStr, CryptoJS.enc.Base64.parse(SECRET_NEWLAND_API));

//     var xtomssign = CryptoJS.enc.Base64.stringify(result);

//     return { appId: appId, xtime: timestamp, xnonce: nonce, tsign: xtomssign };
//   } catch (error) {
//     throw error;
//   }
// };

module.exports = {
  // generateToken,
  // matchPassword,
  formatRupiah,
  // encryptPass,
  // generateReferenceID,
  // unixTimestamp,
  // headersToms,
};
