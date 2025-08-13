'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Palmpay_Devices', {
      sn_palmpay: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
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
        type: Sequelize.STRING, // Kolom tetap ada, tapi tanpa foreign key references
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
    await queryInterface.dropTable('Palmpay_Devices');
  },
};
