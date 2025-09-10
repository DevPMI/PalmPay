// const { success, errors, tostringConvert } = require('../../helper/response');
const { generateReferenceID, unixTimestamp, headersToms } = require('../../helper/common');
const { receiptTemplate1 } = require('../../helper/html/receiptTemplate');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

const Joi = require('joi');
const db = require('../../models');
const { sequelize } = db;
const { default: axios } = require('axios');
var mqttHandler = require('../../helper/mqttHandler');
const { default: puppeteer } = require('puppeteer');

exports.createQRCode = async (req, res) => {
  // 1. Mulai transaksi database untuk memastikan semua operasi berhasil atau gagal bersamaan.
  const t = await sequelize.transaction();
  try {
    // 2. Validasi input menggunakan Joi (bagian ini sudah bagus)
    const createSchema = Joi.object({
      amount: Joi.number().min(1).max(10000000).required(),
      // expires_at dan type tidak lagi dibutuhkan dari client, kita tentukan di server
      // Tambahkan merchant_id dan sn_edc yang dibutuhkan
      merchant_id: Joi.string().uuid().required(),
      sn_edc: Joi.string().optional(),
    });

    const { error } = createSchema.validate(req.body);
    if (error) {
      console.error(error.details[0].message);
      return res.status(400).json({ status: false, statusCode: 400, error: error.details[0].message });
    }

    // 3. Buat entri "niat membayar" di tabel Transactions terlebih dahulu
    const newTransaction = await Transactions.create(
      {
        amount: req.body.amount,
        merchant_id: req.body.merchant_id, // Asumsi merchant_id dikirim dari client
        sn_edc: req.body.sn_edc, // Asumsi sn_edc dikirim dari client
        status: 'PENDING',
        transaction_method: 'XENDIT_QR',
      },
      { transaction: t }
    );

    // 4. Gunakan `transaction_id` yang baru dibuat sebagai `reference_id` untuk Xendit
    const referenceId = newTransaction.transaction_id;
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Set kedaluwarsa 10 menit dari sekarang

    let bodyParams = {
      reference_id: referenceId,
      type: 'DYNAMIC', // DYNAMIC lebih umum untuk per transaksi
      currency: 'IDR',
      amount: req.body.amount,
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

    // 5. Simpan detail response dari Xendit ke tabel Xendit_QR_Payments
    await Xendit_QR_Payments.create(
      {
        transaction_id: newTransaction.transaction_id,
        xendit_qr_id: xenditResponse.id,
        external_id: xenditResponse.reference_id, // Ini adalah transaction_id kita
        qr_string: xenditResponse.qr_string,
        status: xenditResponse.status, // Seharusnya 'ACTIVE'
        expires_at: new Date(xenditResponse.expires_at),
      },
      { transaction: t }
    );

    // 6. Jika semua langkah di atas berhasil, simpan permanen perubahan di database
    await t.commit();

    // 7. Kirim response sukses ke client
    return res.status(201).json({
      status: true,
      statusCode: 201,
      messages: 'QR Code berhasil dibuat.',
      data: {
        transaction_id: newTransaction.transaction_id,
        qr_string: xenditResponse.qr_string,
        reference_id: xenditResponse.reference_id,
        expires_at: xenditResponse.expires_at,
      },
    });
  } catch (error) {
    // 8. Jika ada satu saja langkah yang gagal, batalkan semua perubahan di database
    await t.rollback();

    console.log('Error Create QR => ', error);
    const errorMessage = error.response?.data?.message || error.message;
    return res.status(500).json({ status: false, statusCode: 500, error: errorMessage });
  }
};

exports.getQRCodeByID = async (req, res) => {
  try {
    const qr_id = req.params.qrId;
    if (!qr_id || qr_id == '') {
      console.error('QR ID NUll');
      const errorMessage = 'QR ID Cant Be Null !';
      return res.status(400).json({ status: false, statusCode: 400, error: errorMessage });
    }
    return res.status(200).json({ status: true, statusCode: 200, messages: 'Success !', data: [] });
  } catch (error) {
    return res.status(400).json({ status: false, statusCode: 400, error: error.message });
  }
};

exports.getQRCodeStatus = async (req, res) => {
  try {
    // Ganti parameter dari query ke params URL agar lebih standar (contoh: /status/:transactionId)
    const { transactionId } = req.params;

    if (!transactionId) {
      const errorMessage = 'Transaction ID tidak boleh kosong!';
      return res.status(400).json({ status: false, statusCode: 400, error: errorMessage });
    }

    // Gunakan findByPk untuk mencari berdasarkan Primary Key dan 'include' untuk join
    const transaction = await db.Transactions.findByPk(transactionId, {
      include: {
        model: db.Xendit_QR_Payments,
        attributes: ['status', 'expires_at'], // Ambil hanya kolom yang perlu ditampilkan
      },
    });

    if (!transaction) {
      const errorMessage = 'Transaksi tidak ditemukan.';
      return res.status(404).json({ status: false, statusCode: 404, error: errorMessage });
    }

    return res.status(200).json({ status: true, statusCode: 200, messages: 'Success !', data: transaction });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ status: false, statusCode: 500, error: error.message });
  }
};

