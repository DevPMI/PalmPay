/** @format */

const handleError = (err, req, res, next) => {
  console.log(err);
  let code = 500;
  let message = 'Internal Server Error';

  if (err.name === 'SequelizeValidationError' || err.name == 'SequelizeUniqueConstraintError') {
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
  } else if (err.name === 'Format file gambar kedua tidak valid. Hanya JPG/JPEG/PNG yang diizinkan.') {
    code = 400;
    message = 'Format file gambar kedua tidak valid. Hanya JPG/JPEG/PNG yang diizinkan.';
  } else if (err.name === 'Format file gambar pertama tidak valid. Hanya JPG/JPEG/PNG yang diizinkan.') {
    code = 400;
    message = 'Format file gambar pertama tidak valid. Hanya JPG/JPEG/PNG yang diizinkan.';
  } else if (err.name === 'Data transaksi tidak lengkap.') {
    code = 400;
    message = 'Data transaksi tidak lengkap.';
  } else if (err.name === 'Saldo tidak mencukupi.') {
    code = 400;
    message = 'Saldo tidak mencukupi.';
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
  } else if (err.name === 'Perangkat EDC sudah terpairing dengan SN Palmpay lain.') {
    code = 401;
    message = 'Perangkat EDC sudah terpairing dengan SN Palmpay lain.';
  } else if (err.name === 'Perangkat EDC dan Palmpay milik merchant berbeda.') {
    code = 401;
    message = 'Perangkat EDC dan Palmpay milik merchant berbeda.';
  } else if (err.name === 'SN Palmpay belum terdaftar.') {
    code = 401;
    message = 'SN Palmpay belum terdaftar.';
  } else if (err.name === 'SN EDC belum terdaftar.') {
    code = 401;
    message = 'SN EDC belum terdaftar.';
  }

  // 403
  else if (err.name === 'Forbidden') {
    code = 403;
    message = 'Anda Tidak Memiliki Hak Akses';
  } else if (err.name === 'API_KEY Invalid') {
    code = 403;
    message = 'API_KEY Invalid';
  } else if (err.name === 'Merchant tidak ditemukan.') {
    code = 403;
    message = 'Merchant tidak ditemukan.';
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
  } else if (err.name === 'Pengguna dengan Palm ID tersebut tidak terdaftar.') {
    code = 404;
    message = 'Pengguna dengan Palm ID tersebut tidak terdaftar.';
  } else if (err.name === 'Merchant tidak valid atau tidak ditemukan.') {
    code = 404;
    message = 'Merchant tidak valid atau tidak ditemukan.';
  }
  res.status(code).json({
    statusCode: code,
    message: message,
  });
};

module.exports = handleError;
