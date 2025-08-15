'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Palmpay_Devices extends Model {
    static associate(models) {
      // Palmpay_Devices adalah milik satu Merchants
      Palmpay_Devices.belongsTo(models.Merchants, {
        foreignKey: 'merchant_id',
      });

      // Palmpay_Devices adalah milik satu Edc_Devices
      Palmpay_Devices.belongsTo(models.Edc_Devices, {
        foreignKey: 'sn_edc',
      });
    }
  }
  Palmpay_Devices.init(
    {
      sn_palmpay: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      merchant_id: DataTypes.UUID,
      sn_edc: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true,
      },
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Palmpay_Devices',
      paranoid: true,
      primaryKey: 'sn_palmpay',
    }
  );
  return Palmpay_Devices;
};
