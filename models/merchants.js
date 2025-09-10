'use strict';
const { Model, Sequelize } = require('sequelize');
const { randomBytes } = require('crypto');

module.exports = (sequelize, DataTypes) => {
  class Merchants extends Model {
    static associate(models) {
      Merchants.hasMany(models.Edc_Devices, {
        foreignKey: 'merchant_id',
      });

      Merchants.hasMany(models.Transactions, {
        foreignKey: 'merchant_id',
      });

      Merchants.hasMany(models.Palmpay_Devices, {
        foreignKey: 'merchant_id',
      });
    }
  }
  Merchants.init(
    {
      merchant_id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      merchant_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
        defaultValue: () => 'MCT-' + randomBytes(4).toString('hex').toUpperCase(),
      },
      merchant_name: DataTypes.STRING,
      bank: DataTypes.STRING,
      account_number: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      phone_number: DataTypes.STRING,
      password: DataTypes.STRING,
      address: DataTypes.STRING,

      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Merchants',
      paranoid: true,
    }
  );
  return Merchants;
};
