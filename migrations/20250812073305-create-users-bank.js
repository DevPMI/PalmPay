'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users_Banks', {
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        unique: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      username: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
        unique: true,
      },
      phone_number: {
        type: Sequelize.STRING,
      },
      nik: {
        type: Sequelize.STRING,
        unique: true,
      },
      palm_id: {
        type: Sequelize.STRING,
        unique: true,
      },
      palmpay_image_1: {
        type: Sequelize.STRING,
      },
      palmpay_image_2: {
        type: Sequelize.STRING,
      },
      balance: {
        type: Sequelize.FLOAT,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Users_Banks');
  },
};
