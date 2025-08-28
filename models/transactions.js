'use strict';
const { Model, Sequelize } = require('sequelize');
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
  Transactions.init(
    {
      transaction_id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.UUID,
        allowNull: false,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      transaction_method: DataTypes.STRING,
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      amount: DataTypes.FLOAT,
      status: DataTypes.STRING,
      timestamp: DataTypes.DATE,
      merchant_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      sn_edc: DataTypes.STRING,
      palm_id: DataTypes.STRING,
      // PENAMBAHAN PENTING: Kolom untuk gambar tetap dibutuhkan
      palmpay_image1: DataTypes.STRING,
      palmpay_image2: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: 'Transactions',
      timestamps: true,
    }
  );
  return Transactions;
};
