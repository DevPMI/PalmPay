'use strict';
const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Xendit_QR_Payments extends Model {
    static associate(models) {
      // Pembayaran ini adalah milik satu Transaksi
      Xendit_QR_Payments.belongsTo(models.Transactions, {
        foreignKey: 'transaction_id',
      });
    }
  }
  Xendit_QR_Payments.init(
    {
      id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      transaction_id: {
        // Foreign key ke tabel Transactions
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Transactions',
          key: 'transaction_id',
        },
      },
      xendit_qr_id: {
        // ID unik yang diberikan oleh Xendit untuk QR ini
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      external_id: {
        // ID dari sisi kita yang dikirim ke Xendit (biasanya transaction_id)
        type: DataTypes.STRING,
        allowNull: false,
      },
      qr_string: {
        // String data QR Code yang akan ditampilkan ke pengguna
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        // Status dari QR code (e.g., PENDING, COMPLETED, EXPIRED)
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'PENDING',
      },
      expires_at: {
        // Waktu kedaluwarsa QR code
        type: DataTypes.DATE,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: 'Xendit_QR_Payments',
      timestamps: true, // Otomatis menambahkan createdAt dan updatedAt
    }
  );
  return Xendit_QR_Payments;
};
