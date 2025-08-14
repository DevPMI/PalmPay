'use strict';

const palmpayDevice = require('../data/palmpay_device.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const palmpay_devices = palmpayDevice.map((device) => ({
      merchant_id: device.merchant_id,
      sn_palmpay: device.sn_palmpay,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('Palmpay_Devices', palmpay_devices, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Palmpay_Devices', null, {});
  },
};
