/** @format */

const { verifyAccessToken } = require('../helper/jwt');
const { Merchants } = require('../models/index');

const authentication = async (req, res, next) => {
  try {
    const { token } = req.headers;
    let payload = verifyAccessToken(token);
    let dataUser = await Merchants.findOne({
      where: {
        merchant_id: payload.merchant_id,
        deletedAt: null,
      },
    });

    if (!dataUser) {
      throw { name: 'Invalid authorization' };
    }

    // if (!dataUser.status_aktif) {
    //   throw { name: 'User Tidak Aktif' };
    // }

    req.user = {
      merchant_id: dataUser.merchant_id,
      email: dataUser.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authentication;
