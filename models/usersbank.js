'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class UsersBank extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UsersBank.init({
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    phone_number: DataTypes.STRING,
    nik: DataTypes.STRING,
    palmpay_image: DataTypes.STRING,
    balance: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'UsersBank',
  });
  return UsersBank;
};