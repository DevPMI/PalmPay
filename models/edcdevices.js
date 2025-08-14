'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Edc_Devices extends Model {
    static associate(models) {
      Edc_Devices.belongsTo(models.Merchants, {
        foreignKey: 'merchant_id',
      });
    }
  }
  Edc_Devices.init(
    {
      sn_edc: {
        type: DataTypes.STRING,
        allowNull: false,
        primaryKey: true,
      },
      device_id: DataTypes.STRING,
      merchant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sn_palmpay: DataTypes.STRING,
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Edc_Devices',
    }
  );
  return Edc_Devices;
};
