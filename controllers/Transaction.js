const db = require("../models");
const {
  Transactions,
  Users_Banks,
  Merchants,
  Edc_Devices,
  Xendit_QR_Payments,
} = db;
const HistoryController = require("./HistoryController"); // Import HistoryController
const { receiptTemplate1 } = require("../helper/html/receiptTemplate");
const path = require("path");
const { default: axios } = require("axios");
const mqttClient = require("../helper/mqttHandler");
const fs = require("fs").promises;
const puppeteer = require("puppeteer");
class Controller {
  // PALMPAY
  static async palmpay(req, res, next) {
    let t; // Variabel untuk menampung transaksi database

    try {
      // 1. Ambil data dari request body
      const {
        transaction_method,
        timestamp,
        merchant_id, // UUID merchant
        sn_edc,
        palm_id, // ID telapak tangan (opsional tergantung metode)
        amount,
      } = req.body;

      // 2. Validasi umum
      if (!merchant_id || !amount || !transaction_method) {
        throw { name: "Data transaksi tidak lengkap." };
      }

      const merchant = await Merchants.findOne({
        where: { merchant_id: merchant_id },
      });
      if (!merchant) {
        throw { name: "Merchant tidak valid atau tidak ditemukan." };
      }

      t = await db.sequelize.transaction();
      try {
        let newTransaction;
        let responsePayload;

        // --- LOGIKA DIPISAH BERDASARKAN METODE PEMBAYARAN ---

        // ALUR KHUSUS UNTUK PALMPAY
        if (transaction_method === "PALMPAY") {
          // Validasi khusus Palmpay
          if (!palm_id) {
            throw { name: "Palm ID wajib diisi untuk transaksi PALMPAY." };
          }

          const userAccount = await Users_Banks.findOne({
            where: { palm_id: palm_id },
          });
          if (!userAccount) {
            throw { name: "Pengguna dengan Palm ID tersebut tidak terdaftar." };
          }
          if (userAccount.balance < amount) {
            throw { name: "Saldo tidak mencukupi." };
          }

          const originalBalance = userAccount.balance;
          await userAccount.decrement("balance", {
            by: amount,
            transaction: t,
          });

          newTransaction = await Transactions.create(
            {
              transaction_method,
              status: "berhasil",
              timestamp: timestamp || new Date(),
              user_id: userAccount.user_id, // user_id diisi
              merchant_id: merchant.merchant_id,
              sn_edc,
              amount,
            },
            { transaction: t }
          );

          // Perbarui saldo merchant
          await merchant.increment("balance", { by: amount, transaction: t });

          // Tambahkan entri ke fake history
          HistoryController.addFakeHistoryEntry({
            amount: newTransaction.amount,
          });

          responsePayload = {
            transactionId: newTransaction.transaction_id,
            receiptId: newTransaction.receipt_id,
            merchantName: merchant.merchant_name,
            amount: newTransaction.amount,
            remainingBalance: originalBalance - amount,
            transaction_method: newTransaction.transaction_method,
            timestamp: newTransaction.timestamp,
          };

          // ALUR KHUSUS UNTUK CONTACTLESS
        } else if (transaction_method === "CONTACTLESS") {
          newTransaction = await Transactions.create(
            {
              transaction_method,
              status: "berhasil",
              timestamp: timestamp || new Date(),
              user_id: null, // user_id dikosongkan
              merchant_id: merchant.merchant_id,
              sn_edc,
              amount,
              palm_id: null, // palm_id dikosongkan
            },
            { transaction: t }
          );

          responsePayload = {
            transactionId: newTransaction.transaction_id,
            receiptId: newTransaction.receipt_id,
            merchantName: merchant.merchant_name,
            amount: newTransaction.amount,
            transaction_method: newTransaction.transaction_method,
            timestamp: newTransaction.timestamp,
          };
        } else {
          throw {
            name: "Metode pembayaran ini tidak didukung oleh endpoint ini.",
          };
        }

        await t.commit();

        res.status(201).json({
          statusCode: 201,
          message: "Transaksi berhasil.",
          data: responsePayload,
        });
      } catch (dbError) {
        if (t) await t.rollback();
        throw dbError;
      }
    } catch (error) {
      next(error);
    }
  }

