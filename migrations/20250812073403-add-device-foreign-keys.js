'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Tambahkan kunci asing ke tabel `Palmpay_Devices`
    await queryInterface.addConstraint('Palmpay_Devices', {
      fields: ['sn_edc'],
      type: 'foreign key',
      name: 'fk_sn_edc_to_palmpay',
      references: {
        table: 'Edc_Devices',
        field: 'sn_edc',
      },
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE',
    });
  },

  async down(queryInterface, Sequelize) {
    // Hapus kunci asing dari tabel `Palmpay_Devices`
    await queryInterface.removeConstraint('Palmpay_Devices', 'fk_sn_edc_to_palmpay');
  },
};
