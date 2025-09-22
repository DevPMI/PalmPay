/** @format */

'use strict';

const { DataTypes } = require('sequelize');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Menambahkan kolom static_qr_string ke tabel Merchants
    await queryInterface.addColumn('Merchants', 'static_qr_string', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  },
  async down(queryInterface, Sequelize) {
    // Jika perlu rollback, hapus kolom static_qr_string
    await queryInterface.removeColumn('Merchants', 'static_qr_string');
  },
};
