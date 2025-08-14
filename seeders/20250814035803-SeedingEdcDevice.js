'use strict';

const edcDevice = require('../data/edc_device.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const edc_devices = edcDevice.map((device) => ({
      sn_edc: device.sn_edc,
      sn_palmpay: device.sn_palmpay,
      device_id: device.device_id,
      merchant_id: device.merchant_id,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('Edc_Devices', edc_devices, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Edc_Devices', null, {});
  },
};
