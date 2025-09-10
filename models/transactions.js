'use strict';
const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transactions extends Model {
    static associate(models) {
      Transactions.belongsTo(models.Merchants, {
        foreignKey: 'merchant_id',
      });

      Transactions.hasOne(models.Xendit_QR_Payments, {
        foreignKey: 'transaction_id',
      });
    }
  }
  Transactions.init(
    {
      transaction_id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      transaction_method: DataTypes.STRING,
      user_id: {
        type: DataTypes.UUID,
        allowNull: true,
      },
      amount: DataTypes.FLOAT,
      status: DataTypes.STRING,
      timestamp: {
        type: DataTypes.DATE, // watku sukses transaksi
        allowNull: true,
      },
      receipt_path: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      merchant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sn_edc: DataTypes.STRING,
      palm_id: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Transactions',
      timestamps: true,
    }
  );
  return Transactions;
};
