const mqtt = require('mqtt');
require('dotenv').config();

class MqttHandler {
  constructor() {
    this.mqttClient = null;
    this.host = process.env.MQTT_HOST;
    this.username = process.env.MQTT_USERNAME; // mqtt credentials if these are needed to connect
    this.password = process.env.MQTT_PASS;
  }

  connect() {
    // Cek host yg dibaca
    console.log(`[MQTT] Mencoba connect ke host: ${this.host}`); // LOG 1: Cek Host yang dibaca

    // Connect mqtt with credentials (in case of needed, otherwise we can omit 2nd param)
    this.mqttClient = mqtt.connect(this.host, {
      username: this.username,
      password: this.password,
      reconnectPeriod: 5000, // Coba connect ulang tiap 5 detik jika putus
    });

    // Mqtt error calback
    this.mqttClient.on('error', (err) => {
      console.log(err);
      console.error('[MQTT] Connection Error:', err.message); // Ubah jadi error log
      // this.mqttClient.end(); // jangan panggil end, kalau gk dia ga akan recconnect otomatis
    });

    // Connection callback
    this.mqttClient.on('connect', () => {
      console.log(`[MQTT] Client connected successfully!`);
    });

    // mqtt subscriptions
    this.mqttClient.subscribe('callbackxenditdev', { qos: 0 });

    // When a message arrives, console.log it
    this.mqttClient.on('message', function (topic, message) {
      console.log(`[MQTT] Pesan masuk di topic '${topic}': ${message.toString()}`);
    });

    this.mqttClient.on('close', () => {
      console.log(`[MQTT] Connection closed/disconnected`);
    });

    this.mqttClient.on('offline', () => {
      console.log(`[MQTT] Client is offline`);
    });
  }

  // Sends a mqtt message to topic: mytopic
  sendMessage(message) {
    // LOG 2: Pastikan fungsi ini terpanggil oleh Controller
    console.log(`[MQTT] Preparing to send message: ${message}`); 

    // Cek status koneksi sebelum kirim
    if (!this.mqttClient || !this.mqttClient.connected) {
        console.error('[MQTT] GAGAL KIRIM: Client sedang tidak terkoneksi!');
        return;
    }

    // Tambahkan callback (err) untuk melihat status pengiriman
    this.mqttClient.publish('callbackxenditdev', message, (err) => {
        if (err) {
            console.error('[MQTT] Publish Error:', err);
        } else {
            console.log('[MQTT] Publish Sukses (Sent to Broker)');
        }
    });
  }
}

const mqttClient = new MqttHandler();
mqttClient.connect();

module.exports = mqttClient;
