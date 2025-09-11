const db = require('../models');
const { Transactions, Users_Banks, Merchants, Edc_Devices, Xendit_QR_Payments } = db;
const { receiptTemplate1 } = require('../helper/html/receiptTemplate');
const path = require('path');
const { default: axios } = require('axios');
const mqttHandler = require('../helper/mqttHandler');
const fs = require('fs').promises;
const puppeteer = require('puppeteer');
class Controller {
  // PALMPAY
  static async palmpay(req, res, next) {
    let t; // Variabel untuk menampung transaksi database

    try {
      // 1. Ambil data dari request body (tanpa gambar)
      const {
        transaction_method,
        timestamp,
        merchant_id, // UUID merchant
        sn_edc,
        palm_id, // ID telapak tangan dari scanner
        amount,
      } = req.body;

      // 2. Validasi input
      if (
        transaction_method !== 'PALMPAY' &&
        transaction_method !== 'CONTACTLESS' &&
        transaction_method !== 'XENDIT_QR_DYNAMIC'
      ) {
        throw { name: 'Tipe pembayaran tidak valid.' };
      }

      if (!palm_id || !merchant_id || !amount || !transaction_method) {
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

      // 5. Jalankan Operasi Database secara Atomik (dalam satu transaksi)
      t = await db.sequelize.transaction();
      try {
        // Kurangi saldo pengguna
        await userAccount.decrement('balance', { by: amount, transaction: t });

        // Buat record transaksi baru (tanpa kolom gambar)
        const newTransaction = await Transactions.create(
          {
            transaction_method,
            status: 'berhasil',
            timestamp: timestamp || new Date(),
            user_id: userAccount.user_id,
            merchant_id: merchant.merchant_id,
            sn_edc,
            amount,
            palm_id,
          },
          { transaction: t }
        );

        // Jika semua berhasil, simpan perubahan secara permanen
        await t.commit();

        // Siapkan respons untuk dikirim kembali
        const responsePayload = {
          statusCode: 201,
          message: 'Transaksi berhasil.',
          data: {
            transactionId: newTransaction.transaction_id,
            merchantName: merchant.merchant_name,
            amount: newTransaction.amount,
            remainingBalance: userAccount.balance, // Hitung sisa saldo terbaru
            transaction_method: newTransaction.transaction_method,
            timestamp: newTransaction.timestamp,
          },
        };

        res.status(201).json(responsePayload);
      } catch (dbError) {
        // Jika terjadi error saat operasi DB, batalkan semua perubahan
        if (t) await t.rollback();
        throw dbError; // Lemparkan error agar ditangkap oleh catch utama
      }
    } catch (error) {
      // Teruskan error ke middleware error handling
      next(error);
    }
  }

  // static async palmpay(req, res, next) {
  //   let t;
  //   let image1Path = null;
  //   let image2Path = null;

  //   try {
  //     const { transaction_method, timestamp, merchant_id, sn_edc, palm_id, amount, palmpay_image1, palmpay_image2 } =
  //       req.body;

  //     if (!palm_id || !merchant_id || !amount || !transaction_method) {
  //       throw { name: 'Data transaksi tidak lengkap.' };
  //     }

  //     const userAccount = await Users_Banks.findOne({ where: { palm_id: palm_id } });
  //     if (!userAccount) {
  //       throw { name: 'Pengguna dengan Palm ID tersebut tidak terdaftar.' };
  //     }

  //     const merchant = await Merchants.findOne({ where: { merchant_id: merchant_id } });
  //     if (!merchant) {
  //       throw { name: 'Merchant tidak valid atau tidak ditemukan.' };
  //     }

  //     if (userAccount.balance < amount) {
  //       throw { name: 'Saldo tidak mencukupi.' };
  //     }

  //     let image1Url = null;
  //     let image2Url = null;
  //     if (palmpay_image1 || palmpay_image2) {
  //       const relativeUploadDir = 'images/transactionImages';
  //       const absoluteUploadDir = path.join(__dirname, '..', 'public', relativeUploadDir);
  //       await fs.mkdir(absoluteUploadDir, { recursive: true });

  //       if (palmpay_image1) {
  //         const base64Data = palmpay_image1.split(';base64,').pop();
  //         const imageName1 = `tx_${Date.now()}_1.jpeg`;
  //         image1Path = path.join(absoluteUploadDir, imageName1); // Simpan path absolut untuk cleanup
  //         await fs.writeFile(image1Path, base64Data, { encoding: 'base64' });
  //         image1Url = `${relativeUploadDir}/${imageName1}`; // Simpan path relatif untuk DB
  //       }
  //       if (palmpay_image2) {
  //         const base64Data = palmpay_image2.split(';base64,').pop();
  //         const imageName2 = `tx_${Date.now()}_2.jpeg`;
  //         image2Path = path.join(absoluteUploadDir, imageName2); // Simpan path absolut untuk cleanup
  //         await fs.writeFile(image2Path, base64Data, { encoding: 'base64' });
  //         image2Url = `${relativeUploadDir}/${imageName2}`; // Simpan path relatif untuk DB
  //       }
  //     }

  //     t = await db.sequelize.transaction();
  //     try {
  //       await userAccount.decrement('balance', { by: amount, transaction: t });
  //       const newTransaction = await Transactions.create(
  //         {
  //           transaction_method,
  //           status: 'berhasil',
  //           timestamp: timestamp || new Date(),
  //           user_id: userAccount.user_id,
  //           merchant_id: merchant.merchant_id,
  //           sn_edc,
  //           amount,
  //           palm_id,
  //           palmpay_image1: image1Url,
  //           palmpay_image2: image2Url,
  //         },
  //         { transaction: t }
  //       );

  //       await t.commit();

  //       const responsePayload = {
  //         statusCode: 201,
  //         message: 'Transaksi berhasil.',
  //         data: {
  //           transactionId: newTransaction.transaction_id,
  //           merchantName: merchant.merchant_name,
  //           amount: newTransaction.amount,
  //           remainingBalance: userAccount.balance - amount,
  //           transaction_method: newTransaction.transaction_method,
  //           timestamp: newTransaction.timestamp,
  //         },
  //       };

  //       res.status(201).json(responsePayload);
  //     } catch (dbError) {
  //       if (t) await t.rollback();
  //       throw dbError;
  //     }
  //   } catch (error) {
  //     // Hapus file yang mungkin sudah terlanjur dibuat
  //     const filesToDelete = [image1Path, image2Path].filter(Boolean);
  //     if (filesToDelete.length > 0) {
  //       await Promise.all(
  //         filesToDelete.map((filePath) =>
  //           fs.unlink(filePath).catch((err) => console.error(`Gagal menghapus file: ${filePath}`, err))
  //         )
  //       );
  //     }

  //     next(error);
  //   }
  // }

  static async createQRCode(req, res, next) {
    const t = await db.sequelize.transaction();
    try {
      // 1. Ambil data yang dibutuhkan untuk QR DYNAMIC
      const { amount, merchant_id, sn_edc } = req.body;

      if (!merchant_id) {
        throw { name: 'Parameter `merchant_id` wajib diisi.' };
      }
      if (!sn_edc) {
        throw { name: 'Parameter `sn_edc` wajib diisi.' };
      }
      if (amount === undefined || amount === null) {
        throw { name: 'Parameter `amount` wajib diisi.' };
      }
      if (typeof amount !== 'number' || amount < 1000) {
        throw { name: 'Parameter `amount` harus berupa angka dan minimal 1000.' };
      }

      const merchant = await Merchants.findByPk(merchant_id);
      if (!merchant) {
        throw { name: 'Merchant tidak ditemukan.' };
      }

      const deviceEdc = await Edc_Devices.findOne({
        where: {
          sn_edc: sn_edc,
        },
      });

      if (!deviceEdc) {
        throw { name: 'SN EDC tidak terdaftar.' };
      }

      // Langkah 2: Jika SN EDC ditemukan, cek apakah merchant_id-nya cocok
      if (deviceEdc.merchant_id !== merchant_id) {
        throw { name: 'Device ini tidak terdaftar untuk merchant yang bersangkutan.' };
      }

      const device = await Edc_Devices.findOne({
        where: {
          sn_edc: sn_edc,
          merchant_id: merchant_id, // Memastikan device ini milik merchant yang benar
        },
      });

      if (!device) {
        throw { name: 'Device tidak valid atau tidak terdaftar untuk merchant ini.' };
      }

      // 3. Buat entri transaksi di database
      const newTransaction = await Transactions.create(
        {
          amount,
          merchant_id,
          sn_edc,
          status: 'pending',
          transaction_method: 'XENDIT_QR_DYNAMIC', // Jelas menandakan tipe
        },
        { transaction: t }
      );

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Kedaluwarsa 10 menit

      // 4. Siapkan body request untuk Xendit (selalu DYNAMIC)
      const bodyParams = {
        reference_id: newTransaction.transaction_id,
        type: 'DYNAMIC',
        currency: 'IDR',
        amount: amount,
        expires_at: expiresAt.toISOString(),
      };

      const url = `${process.env.XENDIT_BASE_URL}/qr_codes`;
      const { data: xenditResponse } = await axios.post(url, bodyParams, {
        auth: { username: process.env.XENDIT_PRIVATEKEY, password: '' },
        headers: { 'api-version': '2022-07-31' },
      });

      if (xenditResponse.error_code) {
        throw new Error(xenditResponse.message || 'Gagal membuat QR code di Xendit.');
      }

      // 5. Simpan detail QR ke database
      await Xendit_QR_Payments.create(
        {
          transaction_id: newTransaction.transaction_id,
          xendit_qr_id: xenditResponse.id,
          external_id: xenditResponse.reference_id,
          qr_string: xenditResponse.qr_string,
          status: xenditResponse.status,
          expires_at: new Date(xenditResponse.expires_at),
        },
        { transaction: t }
      );

      await t.commit();

      // 6. Kirim respons sukses
      res.status(201).json({
        statusCode: 201,
        message: 'QR Code berhasil dibuat.',
        data: {
          transaction_id: newTransaction.transaction_id,
          qr_string: xenditResponse.qr_string,
          expires_at: xenditResponse.expires_at,
        },
      });
    } catch (error) {
      await t.rollback();
      next(error);
    }
  }

  static async getQRCodeStatus(req, res, next) {
    try {
      const { transaction_id } = req.params; // Gunakan transaction_id

      // REFACTOR: Menggunakan findByPk dan 'include' untuk join tabel secara otomatis.
      const transaction = await Transactions.findByPk(transaction_id, {
        include: {
          model: Xendit_QR_Payments,
          attributes: ['status', 'expires_at', 'qr_string'], // Hanya ambil kolom yang relevan
        },
      });

      if (!transaction) {
        throw { name: 'Transaksi tidak ditemukan.' };
      }

      res.status(200).json({
        statusCode: 200,
        message: 'Status transaksi berhasil diambil.',
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async callbackQRTransaction(req, res, next) {
    // const fs = require('fs').promises;
    const t = await db.sequelize.transaction();
    let browser; // Deklarasikan browser di luar try-catch
    try {
      const callbackData = req.body;
      if (!callbackData.data || callbackData.event !== 'qr.payment') {
        return res.status(200).send('Event ignored');
      }

      const paymentData = callbackData.data;
      console.log('PAYMENT DATA', paymentData);

      // 1. CARI TRANSAKSI MENGGUNAKAN LOGIKA ANDA YANG SUDAH BENAR (DARI KODE 2)
      const qrPayment = await Xendit_QR_Payments.findOne({
        where: { external_id: paymentData.reference_id },
      });

      if (!qrPayment || qrPayment.status === 'completed') {
        return res.status(200).send('Transaction not found or already processed.');
      }

      const transaction = await Transactions.findByPk(qrPayment.transaction_id, {
        include: Merchants, // Sertakan data merchant untuk struk
      });
      if (!transaction) {
        return res.status(200).send('Parent transaction not found.');
      }

      if (transaction.amount != paymentData.amount) {
        await qrPayment.update({ status: 'FAILED_AMOUNT_MISMATCH' }, { transaction: t });
        await transaction.update({ status: 'FAILED' }, { transaction: t });
        await t.commit();

        return res.status(200).send('Amount mismatch.');
      }

      // 2. TAMBAHKAN LOGIKA PEMBUATAN PDF DARI KODE 1
      let receiptPath = null;
      try {
        // --- TAMBAHKAN LOG INI UNTUK DEBUGGING ---
        console.log('--- Memeriksa isi dari "fs" ---');
        console.log('Isi fs:', fs);
        console.log('---------------------------------');
        // ------------------------------------------

        const outputDir = path.join(__dirname, '../public/receipts');
        await fs.mkdir(outputDir, { recursive: true });

        const fileName = `receipt-${transaction.transaction_id}.pdf`;
        const outputPath = path.join(outputDir, fileName);

        browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
        const page = await browser.newPage();

        // Siapkan data untuk template struk
        const receiptData = {
          ...paymentData,
          merchant_name: transaction.Merchant.merchant_name, // Ambil nama merchant
        };

        await page.setContent(receiptTemplate1(receiptData), { waitUntil: 'domcontentloaded' });
        await page.pdf({ path: outputPath, format: 'A6', printBackground: true });

        receiptPath = `/receipts/${fileName}`; // Path yang bisa diakses publik
      } catch (pdfError) {
        console.error(`Gagal membuat PDF untuk transaksi ${transaction.transaction_id}:`, pdfError);
      }

      // 3. UPDATE DATABASE (LOGIKA ANDA DARI KODE 2 SUDAH BENAR)
      await qrPayment.update(
        {
          status: 'completed',
          xendit_payment_id: paymentData.id, // Simpan ID pembayaran
        },
        { transaction: t }
      );

      await transaction.update(
        {
          status: 'berhasil',
          timestamp: new Date(paymentData.created),
          receipt_path: receiptPath, // Simpan path PDF
        },
        { transaction: t }
      );

      await t.commit();

      // 4. TAMBAHKAN LOGIKA PENGIRIMAN MQTT DARI KODE 1
      console.log(`Transaksi ${transaction.transaction_id} berhasil dibayar. Mengirim notifikasi MQTT...`);
      const mqttClient = new mqttHandler();
      mqttClient.connect();

      const mqttPayload = {
        devices_sn: transaction.sn_edc,
        payment_detail: paymentData.payment_detail,
        reference_id: paymentData.reference_id,
        amount: paymentData.amount,
        status: 'SUCCESS', // Kirim status yang jelas
        receipt_path: receiptPath ? `${process.env.BASE_URL_BE}${receiptPath}` : null,
      };

      mqttClient.sendMessage(JSON.stringify(mqttPayload));

      // 5. KIRIM RESPONS KE XENDIT
      res.status(200).json({ message: 'Callback processed successfully.' });
    } catch (error) {
      if (t && !t.finished) {
        await t.rollback();
      }
      next(error);
    } finally {
      if (browser) {
        await browser.close(); // Pastikan browser selalu ditutup
      }
    }
  }

  static async inquiryQRTransactionBySN(req, res, next) {
    try {
      const { sn_edc } = req.params; // Asumsi SN ada di params

      // REFACTOR: Ganti raw query dengan findAll dan include
      const transactions = await Transactions.findAll({
        where: { sn_edc: sn_edc },
        include: { model: Xendit_QR_Payments },
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        statusCode: 200,
        message: 'Data transaksi berhasil diambil.',
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async qrRefundRequest(req, res, next) {
    try {
      const { qrId } = req.params; // Ini adalah xendit_qr_id
      const { amount, reason } = req.body;

      if (!amount || !reason) {
        throw { name: '`amount` dan `reason` dibutuhkan untuk refund.' };
      }

      // REFACTOR: Cari record pembayaran menggunakan ORM
      const qrPayment = await Xendit_QR_Payments.findOne({
        where: { xendit_qr_id: qrId },
      });

      if (!qrPayment) {
        throw { name: 'Transaksi pembayaran QR tidak ditemukan.' };
      }

      // CATATAN PENTING:
      // Xendit memerlukan PAYMENT ID untuk refund, bukan QR ID.
      // ID ini didapat dari callback saat pembayaran sukses.
      // Pastikan Anda telah menambahkan kolom `xendit_payment_id` di model `Xendit_QR_Payments`
      // dan menyimpannya saat callback diterima.
      if (!qrPayment.xendit_payment_id) {
        throw { name: 'Payment ID tidak ditemukan, refund tidak bisa diproses.' };
      }

      // Panggil API Xendit untuk refund
      const refundResponse = await xenditClient.qr.refund({
        paymentId: qrPayment.xendit_payment_id,
        amount: amount,
        reason: reason, // e.g., 'REQUESTED_BY_CUSTOMER'
      });

      // Update status di database kita
      await qrPayment.update({ status: 'REFUNDED' });

      res.status(200).json({
        statusCode: 200,
        message: 'Permintaan refund berhasil diproses.',
        data: refundResponse,
      });
    } catch (error) {
      next(error);
    }
  }

  static async streamPDFInvoice(req, res, next) {
    try {
      // Asumsi `transactionId` adalah UUID dari tabel Transactions kita
      const { transactionId } = req.params;

      // REFACTOR: Cari transaksi di DB untuk mendapatkan path PDF yang valid
      const transaction = await Transactions.findByPk(transactionId);

      if (!transaction || !transaction.receipt_path) {
        throw { name: 'File struk tidak ditemukan.' };
      }

      // Path receipt_path harus merupakan path absolut ke file
      // Misal: /app/public/invoices/invoice-uuid.pdf
      const absolutePath = transaction.receipt_path;

      // Cek jika file benar-benar ada sebelum mengirim
      try {
        await fs.access(absolutePath); // fs.promises.access
      } catch (fileError) {
        throw { name: 'File struk tidak ditemukan di server.' };
      }

      res.sendFile(absolutePath);
    } catch (error) {
      next(error);
    }
  }

  static async getQRCodeByID(req, res, next) {
    try {
      const { qrId } = req.params; // xendit_qr_id

      const qrPayment = await Xendit_QR_Payments.findOne({
        where: { xendit_qr_id: qrId },
        include: [
          {
            model: Transactions,
            include: [Merchants], // Sertakan juga data merchant
          },
        ],
      });

      if (!qrPayment) {
        throw { name: 'Data QR Code tidak ditemukan.' };
      }

      res.status(200).json({
        statusCode: 200,
        message: 'Data QR Code berhasil diambil.',
        data: qrPayment,
      });
    } catch (error) {
      next(error);
    }
  }

  static async inquiryQRTransactionBySN(req, res, next) {
    try {
      const { sn_edc } = req.params;

      const transactions = await Transactions.findAll({
        where: { sn_edc: sn_edc },
        include: { model: Xendit_QR_Payments },
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        statusCode: 200,
        message: 'Data transaksi berhasil diambil.',
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }

  static async inquiryLastQRTransactionDevice(req, res, next) {
    try {
      // Asumsi sn_edc didapat dari request (misal: dari middleware otentikasi device)
      const sn_edc = req.devices.sn_edc;

      const lastTransaction = await Transactions.findOne({
        where: { sn_edc: sn_edc },
        order: [['createdAt', 'DESC']], // Urutkan berdasarkan waktu pembuatan terbaru
        include: { model: Xendit_QR_Payments },
      });

      res.status(200).json({
        statusCode: 200,
        message: 'Data transaksi terakhir berhasil diambil.',
        data: lastTransaction || null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async inquiryAllTransaction(req, res, next) {
    try {
      const transactions = await Transactions.findAll({
        include: [
          { model: Xendit_QR_Payments, attributes: ['status'] },
          { model: Merchants, attributes: ['merchant_name'] },
          // Jika ingin join ke Edc_Devices, pastikan asosiasinya sudah dibuat
          // { model: Edc_Devices, attributes: ['device_id'] }
        ],
        order: [['createdAt', 'DESC']],
      });

      res.status(200).json({
        statusCode: 200,
        message: 'Semua data transaksi berhasil diambil.',
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
