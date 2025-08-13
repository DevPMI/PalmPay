'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Transactions', {
      transaction_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      transaction_type: {
        type: Sequelize.STRING,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Users_Bank',
          key: 'user_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
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
