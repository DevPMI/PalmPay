'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Payments', {
      payment_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
      },
      transaction_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'Transactions',
          key: 'transaction_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
      },
      payment_method: {
        type: Sequelize.STRING,
      },
      payment_status: {
        type: Sequelize.STRING,
      },
      amount: {
        type: Sequelize.FLOAT,
      },
      paid_at: {
        type: Sequelize.DATE,
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
    await queryInterface.dropTable('Payments');
  },
};
