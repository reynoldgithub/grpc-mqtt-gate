const mqtt = require('mqtt');
const readline = require('readline');

const brokerUrl = 'mqtt://localhost:1883'; // Ganti dengan IP atau hostname dari broker MQTT Anda

const client = mqtt.connect(brokerUrl);

client.on('connect', () => {
  console.log('Connected to MQTT broker');

  // Membaca input dari terminal
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  // Menanyakan nilai idGate dan idKartu kepada pengguna
  rl.question('idgate: ', (idgate) => {
    rl.question('idkartu: ', (idkartu) => {
      const data = {
        idgate,
        idkartu,
      };
      // Publish pesan dengan nilai idGate dan idKartu yang diinputkan
      // client.publish('MASUK', `idgate: ${idgate},\nidkartu: ${idkartu}`);
      client.publish('KELUAR', JSON.stringify(data));

      // Menutup readline interface setelah selesai
      rl.close();
    });
  });
});

client.on('error', (error) => {
  console.log('Error:', error);
});
