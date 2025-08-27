const db = require('../models');
const Transactions = db.Transactions;

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
        merchant_code: merchant.merchant_code,
      };
      const token = createAccessToken(payload);

      res.status(201).json({
        statusCode: 201,
        message: 'Login successful.',
        token: token,
        data: {
          merchant_id: merchant.merchant_id,
          merchant_name: merchant.merchant_name,
          merchant_code: merchant.merchant_code,
          email: merchant.email,
          phone_number: merchant.phone_number,
          address: merchant.address,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