  static async createQRCode(req, res, next) {
    const t = await db.sequelize.transaction();
    try {
      // 1. Ambil data yang dibutuhkan untuk QR DYNAMIC
      const { amount, merchant_id, sn_edc } = req.body;

      if (!merchant_id) {
        throw { name: "Parameter `merchant_id` wajib diisi." };
      }
      if (!sn_edc) {
        throw { name: "Parameter `sn_edc` wajib diisi." };
      }
      if (amount === undefined || amount === null) {
        throw { name: "Parameter `amount` wajib diisi." };
      }
      if (typeof amount !== "number" || amount < 1000) {
        throw {
          name: "Parameter `amount` harus berupa angka dan minimal 1000.",
        };
      }

      const merchant = await Merchants.findByPk(merchant_id);
      if (!merchant) {
        throw { name: "Merchant tidak ditemukan." };
      }

      const deviceEdc = await Edc_Devices.findOne({
        where: {
          sn_edc: sn_edc,
        },
      });

      if (!deviceEdc) {
        throw { name: "SN EDC tidak terdaftar." };
      }

      // Langkah 2: Jika SN EDC ditemukan, cek apakah merchant_id-nya cocok
      if (deviceEdc.merchant_id !== merchant_id) {
        throw {
          name: "Device ini tidak terdaftar untuk merchant yang bersangkutan.",
        };
      }

      const device = await Edc_Devices.findOne({
        where: {
          sn_edc: sn_edc,
          merchant_id: merchant_id, // Memastikan device ini milik merchant yang benar
        },
      });

      if (!device) {
        throw {
          name: "Device tidak valid atau tidak terdaftar untuk merchant ini.",
        };
      }

      const newTransaction = await Transactions.create(
        {
          amount,
          merchant_id,
          sn_edc,
          status: "pending",
          transaction_method: "XENDIT_QR_DYNAMIC",
        },
        { transaction: t }
      );

      const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // Kedaluwarsa 10 menit

      // 4. Siapkan body request untuk Xendit (selalu DYNAMIC)
      const bodyParams = {
        reference_id: newTransaction.transaction_id,
        type: "DYNAMIC",
        currency: "IDR",
        amount: amount,
        expires_at: expiresAt.toISOString(),
      };

      const url = `${process.env.XENDIT_BASE_URL}/qr_codes`;
      const { data: xenditResponse } = await axios.post(url, bodyParams, {
        auth: { username: process.env.XENDIT_PRIVATEKEY, password: "" },
        headers: { "api-version": "2022-07-31" },
      });

      if (xenditResponse.error_code) {
        throw new Error(
          xenditResponse.message || "Gagal membuat QR code di Xendit."
        );
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
        message: "QR Code berhasil dibuat.",
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

  static async getStaticQRCode(req, res, next) {
    try {
      const { merchantId } = req.params;

      // Cari merchant dan QR statisnya di database
      const merchant = await Merchants.findByPk(merchantId);

      console.log("MERCHANT --- ID", merchantId);
      console.log("MERCHANT", merchant);
      if (!merchant || !merchant.static_qr_string) {
        throw { name: "QR Code statis tidak ditemukan untuk merchant ini." };
      }

      res.status(200).json({
        statusCode: 200,
        message: "QR Code statis berhasil diambil.",
        data: {
          qr_string: merchant.static_qr_string,
        },
      });
    } catch (error) {
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
          attributes: ["status", "expires_at", "qr_string"], // Hanya ambil kolom yang relevan
        },
      });

      if (!transaction) {
        throw { name: "Transaksi tidak ditemukan." };
      }

      res.status(200).json({
        statusCode: 200,
        message: "Status transaksi berhasil diambil.",
        data: transaction,
      });
    } catch (error) {
      next(error);
    }
  }

