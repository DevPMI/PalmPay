/** @format */

const { verifyAccessToken } = require('../helper/jwt');
const { User } = require('../models/index');

const authentication = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    let payload = verifyAccessToken(authorization);
    let dataUser = await User.findOne({
      where: {
        id: payload.id,
        deletedAt: null,
      },
    });

    if (!dataUser) {
      throw { name: 'Invalid authorization' };
    }

    if (!dataUser.status_aktif) {
      throw { name: 'User Tidak Aktif' };
    }

    req.user = {
      id: dataUser.id,
      email: dataUser.email,
    };

    next();
  } catch (error) {
    next(error);
  }
};

module.exports = authentication;
