'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Xendit_QR_Payments', {
      id: {
        type: Sequelize.UUID,
        allowNull: false,
        primaryKey: true,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      transaction_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
          model: 'Transactions', // Nama tabel yang direferensikan
          key: 'transaction_id',
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE', // Jika transaksi dihapus, data pembayaran ini juga ikut terhapus
      },
      xendit_qr_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      external_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      qr_string: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
      },
      expires_at: {
        type: Sequelize.DATE,
        allowNull: false,
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
    await queryInterface.dropTable('Xendit_QR_Payments');
  },
};
