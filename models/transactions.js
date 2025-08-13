'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Transactions extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Transactions.init({
    transaction_type: DataTypes.STRING,
    user_id: DataTypes.INTEGER,
    amount: DataTypes.FLOAT,
    status: DataTypes.STRING,
    timestamp: DataTypes.DATE,
    merchant_id: DataTypes.INTEGER,
    sn_edc: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Transactions',
  });
  return Transactions;
};