  static async callbackQRTransaction(req, res, next) {
    let t = null;

    try {
      const callbackData = req.body;
      console.log("callbackData RAW", callbackData);
      const paymentData = callbackData.data;
      console.log("callbackData.data", paymentData);

      // Validasi awal
      if (!paymentData || callbackData.event !== "qr.payment") {
        return res.status(200).send("Event ignored");
      }

      const transactionType = paymentData.type; //STATIC
      console.log("PAYMENT DATA", paymentData);

      let transaction;
      let transactionId;

      // Mulai Transaksi Database
      t = await db.sequelize.transaction();

      // ----------------------------------------------------------------
      // 1. LOGIKA CARI / BUAT TRANSAKSI (DYNAMIC vs STATIC)
      // ----------------------------------------------------------------
      if (transactionType === "DYNAMIC") {
        transaction = await Transactions.findByPk(paymentData.reference_id, {
          include: Merchants,
          transaction: t,
        });

        if (!transaction) {
          await t.commit();
          return res.status(200).send("Dynamic transaction not found.");
        }

        transactionId = transaction.transaction_id;
      } else if (transactionType === "STATIC") {
        const merchantCode = paymentData.reference_id;
        console.log("merchantCode", merchantCode);
        const merchant = await Merchants.findOne({
          where: { merchant_code: merchantCode },
          transaction: t,
        });

        console.log("merchant", merchant);

        if (!merchant) {
          await t.commit();
          return res.status(200).send("Merchant for static QR not found.");
        }

        console.log("merchant", merchant);

        // Create transaksi baru untuk Static
        transaction = await Transactions.create(
          {
            transaction_method: "XENDIT_QR_STATIC",
            status: "pending",
            amount: paymentData.amount,
            merchant_id: merchant.merchant_id,
            sn_edc: null, // Static tidak punya SN EDC
            timestamp: new Date(paymentData.created),
            xendit_payment_id: paymentData.id,
          },
          { transaction: t }
        );

        console.log("transaction", transaction);

        // Manual inject Merchant data agar bisa dipakai di bawah
        transaction.Merchant = merchant;
        transactionId = transaction.transaction_id;
      } else {
        await t.commit();
        return res.status(200).send("Unsupported QR type.");
      }

      // ----------------------------------------------------------------
      // 2. UPDATE STATUS DATABASE & SALDO
      // ----------------------------------------------------------------
      if (paymentData.status === "SUCCEEDED") {
        // Update status jadi berhasil
        await Transactions.update(
          {
            status: "berhasil",
            timestamp: new Date(paymentData.created),
          },
          {
            where: { transaction_id: transactionId },
            transaction: t,
          }
        );

        // Tambah saldo Merchant
        if (transaction && transaction.Merchant) {
          await Merchants.increment("balance", {
            by: paymentData.amount,
            where: { merchant_id: transaction.Merchant.merchant_id },
            transaction: t,
          });

          // Fake history (opsional)
          HistoryController.addFakeHistoryEntry({ amount: paymentData.amount });
        }
      } else if (paymentData.status === "FAILED") {
        // Update status jadi gagal
        await Transactions.update(
          {
            status: "gagal",
            timestamp: new Date(paymentData.created),
          },
          {
            where: { transaction_id: transactionId },
            transaction: t,
          }
        );
      }

      // COMMIT Database (Simpan permanen)
      await t.commit();

      // ----------------------------------------------------------------
      // 3. MQTT NOTIFICATION (Dijalankan SETELAH Commit)
      // ----------------------------------------------------------------
      try {
        if (paymentData.status === "SUCCEEDED") {
          // CHECKPOINT 1: Debugging start
          console.log(
            `[DEBUG] Transaction DB Committed. ID: ${transactionId}. Starting MQTT...`
          );

          const mqttPayload = {
            devices_sn: transaction.sn_edc || "NO_SN", // Pastikan handle null
            payment_detail: paymentData.payment_detail || {},
            reference_id: transactionId,
            amount: paymentData.amount,
            status: "SUCCESS",
            receipt_path: null,
          };

          // CHECKPOINT 2: Cek isi payload
          console.log("[DEBUG] MQTT Payload:", JSON.stringify(mqttPayload));

          // AWAIT PENGIRIMAN (Menggunakan fungsi sendMessage yang sudah diperbaiki jadi Promise)
          await mqttClient.sendMessage(JSON.stringify(mqttPayload));

          console.log("[DEBUG] MQTT process finished successfully.");
        }
      } catch (mqttError) {
        // Jika MQTT gagal, database TETAP AMAN (karena sudah di-commit di atas)
        // Kita hanya perlu log errornya agar tahu.
        console.error(
          `[MQTT ERROR] Notification failed but TRX saved. Reason: ${mqttError.message}`
        );
      }

      // ----------------------------------------------------------------
      // 4. RESPONSE SELESAI
      // ----------------------------------------------------------------
      res.status(200).json({ message: "Callback processed successfully." });
    } catch (error) {
      // Rollback database jika ada error SEBELUM commit
      if (t && !t.finished) {
        await t.rollback();
      }
      console.error("Error in callbackQRTransaction:", error);
      next(error);
    }
  }

