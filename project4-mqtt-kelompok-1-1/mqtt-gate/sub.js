const mqtt = require('mqtt');
const sql = require('mssql');
const express = require('express');
const app = express();
const bodyParser = require('body-parser');

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

const brokerUrl = 'mqtt://localhost:1883';
const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
  console.log('Terhubung ke broker MQTT');
  client.subscribe('MASUK_REQ');
});

client.on('message', async (topic, message) => {
  if (topic === 'MASUK_REQ') {
    const data = message.toString(); // Mengonversi pesan menjadi string
    const jsonData = JSON.parse(data);
    let msgId = jsonData.id
    const payload = jsonData.payload
    const gate = payload.idgate;
    const kartu = payload.idkartu;
    let result = await masukHandle(kartu, gate);
    const response = {
      id : msgId,
      payload : {
        status : result
      }
    } 
    client.publish('MASUK_RES', JSON.stringify(response));
  } else {
    const data = message.toString(); // Mengonversi pesan menjadi string
    const jsonData = JSON.parse(data);
    const gate = jsonData.idgate;
    const kartu = jsonData.idkartu;
    await keluarHandle(kartu, gate);
  }
});

client.on('error', (error) => {
  console.log('Error:', error);
});

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
        return 1
      } else {
        logActivity(idkartu, idgate, 'MASUK', 0);
        console.log('0');
        return 0
      }
    } else {
      console.log('0');
      return 0
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
