/** @format */

const handleError = (err, req, res, next) => {
	console.log(err);
	let code = 500;
	let message = 'Internal Server Error';

	if (
		err.name === 'SequelizeValidationError' ||
		err.name == 'SequelizeUniqueConstraintError'
	) {
		code = 400;
		message = [];
		err.errors.forEach((el) => {
			message.push(el.message);
		});
	}

	// 400
	else if (err.name === 'Mohon Masukkan Password') {
		code = 400;
		message = 'Mohon Masukkan Password';
	} else if (err.name === 'Mohon Masukkan Email') {
		code = 400;
		message = 'Mohon Masukkan Email';
	} else if (err.name === 'Masih Ada Adendum yang Belum Disetujui') {
		code = 400;
		message = 'Masih Ada Adendum yang Belum Disetujui';
	} else if (err.name === 'Faktur Pajak Sudah Ada') {
		code = 400;
		message = 'Faktur Pajak Sudah Ada';
	} else if (err.name === 'Adendum Tidak Bisa Dihapus') {
		code = 400;
		message = 'Adendum Tidak Bisa Dihapus';
	} else if (err.name === 'Purchase Tidak Bisa Dihapus') {
		code = 400;
		message = 'Purchase Tidak Bisa Dihapus';
	}
	// 401
	else if (err.name === 'JsonWebTokenError') {
		code = 401;
		message = 'Token Tidak Sesuai';
	} else if (err.name === 'Email/Password Salah') {
		code = 401;
		message = 'Email/Password Salah';
	} else if (err.name === 'Invalid authorization') {
		code = 401;
		message = 'Akses Token Tidak Ada';
	} else if (err.name === 'User Tidak Aktif') {
		code = 401;
		message = 'User Tidak Aktif';
	}

	// 403
	else if (err.name === 'Forbidden') {
		code = 403;
		message = 'Anda Tidak Memiliki Hak Akses';
	} else if (err.name === 'API_KEY Invalid') {
		code = 403;
		message = 'API_KEY Invalid';
	}

	// 404
	else if (err.name === 'Id User Tidak Ditemukan') {
		code = 404;
		message = 'Id User Tidak Ditemukan';
	} else if (err.name === 'Role Tidak Ditemukan') {
		code = 404;
		message = 'Role Tidak Ditemukan';
	} else if (err.name === 'Subkon Tidak Ditemukan') {
		code = 404;
		message = 'Subkon Tidak Ditemukan';
	} else if (err.name === 'Berkas Tidak Ditemukan') {
		code = 404;
		message = 'Berkas Tidak Ditemukan';
	} else if (err.name === 'Client Tidak Ditemukan') {
		code = 404;
		message = 'Client Tidak Ditemukan';
	} else if (err.name === 'Project Tidak Ditemukan') {
		code = 404;
		message = 'Project Tidak Ditemukan';
	} else if (err.name === 'Item Project Tidak Ditemukan') {
		code = 404;
		message = 'Item Project Tidak Ditemukan';
	} else if (err.name === 'Berkas Project Tidak Ditemukan') {
		code = 404;
		message = 'Berkas Project Tidak Ditemukan';
	} else if (err.name === 'Adendum Tidak Ditemukan') {
		code = 404;
		message = 'Adendum Tidak Ditemukan';
	} else if (err.name === 'Purchase Tidak Ditemukan') {
		code = 404;
		message = 'Purchase Tidak Ditemukan';
	} else if (err.name === 'Termin Project Tidak Ditemukan') {
		code = 404;
		message = 'Termin Project Tidak Ditemukan';
	}
	res.status(code).json({
		statusCode: code,
		message: message,
	});
};

module.exports = handleError;
