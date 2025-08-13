'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Menambahkan foreign key di tabel Edc_Devices
    await queryInterface.addConstraint('Edc_Devices', {
      fields: ['sn_palmpay'],
      type: 'foreign key',
      name: 'fk_sn_palmpay_to_edc', // Nama unik untuk constraint
      references: {
        table: 'Palmpay_Devices',
        field: 'sn_palmpay',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });

    // Menambahkan foreign key di tabel Palmpay_Device
    await queryInterface.addConstraint('Palmpay_Devices', {
      fields: ['sn_edc'],
      type: 'foreign key',
      name: 'fk_sn_edc_to_palmpay', // Nama unik untuk constraint
      references: {
        table: 'Edc_Devices',
        field: 'sn_edc',
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL',
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Edc_Devices', 'fk_sn_palmpay_to_edc');
    await queryInterface.removeConstraint('Palmpay_Devices', 'fk_sn_edc_to_palmpay');
  },
};
