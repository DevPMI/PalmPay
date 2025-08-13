'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class EdcDevices extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  EdcDevices.init({
    sn_edc: DataTypes.STRING,
    device_id: DataTypes.STRING,
    sn_palmpay: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'EdcDevices',
  });
  return EdcDevices;
};