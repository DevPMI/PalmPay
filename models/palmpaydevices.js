'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Palmpay_Devices extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Palmpay_Devices.belongsTo(models.Merchants, {
        foreignKey: 'merchant_id',
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
      merchant_id: DataTypes.INTEGER,
      deletedAt: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: 'Palmpay_Devices',
    }
  );
  return Palmpay_Devices;
};
