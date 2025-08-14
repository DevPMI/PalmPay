const { comparePassword, createAccessToken } = require('../helper/jwt');
const db = require('../models');
const Edc_Devices = db.Edc_Devices;
const Palmpay_Devices = db.Palmpay_Devices;

class Controller {
  // PAIRING
  static async pairing(req, res, next) {
    try {
      const { sn_edc, sn_palmpay } = req.body;

      const edc_device = await Edc_Devices.findOne({ where: { sn_edc: sn_edc, deletedAt: null } });

      if (!edc_device) {
        throw {
          name: 'SN EDC belum terdaftar.',
        };
      }

      const palmpay_device = await Palmpay_Devices.findOne({ where: { sn_palmpay: sn_palmpay, deletedAt: null } });

      if (!palmpay_device) {
        throw {
          name: 'SN Palmpay belum terdaftar.',
        };
      }

      if (edc_device.sn_palmpay && edc_device.sn_palmpay !== sn_palmpay) {
        throw { name: 'Perangkat EDC sudah terpairing dengan SN Palmpay lain.' };
      }

      if (edc_device.merchant_id !== palmpay_device.merchant_id) {
        throw { name: 'Perangkat EDC dan Palmpay milik merchant berbeda.' };
      }

      res.status(201).json({
        statusCode: 201,
        message: 'Pairing Successful.',
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
