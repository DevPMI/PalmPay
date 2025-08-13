/** @format */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const hashingPassword = (password) => bcrypt.hashSync(password);
const comparePassword = (password, hash) => bcrypt.compareSync(password, hash);

const createAccessToken = (payload) =>
	jwt.sign(payload, process.env.SECRET_KEY, {
		expiresIn: '30d',
	});
const verifyAccessToken = (access_token) =>
	jwt.verify(access_token, process.env.SECRET_KEY);

const exclude = [
	'password',
	'code',
	'failed',
	'expiredCode',
	'lastLogin',
	'isActive',
	'statusActive',
];

module.exports = {
	hashingPassword,
	comparePassword,
	createAccessToken,
	verifyAccessToken,
	exclude,
};
