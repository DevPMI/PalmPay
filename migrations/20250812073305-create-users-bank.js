'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Users_Bank', {
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: Sequelize.STRING,
      },
      email: {
        type: Sequelize.STRING,
      },
      phone_number: {
        type: Sequelize.STRING,
      },
      nik: {
        type: Sequelize.STRING,
      },
      palmpay_image: {
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
    await queryInterface.dropTable('Users_Bank');
  },
};
