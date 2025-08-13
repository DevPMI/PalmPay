const { comparePassword, hashingPassword, createAccessToken } = require('../helper/jwt');
const db = require('../models');
const formatPhoneNumber = require('../utils/formatPhoneNumber');
const Merchants = db.Merchants;

class Controller {
  // LOGIN
  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      const merchant = await Merchants.findOne({ where: { email: email, deletedAt: null } });

      if (!merchant) {
        throw {
          name: 'Merchant tidak ditemukan.',
        };
      }

      if (!comparePassword(password, merchant.password)) {
        throw { name: 'Email/Password Salah' };
      }

      const payload = {
        merchant_id: merchant.merchant_id,
        merchant_name: merchant.merchant_name,
        email: merchant.email,
        phone_number: merchant.phone_number,
        address: merchant.address,
      };
      const token = createAccessToken(payload);

      res.status(201).json({
        statusCode: 201,
        message: 'Login successful.',
        token: token,
        data: {
          merchant_id: merchant.merchant_id,
          merchant_name: merchant.merchant_name,
          email: merchant.email,
          phone_number: merchant.phone_number,
          address: merchant.address,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  // REGISTER
  static async register(req, res, next) {
    try {
      const { merchant_name, email, password, phone_number, address } = req.body;

      let body = {
        merchant_name,
        email,
        password: hashingPassword(password),
        phone_number: formatPhoneNumber(phone_number),
        address,
        status_aktif: true,
      };

      const data = await Merchants.create(body);

      res.status(201).json({
        statusCode: 201,
        message: `Selamat Merchant ${merchant_name}, anda Berhasil Register`,
        data: data,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
