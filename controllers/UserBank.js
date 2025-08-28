const db = require('../models');
const Users_Banks = db.Users_Banks;
// const Users = db.Users;
const path = require('path');
const fs = require('fs').promises;

class Controller {
  static async register(req, res, next) {
    let image1Path = null;
    let image2Path = null;
    let t;

    try {
      const { username, palm_id, email, phone_number, nik, balance, palmpay_image_1, palmpay_image_2 } = req.body;

      if (!username || !email || !nik || !palm_id) {
        throw { name: 'Data tidak lengkap.' };
      }

      // Tambahkan di awal fungsi try
      const MAX_SIZE_IN_BYTES = 5 * 1024 * 1024; // Contoh: 5 MB
      if (palmpay_image_1?.length > MAX_SIZE_IN_BYTES * 1.37 || palmpay_image_2?.length > MAX_SIZE_IN_BYTES * 1.37) {
        // Base64 string is approx. 37% larger than the binary file
        throw { name: 'Ukuran file gambar terlalu besar. Maksimal 5 MB.' };
      }

      // Definisikan path untuk folder di dalam public
      const relativeUploadDir = 'images/palmpayImages';
      const absoluteUploadDir = path.join(__dirname, '..', 'public', relativeUploadDir);
      await fs.mkdir(absoluteUploadDir, { recursive: true });

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
        await fs.writeFile(image1Path, base64Data, { encoding: 'base64' });
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
        await fs.writeFile(image2Path, base64Data, { encoding: 'base64' });
        // Simpan path relatif ke database
        image2Url = `${relativeUploadDir}/${imageName2}`;
      }

      const newUserBank = await Users_Banks.create({
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
        data: newUserBank,
      });
    } catch (error) {
      // Hapus file secara paralel dan aman
      const filesToDelete = [image1Path, image2Path].filter(Boolean); // Filter null/undefined
      await Promise.all(
        filesToDelete.map((filePath) =>
          fs.unlink(filePath).catch((err) => console.error(`Gagal hapus file: ${filePath}`, err))
        )
      );

      next(error);
    }
  }
}

module.exports = Controller;
