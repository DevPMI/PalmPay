'use strict';
const { Model, Sequelize } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Users_Bank extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Users_Bank.init(
    {
      user_id: {
        unique: true,
        primaryKey: true,
        type: DataTypes.UUID,
        defaultValue: Sequelize.literal('uuid_generate_v4()'),
      },
      username: DataTypes.STRING,
      email: { type: DataTypes.STRING, unique: true },
      phone_number: DataTypes.STRING,
      palm_id: { type: DataTypes.STRING, unique: true },
      nik: { type: DataTypes.STRING, unique: true },
      balance: DataTypes.FLOAT,
    },
    {
      sequelize,
      modelName: 'Users_Banks',
      primaryKey: 'user_id',
    }
  );
  return Users_Bank;
};
