'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Payments extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Payments.init({
    transaction_id: DataTypes.INTEGER,
    payment_method: DataTypes.STRING,
    payment_status: DataTypes.STRING,
    amount: DataTypes.FLOAT,
    paid_at: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'Payments',
  });
  return Payments;
};