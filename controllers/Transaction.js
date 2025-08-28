const db = require('../models');
const fs = require('fs').promises;
const Transactions = db.Transactions;
const Users_Banks = db.Users_Banks;
const Merchants = db.Merchants;
const path = require('path');

class Controller {
  // Transaction
  static async transaction(req, res, next) {
    let t; // Variabel untuk menampung transaksi database
    let image1Path = null; // Variabel untuk path absolut gambar 1
    let image2Path = null; // Variabel untuk path absolut gambar 2

    try {
      // 1. Ambil data dari request body
      const {
        transaction_method,
        timestamp,
        merchant_id, // UUID merchant
        sn_edc,
        palm_id, // ID telapak tangan dari scanner
        amount,
        palmpay_image1, // Gambar dalam format Base64
        palmpay_image2, // Gambar dalam format Base64
      } = req.body;

      // 2. Validasi input awal
      if (!palm_id || !merchant_id || !amount || !transaction_method) {
        // Ganti 'name' dengan 'status' untuk error handling yang lebih baik
        throw { name: 'Data transaksi tidak lengkap.' };
      }

      // 3. Validasi Pengguna dan Merchant
      const userAccount = await Users_Banks.findOne({ where: { palm_id: palm_id } });
      if (!userAccount) {
        throw { name: 'Pengguna dengan Palm ID tersebut tidak terdaftar.' };
      }

      const merchant = await Merchants.findOne({ where: { merchant_id: merchant_id } });
      if (!merchant) {
        throw { name: 'Merchant tidak valid atau tidak ditemukan.' };
      }

      // 4. Pengecekan Saldo Pengguna
      if (userAccount.balance < amount) {
        throw { name: 'Saldo tidak mencukupi.' };
      }

      // 5. Proses dan Simpan Gambar (jika ada)
      let image1Url = null;
      let image2Url = null;
      if (palmpay_image1 || palmpay_image2) {
        const relativeUploadDir = 'images/transactionImages';
        const absoluteUploadDir = path.join(__dirname, '..', 'public', relativeUploadDir);
        await fs.mkdir(absoluteUploadDir, { recursive: true });

        if (palmpay_image1) {
          const base64Data = palmpay_image1.split(';base64,').pop();
          const imageName1 = `tx_${Date.now()}_1.jpeg`;
          image1Path = path.join(absoluteUploadDir, imageName1); // Simpan path absolut untuk cleanup
          await fs.writeFile(image1Path, base64Data, { encoding: 'base64' });
          image1Url = `${relativeUploadDir}/${imageName1}`; // Simpan path relatif untuk DB
        }
        if (palmpay_image2) {
          const base64Data = palmpay_image2.split(';base64,').pop();
          const imageName2 = `tx_${Date.now()}_2.jpeg`;
          image2Path = path.join(absoluteUploadDir, imageName2); // Simpan path absolut untuk cleanup
          await fs.writeFile(image2Path, base64Data, { encoding: 'base64' });
          image2Url = `${relativeUploadDir}/${imageName2}`; // Simpan path relatif untuk DB
        }
      }

      // 6. Jalankan Operasi Database secara Atomik
      t = await db.sequelize.transaction();
      try {
        // 6a. Kurangi saldo pengguna
        await userAccount.decrement('balance', { by: amount, transaction: t });

        // 6b. Logika penambahan saldo merchant dinonaktifkan
        // karena tidak ada kolom 'balance' di model Merchants Anda.
        /*
        await merchant.increment('balance', { by: amount, transaction: t });
        */

        // 6c. Buat catatan di tabel Transactions
        const newTransaction = await Transactions.create(
          {
            transaction_method,
            status: 'berhasil',
            timestamp: timestamp || new Date(),
            user_id: userAccount.user_id, // Ambil Primary Key dari user
            merchant_id: merchant.merchant_id, // Ambil Primary Key dari merchant
            sn_edc,
            amount,
            palm_id, // Simpan juga palm_id untuk kemudahan pencarian
            palmpay_image1: image1Url,
            palmpay_image2: image2Url,
          },
          { transaction: t }
        );

        // Jika semua berhasil, simpan perubahan secara permanen
        await t.commit();

        // 7. Kirim Respon Sukses
        const responsePayload = {
          statusCode: 201,
          message: 'Transaksi berhasil.',
          data: {
            transactionId: newTransaction.transaction_id,
            merchantName: merchant.merchant_name,
            amount: newTransaction.amount,
            transaction_method: newTransaction.transaction_method,
            remainingBalance: userAccount.balance - amount,
            timestamp: newTransaction.timestamp,
          },
        };

        res.status(201).json(responsePayload);
      } catch (dbError) {
        // Jika ada kegagalan di dalam blok transaksi, batalkan semua perubahan DB
        if (t) await t.rollback();
        throw dbError; // Lanjutkan error ke blok catch utama
      }
    } catch (error) {
      // 8. Blok Penanganan Error & Cleanup
      // Jika terjadi error di titik manapun, proses ini akan berjalan

      // Hapus file yang mungkin sudah terlanjur dibuat
      const filesToDelete = [image1Path, image2Path].filter(Boolean);
      if (filesToDelete.length > 0) {
        await Promise.all(
          filesToDelete.map((filePath) =>
            fs.unlink(filePath).catch((err) => console.error(`Gagal menghapus file: ${filePath}`, err))
          )
        );
      }

      // Teruskan error ke middleware error handler utama Anda
      next(error);
    }
  }
}

module.exports = Controller;