exports.inquiryQRTransactionByID = async (req, res) => {
  try {
    return success(res, [], 200);
  } catch (error) {
    return errors(res, error.message, 400);
  }
};

exports.inquiryQRTransactionBySN = async (req, res) => {
  try {
    const { sn_edc } = req.params; // Ambil sn_edc dari parameter URL

    const transactions = await db.Transactions.findAll({
      where: { sn_edc: sn_edc },
      include: { model: db.Xendit_QR_Payments },
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ status: true, statusCode: 200, messages: 'Success!', data: transactions });
  } catch (error) {
    return res.status(500).json({ status: false, statusCode: 500, error: error.message });
  }
};

exports.inquiryLastQRTransactionDevice = async (req, res) => {
  try {
    // Asumsi sn_edc didapat dari middleware atau body
    const { sn_edc } = req.body;

    const lastTransaction = await db.Transactions.findOne({
      where: { sn_edc: sn_edc },
      order: [['createdAt', 'DESC']], // findOne dengan order akan otomatis LIMIT 1
      include: { model: db.Xendit_QR_Payments },
    });

    return res.status(200).json({ status: true, statusCode: 200, messages: 'Success!', data: lastTransaction || null });
  } catch (error) {
    return res.status(500).json({ status: false, statusCode: 500, error: error.message });
  }
};

exports.inquiryAllTransaction = async (req, res) => {
  try {
    const transactions = await db.Transactions.findAll({
      include: [
        { model: db.Xendit_QR_Payments, attributes: ['status'] },
        { model: db.Merchants, attributes: ['merchant_name'] },
        // Anda bisa menambahkan 'include' untuk model lain jika asosiasi sudah dibuat
      ],
      order: [['createdAt', 'DESC']],
    });

    return res.status(200).json({ status: true, statusCode: 200, messages: 'Success!', data: transactions });
  } catch (error) {
    return res.status(500).json({ status: false, statusCode: 500, error: error.message });
  }
};

exports.callbackQRTransaction = async (req, res) => {
  console.log('Incoming Callback => ', req.body);

  let browser;
  const t = await sequelize.transaction();

  try {
    const callbackData = req.body.data;
    const eventType = req.body.event;

    if (eventType !== 'qr.payment') {
      return res.status(200).send('Event ignored.');
    }

    const transaction = await db.Transactions.findByPk(callbackData.reference_id, {
      include: db.Xendit_QR_Payments,
      transaction: t,
    });

    // ... (semua blok validasi seperti 'transaction not found', 'already processed', 'amount mismatch') ...
    // ... Anggap semua validasi sudah ada di sini ...

    // Update status di tabel Transactions
    await transaction.update(
      {
        status: 'berhasil',
        paid_at: new Date(callbackData.created),
        // ... kolom lain yang perlu diupdate
      },
      { transaction: t }
    );

    // Update status di tabel Xendit_QR_Payments
    await transaction.Xendit_QR_Payment.update(
      {
        status: 'COMPLETED',
        xendit_payment_id: callbackData.id,
      },
      { transaction: t }
    );

    // Simpan semua perubahan ke database
    await t.commit(); // <<< PROSES UTAMA SELESAI DI SINI

    // =================================================================
    // <<< BLOK KODE ANDA DITEMPATKAN DI SINI >>>
    //
    // SETELAH COMMIT BERHASIL, JALANKAN PROSES SEKUNDER
    // Cek apakah transaksi ini memerlukan notifikasi khusus ke API Newland
    // Anda perlu menyesuaikan kondisi `if` ini dengan logika bisnis Anda.
    // Contoh: Cek berdasarkan tipe device dari tabel lain atau properti di transaksi.
    if (transaction.sn_edc && transaction.sn_edc.startsWith('STATIC_NL')) {
      // Ganti dengan kondisi Anda yang sebenarnya
      try {
        console.log('Menjalankan proses sekunder untuk notifikasi Newland...');
        const messId = `${transaction.sn_edc}${unixTimestamp()}`;
        const url = `/online/iot/openapi/v2/iot/voice/product/xxxxxxxx/push`; // URL API Newland yang benar
        const bodyParams = {
          messageId: messId,
          amount: `${callbackData.amount}00`, // Sesuaikan format amount
          volume: 2,
          devSnList: [transaction.sn_edc],
        };
        const headers = headersToms(url, 'POST', bodyParams);

        // Panggil API Newland menggunakan axios
        await axios.post(`${process.env.URL_NEWLAND_PUSH_VOICE}${url}`, bodyParams, { headers });
        console.log('Notifikasi ke Newland berhasil dikirim.');
      } catch (apiError) {
        // Jika API Newland gagal, cukup catat errornya. Jangan sampai membuat callback gagal.
        console.error('Gagal mengirim notifikasi ke Newland:', apiError.message);
      }
    }
    // =================================================================

    return res.status(200).json({ message: 'Callback processed successfully.' });
  } catch (error) {
    await t.rollback();
    console.log('Error Callback =>', error);
    return res.status(500).json({ error: 'Internal server error processing callback.' });
  } finally {
    if (browser) {
      await browser.close();
    }
  }
};

