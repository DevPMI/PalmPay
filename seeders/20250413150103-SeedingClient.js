/** @format */

'use strict';

/** @type {import('sequelize-cli').Migration} */

const dataClient = require('../data/client.json');

module.exports = {
	async up(queryInterface, Sequelize) {
		const clients = dataClient.map((client) => ({
			nama: client.nama,
			keterangan: client.keterangan,
			createdAt: new Date(),
			updatedAt: new Date(),
		}));

		await queryInterface.bulkInsert('Clients', clients, {});
	},

	async down(queryInterface, Sequelize) {
		await queryInterface.bulkDelete('Clients', null, {});
	},
};
