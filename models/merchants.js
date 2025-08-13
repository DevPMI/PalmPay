'use strict';
const { Model, Sequelize } = require('sequelize');
const { randomBytes } = require('crypto');

module.exports = (sequelize, DataTypes) => {
  class Merchants extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
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
      },
      merchant_name: DataTypes.STRING,
      email: DataTypes.STRING,
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
      hooks: {
        beforeCreate: async (merchant, options) => {
          const randomString = randomBytes(4).toString('hex').toUpperCase();
          merchant.merchant_code = 'MCT-' + randomString;
        },
      },
    }
  );
  return Merchants;
};