exports.qrRefundRequest = async (req, res) => {
  try {
    const { transactionId } = req.params; // Gunakan ID transaksi internal kita
    const { amount, reason } = req.body;

    // Validasi
    const { error } = Joi.object({
      amount: Joi.number().min(1000).required(),
      reason: Joi.string().required(),
    }).validate(req.body);

    if (error) {
      return res.status(400).json({ status: false, error: error.details[0].message });
    }

    // 1. Cari transaksi dan data pembayarannya
    const transaction = await db.Transactions.findByPk(transactionId, {
      include: db.Xendit_QR_Payments,
    });

    if (!transaction || !transaction.Xendit_QR_Payment) {
      return res.status(404).json({ status: false, error: 'Transaksi tidak ditemukan.' });
    }

    // 2. Cek apakah ada payment_id untuk direfund
    const paymentId = transaction.Xendit_QR_Payment.xendit_payment_id;
    if (!paymentId) {
      return res.status(400).json({ status: false, error: 'Payment ID untuk refund tidak ditemukan.' });
    }

    // 3. Panggil API Refund Xendit
    const url = `${process.env.XENDIT_BASE_URL}/qr_codes/payments/${paymentId}/refunds`;
    const bodyParams = { amount, reason };
    const { data: xenditResponse } = await axios.post(url, bodyParams, {
      auth: { username: process.env.XENDIT_PRIVATEKEY, password: '' },
      headers: { 'api-version': '2022-07-31' },
    });

    if (xenditResponse.error_code) {
      throw new Error(xenditResponse.message);
    }

    // 4. Update status pembayaran menjadi REFUNDED
    await transaction.Xendit_QR_Payment.update({ status: 'REFUNDED' });

    return res.status(200).json({ status: true, messages: 'Refund berhasil diproses.', data: xenditResponse });
  } catch (error) {
    const errorMessage = error.response?.data?.message || error.message;
    console.error('Error Refund QR => ', errorMessage);
    return res.status(500).json({ status: false, error: errorMessage });
  }
};

exports.streamPDFInvoice = async (req, res) => {
  try {
    const { transactionId } = req.params;

    const transaction = await db.Transactions.findByPk(transactionId);

    if (!transaction || !transaction.receipt_path) {
      return res.status(404).json({ status: false, error: 'File struk tidak ditemukan.' });
    }

    // Gabungkan dengan path direktori public Anda
    const absolutePath = path.join(__dirname, '../../public', transaction.receipt_path);

    // Cek apakah file benar-benar ada
    if (!fs.existsSync(absolutePath)) {
      return res.status(404).json({ status: false, error: 'File struk tidak ditemukan di server.' });
    }

    res.sendFile(absolutePath);
  } catch (error) {
    console.log('Stream File Error =>', error);
    return res.status(500).json({ status: false, error: 'Gagal mengirim file struk.' });
  }
};
