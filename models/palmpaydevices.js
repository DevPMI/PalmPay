'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class PalmpayDevices extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  PalmpayDevices.init({
    sn_palmpay: DataTypes.STRING,
    merchant_id: DataTypes.INTEGER,
    sn_edc: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'PalmpayDevices',
  });
  return PalmpayDevices;
};