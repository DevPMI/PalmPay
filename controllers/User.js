const db = require('../models');
const Users = db.Users;
const path = require('path');
const fs = require('fs');

class Controller {
  static async register(req, res, next) {
    let image1Path = null;
    let image2Path = null;

    try {
      const { username, palm_id, email, phone_number, nik, balance, palmpay_image_1, palmpay_image_2 } = req.body;

      if (!username || !email || !nik || !palm_id) {
        throw { name: 'Data tidak lengkap.' };
      }

      // Definisikan path untuk folder di dalam public
      const relativeUploadDir = 'images/palmpayImages';
      const absoluteUploadDir = path.join(__dirname, '..', 'public', relativeUploadDir);

      if (!fs.existsSync(absoluteUploadDir)) {
        fs.mkdirSync(absoluteUploadDir, { recursive: true });
      }

      let image1Url = null;
      let image2Url = null;

      // Fungsi helper untuk mendapatkan tipe file dari string Base64
      const getFileType = (base64String) => {
        const matches = base64String.match(/^data:([A-Za-z-+\/]+);base64,(.*)$/);
        return matches ? matches[1] : null;
      };

      // Proses gambar pertama
      if (palmpay_image_1) {
        // Validasi format Base64 dan tipe file
        const fileType1 = getFileType(palmpay_image_1);
        if (!fileType1 || (fileType1 !== 'image/jpeg' && fileType1 !== 'image/png')) {
          throw { name: 'Format file gambar pertama tidak valid. Hanya JPG/JPEG/PNG yang diizinkan.' };
        }

        const base64Data = palmpay_image_1.split(';base64,').pop();
        const imageName1 = `palmpay_image_1_${Date.now()}.jpeg`;

        // Simpan path absolut untuk referensi penghapusan jika terjadi error
        image1Path = path.join(absoluteUploadDir, imageName1);
        fs.writeFileSync(image1Path, base64Data, { encoding: 'base64' });

        // Simpan path relatif ke database
        image1Url = `${relativeUploadDir}/${imageName1}`;
      }

      // Proses gambar kedua
      if (palmpay_image_2) {
        // Validasi format Base64 dan tipe file
        const fileType2 = getFileType(palmpay_image_2);
        if (!fileType2 || (fileType2 !== 'image/jpeg' && fileType2 !== 'image/png')) {
          throw { name: 'Format file gambar kedua tidak valid. Hanya JPG/JPEG/PNG yang diizinkan.' };
        }

        const base64Data = palmpay_image_2.split(';base64,').pop();
        const imageName2 = `palmpay_image_2_${Date.now()}.jpeg`;

        // Simpan path absolut untuk referensi penghapusan jika terjadi error
        image2Path = path.join(absoluteUploadDir, imageName2);
        fs.writeFileSync(image2Path, base64Data, { encoding: 'base64' });

        // Simpan path relatif ke database
        image2Url = `${relativeUploadDir}/${imageName2}`;
      }

      const newUser = await Users_Banks.create({
        username,
        email,
        phone_number,
        nik,
        palm_id,
        palmpay_image_1: image1Url,
        palmpay_image_2: image2Url,
        balance,
      });

      res.status(201).json({
        statusCode: 201,
        message: 'Pendaftaran user bank berhasil.',
        data: newUser,
      });
    } catch (error) {
      // Hapus file yang sudah disimpan jika terjadi error
      if (image1Path && fs.existsSync(image1Path)) {
        fs.unlinkSync(image1Path);
      }
      if (image2Path && fs.existsSync(image2Path)) {
        fs.unlinkSync(image2Path);
      }

      next(error);
    }
  }

  static async scanToPay(req, res, next) {
    let temporaryImagePath = null;
    try {
      const { source_user_id, palmpay_image } = req.body;

      if (!source_user_id || !palmpay_image) {
        throw { name: 'Data tidak lengkap.' };
      }

      // 1. Simpan image sementara
      // Kita gunakan folder terpisah untuk gambar sementara
      const tempUploadDir = path.join(__dirname, '..', 'tempImages');
      if (!fs.existsSync(tempUploadDir)) {
        fs.mkdirSync(tempUploadDir, { recursive: true });
      }

      const base64Data = palmpay_image.split(';base64,').pop();
      const imageName = `temp_scan_${Date.now()}.jpeg`;
      temporaryImagePath = path.join(tempUploadDir, imageName);
      fs.writeFileSync(temporaryImagePath, base64Data, { encoding: 'base64' });

      // 2. Periksa data image di database
      // Asumsi string yang disimpan adalah path relatif
      const palmpayImageUrl = `images/palmpayImages/${imageName}`;
      const destinationUser = await Users_Banks.findOne({
        where: { palmpay_image_1: palmpayImageUrl },
      });

      // Jika gambar tidak terdaftar, lempar error
      if (!destinationUser) {
        throw { name: 'Gambar tujuan tidak terdaftar. Pembayaran dibatalkan.' };
      }

      // 3. Potong saldo jika sudah terdaftar
      const sourceUser = await Users_Banks.findByPk(source_user_id);

      if (!sourceUser) {
        throw { name: 'Pengguna pengirim tidak ditemukan.' };
      }

      if (sourceUser.balance < 100) {
        // Asumsi nominal transaksi minimal Rp 100
        throw { name: 'Saldo tidak cukup.' };
      }

      // Lakukan transaksi (kurangi saldo pengirim, tambahkan saldo penerima)
      sourceUser.balance -= 100; // Contoh: potong saldo Rp 100
      destinationUser.balance += 100;
      await sourceUser.save();
      await destinationUser.save();

      // 4. Hapus gambar sementara
      if (temporaryImagePath && fs.existsSync(temporaryImagePath)) {
        fs.unlinkSync(temporaryImagePath);
      }
      temporaryImagePath = null; // Reset agar tidak dihapus lagi di block catch

      // 5. Kirim return pembayaran berhasil
      res.status(200).json({
        statusCode: 200,
        message: 'Pembayaran berhasil.',
        data: {
          sourceUser: sourceUser.username,
          destinationUser: destinationUser.username,
          amount: 100,
          newBalance: sourceUser.balance,
        },
      });
    } catch (error) {
      // Pastikan gambar sementara dihapus jika terjadi error
      if (temporaryImagePath && fs.existsSync(temporaryImagePath)) {
        fs.unlinkSync(temporaryImagePath);
      }
      console.error(error);
      next({ name: error.name || 'Gagal melakukan transaksi.', error });
    }
  }
}

module.exports = Controller;
