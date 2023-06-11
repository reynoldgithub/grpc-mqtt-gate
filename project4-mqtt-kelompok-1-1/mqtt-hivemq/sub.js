const mqtt = require('mqtt');
const sql = require('mssql');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

const mqttConfig = {
  host: 'ca9d4d96421d4645b911287be2938b81.s2.eu.hivemq.cloud', // HiveMQ broker address
  port: 8883, // MQTT port
  protocol: 'mqtts',
  username: 'della12', // MQTT username
  password: 'sekolahygrajin12', // MQTT password
  clientId: 'subs'
};

const sqlConfig = {
    user: 'integratif',
    password: 'G3rb4ng!',
    database: 'GATE_DEV',
    server: '10.199.14.47',
    options: {
      encrypt: false, // for azure
      trustServerCertificate: false, // change to true for local dev / self-signed certs
    },
  };

// Initialize the MQTT client
const client = mqtt.connect(mqttConfig);

client.on('connect', () => {
    console.log('Terhubung ke broker MQTT');
    client.subscribe('KELUAR');
  });

  // MQTT topics
//   const masukTopic = 'my/test/topic/masuk';
//   const keluarTopic = 'my/test/topic/keluar';

  // Subscribe to the 'my/test/topic/masuk' topic
//   client.subscribe(masukTopic, function (error) {
//     if (error) {
//       console.log('Subscribe error:', error);
//     } else {
//       console.log('Subscribed to topic:', masukTopic);
//     }
//   });

  // Subscribe to the 'my/test/topic/keluar' topic
//   client.subscribe(keluarTopic, function (error) {
//     if (error) {
//       console.log('Subscribe error:', error);
//     } else {
//       console.log('Subscribed to topic:', keluarTopic);
//     }
//   });
// });

client.on('message', async (topic, message) => {
    if (topic === 'MASUK') {
      // console.log(topic);
      const data = message.toString(); // Mengonversi pesan menjadi string
      // console.log(data);
  
      const jsonData = JSON.parse(data);
      // console.log(jsonData);
  
      const gate = jsonData.idgate;
      const kartu = jsonData.idkartu;
  
      await masukHandle(kartu, gate);
      // await keluarHandle(kartu, gate);
    } else {
      // console.log(topic);
      const data = message.toString(); // Mengonversi pesan menjadi string
      // console.log(data);
  
      const jsonData = JSON.parse(data);
      // console.log(jsonData);
  
      const gate = jsonData.idgate;
      const kartu = jsonData.idkartu;
  
      await keluarHandle(kartu, gate);
    }
  });
  
  client.on('error', (error) => {
    console.log('Error:', error);
  });
  
  // Functions to establish a connection with the MSSQL database
  async function runQuery(query) {
    try {
      const pool = await sql.connect(sqlConfig);
      const result = await pool.query(query);
      return result;
    } catch (err) {
      console.log(`[${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}] ${err}`);
      throw err;
    }
  }
  
  // Function to log entry and exit activities
  function logActivity(idKartu, idGate, jenisAktivitas, is_valid) {
    let table;
    if (jenisAktivitas == 'MASUK') {
      table = 'log_masuk';
    } else {
      table = 'log_keluar';
    }
  
    const query = `INSERT INTO ${table} (id_kartu_akses, id_register_gate, is_valid) VALUES ('${idKartu}', ${idGate}, ${is_valid})`;
    runQuery(query)
      .then(() => {
        // console.log(`[${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}] Activity successfully logged.`);
      })
      .catch((err) => {
        console.log(`[${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}] ${err}`);
      });
  }
  
  const masukHandle = async (idkartu, idgate) => {
    // console.log(`[${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}] ID Kartu: ${idkartu}`);
    // console.log(`[${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}] ID Gate: ${idgate}`);
  
    try {
      const result = await runQuery(`SELECT * FROM kartu_akses WHERE id_kartu_akses = '${idkartu}'`);
      const _res = result.recordsets[0].length;
      const result2 = await runQuery(`SELECT * FROM register_gate WHERE id_register_gate = '${idgate}'`);
      const _res2 = result2.recordsets[0].length;
  
      if (Boolean(_res) && Boolean(_res2)) {
        const is_aktif = result.recordset[0]['is_aktif'];
  
        if (Boolean(is_aktif)) {
          logActivity(idkartu, idgate, 'MASUK', 1);
          console.log('1');
        } else {
          logActivity(idkartu, idgate, 'MASUK', 0);
          console.log('0');
        }
      } else {
        console.log('0');
      }
    } catch (err) {
      console.log(`[${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}] ${err}`);
    }
  };
  
  const keluarHandle = async (idkartu, idgate) => {
    try {
      const result = await runQuery(`SELECT * FROM kartu_akses WHERE id_kartu_akses = '${idkartu}'`);
      const _res = result.recordsets[0].length;
      const result2 = await runQuery(`SELECT * FROM register_gate WHERE id_register_gate = '${idgate}'`);
      const _res2 = result2.recordsets[0].length;
  
      if (Boolean(_res) && Boolean(_res2)) {
        const is_aktif = result.recordset[0]['is_aktif'];
  
        if (Boolean(is_aktif)) {
          logActivity(idkartu, idgate, 'KELUAR', 1);
          console.log('1');
        } else {
          logActivity(idkartu, idgate, 'KELUAR', 0);
          console.log('0');
        }
      } else {
        console.log('0');
      }
    } catch (err) {
      console.log(`[${new Date().toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' })}] ${err}`);
    }
  };
