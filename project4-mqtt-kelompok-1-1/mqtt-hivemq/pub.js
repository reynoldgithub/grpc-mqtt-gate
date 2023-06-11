const mqtt = require('mqtt');
const readline = require('readline');
// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
// const cors = require('cors');

// // Enable cors for development purposes only
// app.use(cors());

// // For parsing application/json
// app.use(bodyParser.json());

// // For parsing application/x-www-form-urlencoded
// app.use(bodyParser.urlencoded({ extended: true }));

const mqttConfig = {
  host: 'ca9d4d96421d4645b911287be2938b81.s2.eu.hivemq.cloud', // HiveMQ broker address
  port: 8883, // MQTT port
  protocol: 'mqtts',
  username: 'della12', // MQTT username
  password: 'sekolahygrajin12', // MQTT password
  clientId: 'pub'
};

// Initialize the MQTT client
const client = mqtt.connect(mqttConfig);

// Setup the MQTT client callbacks
client.on('connect', function () {
//   console.log('Connected to MQTT broker');
});

client.on('error', function (error) {
    console.log(error);
  });

// MQTT topics
// const masukTopic = 'my/test/topic/masuk';
// const keluarTopic = 'my/test/topic/keluar';

// app.post('/masuk', (req, res) => {
//   const idkartu = req.body.idkartu;
//   console.log(`ID Kartu: ${idkartu}`);
//   const idgate = req.body.idgate;
//   console.log(`ID Gate: ${idgate}`);

  // Publish message to the 'my/test/topic/masuk' topic
//   client.publish(MASUK, JSON.stringify({ idkartu, idgate }));

//   res.sendStatus(200);
// });

  // Membaca input dari terminal
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Masukkan ID Gate: ', (idgate) => {
  rl.question('Masukkan ID Kartu: ', (idkartu) => {
    // console.log(`Publishing message: ID Kartu: ${idkartu}, ID Gate: ${idgate}`);
    
    const data = {
        idgate,
        idkartu,
    };
    // Publish message to the 'my/test/topic/masuk' topic
    client.publish('KELUAR', JSON.stringify(data));


      // Menutup readline interface setelah selesai
    rl.close();
  });
});
client.on('error', (error) => {
    console.log('Error:', error);
  });
  
// app.listen(5000, () => {
//   console.log('Server listening on port 5000');
// });
