'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      transaction_id: {
        type: Sequelize.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      transaction_method: {
        type: Sequelize.STRING,
      },
      user_id: {
        type: Sequelize.UUID,
        allowNull: false,
      },
      amount: {
        type: Sequelize.FLOAT,
      },
      status: {
        type: Sequelize.STRING,
      },
      timestamp: {
        type: Sequelize.DATE,
      },
      merchant_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Merchants',
          key: 'merchant_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      sn_edc: {
        type: Sequelize.STRING,
        references: {
          model: 'Edc_Devices',
          key: 'sn_edc',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      palm_id: {
        type: Sequelize.STRING,
      },
      palmpay_image1: {
        type: Sequelize.STRING,
      },
      palmpay_image2: {
        type: Sequelize.STRING,
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
    await queryInterface.dropTable('Transactions');
  },
};
