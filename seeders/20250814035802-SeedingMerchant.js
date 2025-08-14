'use strict';

const merchantsData = require('../data/merchant.json');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const merchants = merchantsData.map((merchant) => ({
      email: merchant.email,
      merchant_name: merchant.merchant_name,
      merchant_id: merchant.merchant_id,
      merchant_code: merchant.merchant_code,
      phone_number: merchant.phone_number,
      password: merchant.password,
      address: merchant.address,
      createdAt: new Date(),
      updatedAt: new Date(),
    }));

    await queryInterface.bulkInsert('Merchants', merchants, {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Merchants', null, {});
  },
};