  static async callbackQRTransactionRaw(req, res, next) {
    let t = null;

    try {
      const callbackData = req.body;
      const paymentData = callbackData.data;

      if (!paymentData || callbackData.event !== "qr.payment") {
        return res.status(200).json(req.body);
      }

      const transactionType = paymentData.type;
      console.log("RAW JSON PAYMENT DATA", paymentData);

      let transactionId;

      t = await db.sequelize.transaction();

      if (transactionType === "DYNAMIC") {
        const transaction = await Transactions.findByPk(
          paymentData.reference_id,
          { transaction: t }
        );
        if (!transaction) {
          await t.commit();
          return res.status(200).json(req.body);
        }
        transactionId = transaction.transaction_id;
      } else if (transactionType === "STATIC") {
        const merchant = await Merchants.findOne({
          where: { merchant_code: paymentData.reference_id },
          transaction: t,
        });
        if (!merchant) {
          await t.commit();
          return res.status(200).json(req.body);
        }
        const newTransaction = await Transactions.create(
          {
            transaction_method: "XENDIT_QR_STATIC",
            status: "pending",
            amount: paymentData.amount,
            merchant_id: merchant.merchant_id,
            sn_edc: null,
            timestamp: new Date(paymentData.created),
            xendit_payment_id: paymentData.id,
          },
          { transaction: t }
        );
        transactionId = newTransaction.transaction_id;
      } else {
        await t.commit();
        return res.status(200).json(req.body);
      }

      if (paymentData.status === "SUCCEEDED") {
        await Transactions.update(
          { status: "berhasil", timestamp: new Date(paymentData.created) },
          { where: { transaction_id: transactionId }, transaction: t }
        );
      } else if (paymentData.status === "FAILED") {
        await Transactions.update(
          { status: "gagal", timestamp: new Date(paymentData.created) },
          { where: { transaction_id: transactionId }, transaction: t }
        );
      } else {
        await t.commit();
        return res.status(200).json(req.body);
      }

      await t.commit();

      res.status(200).json(req.body);
    } catch (error) {
      if (t && !t.finished) {
        await t.rollback();
      }
      console.error("Error in callbackQRTransactionRaw:", error);
      next(error);
    }
  }

  static async inquiryQRTransactionBySN(req, res, next) {
    try {
      const { sn_edc } = req.params; // Asumsi SN ada di params

      // REFACTOR: Ganti raw query dengan findAll dan include
      const transactions = await Transactions.findAll({
        where: { sn_edc: sn_edc },
        include: { model: Xendit_QR_Payments },
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({
        statusCode: 200,
        message: "Data transaksi berhasil diambil.",
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
        throw { name: "`amount` dan `reason` dibutuhkan untuk refund." };
      }

      // REFACTOR: Cari record pembayaran menggunakan ORM
      const qrPayment = await Xendit_QR_Payments.findOne({
        where: { xendit_qr_id: qrId },
      });

      if (!qrPayment) {
        throw { name: "Transaksi pembayaran QR tidak ditemukan." };
      }

      // CATATAN PENTING:
      // Xendit memerlukan PAYMENT ID untuk refund, bukan QR ID.
      // ID ini didapat dari callback saat pembayaran sukses.
      // Pastikan Anda telah menambahkan kolom `xendit_payment_id` di model `Xendit_QR_Payments`
      // dan menyimpannya saat callback diterima.
      if (!qrPayment.xendit_payment_id) {
        throw {
          name: "Payment ID tidak ditemukan, refund tidak bisa diproses.",
        };
      }

      // Panggil API Xendit untuk refund
      const refundResponse = await xenditClient.qr.refund({
        paymentId: qrPayment.xendit_payment_id,
        amount: amount,
        reason: reason, // e.g., 'REQUESTED_BY_CUSTOMER'
      });

      // Update status di database kita
      await qrPayment.update({ status: "REFUNDED" });

      res.status(200).json({
        statusCode: 200,
        message: "Permintaan refund berhasil diproses.",
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
        throw { name: "File struk tidak ditemukan." };
      }

      // Path receipt_path harus merupakan path absolut ke file
      // Misal: /app/public/invoices/invoice-uuid.pdf
      const absolutePath = transaction.receipt_path;

      // Cek jika file benar-benar ada sebelum mengirim
      try {
        await fs.access(absolutePath); // fs.promises.access
      } catch (fileError) {
        throw { name: "File struk tidak ditemukan di server." };
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
        throw { name: "Data QR Code tidak ditemukan." };
      }

      res.status(200).json({
        statusCode: 200,
        message: "Data QR Code berhasil diambil.",
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
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({
        statusCode: 200,
        message: "Data transaksi berhasil diambil.",
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
        order: [["createdAt", "DESC"]], // Urutkan berdasarkan waktu pembuatan terbaru
        include: { model: Xendit_QR_Payments },
      });

      res.status(200).json({
        statusCode: 200,
        message: "Data transaksi terakhir berhasil diambil.",
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
          { model: Xendit_QR_Payments, attributes: ["status"] },
          { model: Merchants, attributes: ["merchant_name"] },
          // Jika ingin join ke Edc_Devices, pastikan asosiasinya sudah dibuat
          // { model: Edc_Devices, attributes: ['device_id'] }
        ],
        order: [["createdAt", "DESC"]],
      });

      res.status(200).json({
        statusCode: 200,
        message: "Semua data transaksi berhasil diambil.",
        data: transactions,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = Controller;
