'use strict';

// Data awal (seed) untuk history palsu
let fakeHistory = [
  {
    description: 'Burger',
    amount: 55000,
    timestamp: new Date('2025-11-09T10:00:00Z'),
  },
  {
    description: 'French Fries',
    amount: 25000,
    timestamp: new Date('2025-11-09T12:30:00Z'),
  },
  {
    description: 'Ice Cream',
    amount: 15000,
    timestamp: new Date('2025-11-09T15:00:00Z'),
  },
  {
    description: 'Coffee Latte',
    amount: 35000,
    timestamp: new Date('2025-11-10T08:00:00Z'),
  },
  {
    description: 'Pizza Slice',
    amount: 45000,
    timestamp: new Date('2025-11-10T11:45:00Z'),
  },
  {
    description: 'Salad Bowl',
    amount: 65000,
    timestamp: new Date('2025-11-10T13:00:00Z'),
  },
  {
    description: 'Smoothie',
    amount: 40000,
    timestamp: new Date('2025-11-10T16:20:00Z'),
  },
  {
    description: 'Drink Combo',
    amount: 50000,
    timestamp: new Date('2025-11-10T19:00:00Z'),
  },
];

// Counter untuk penamaan item berikutnya
let historyCounter = 1;

class HistoryController {
  /**
   * Mengambil semua data history, diurutkan dari yang terbaru.
   */
  static getHistory(req, res, next) {
    try {
      // Mengurutkan data dari yang terbaru ke yang terlama sebelum mengirim
      const sortedHistory = [...fakeHistory].sort((a, b) => b.timestamp - a.timestamp);
      res.status(200).json({
        statusCode: 200,
        message: 'History berhasil diambil.',
        data: sortedHistory,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Menambahkan entri baru ke history palsu.
   * @param {object} transaction - Objek transaksi yang berhasil.
   */
  static addFakeHistoryEntry(transaction) {
    const newEntry = {
      description: `Drink Combo ${historyCounter + 1}`, // Membuat nama item unik
      amount: transaction.amount,
      timestamp: new Date(),
    };
    fakeHistory.push(newEntry);
    historyCounter++; // Naikkan counter untuk transaksi berikutnya
    console.log('Fake history entry added:', newEntry);
  }
}

module.exports = HistoryController;
