const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");
const sql = require("mssql");

const PORT = 3003

const sqlConfig = {
  user: "integratif",
  password: "G3rb4ng!",
  database: "GATE_DEV",
  server: "10.199.14.47",
  options: {
    encrypt: false, // for azure
    trustServerCertificate: false, // change to true for local dev / self-signed certs
  },
};

function runQuery(query) {
  return sql
    .connect(sqlConfig)
    .then((pool) => {
      return pool.query(query);
    })
    .catch((err) => {
      console.log(
        `[${new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        })}] ${err}`
      );
      throw err;
    });
}

// Log activity to log table
function logActivity(idKartu, idGate, jenisAktivitas, is_valid) {
  let table;
  if (jenisAktivitas == "MASUK") table = "log_masuk";
  else table = "log_keluar";
  const query = `INSERT INTO ${table} (id_kartu_akses, id_register_gate, is_valid) VALUES ('${idKartu}', ${idGate}, ${is_valid})`;
  runQuery(query)
    .then(() => {
      console.log(
        `[${new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        })}] Aktivitas telah berhasil di-logging.`
      );
    })
    .catch((err) => {
      console.log(
        `[${new Date().toLocaleString("id-ID", {
          timeZone: "Asia/Jakarta",
        })}] ${err}`
      );
    });
}

const masukHandle = async (idkartu, idgate) => {
  console.log(
    `[${new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    })}] ID Kartu: ${idkartu}`
  );
  console.log(
    `[${new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    })}] ID Gate: ${idgate}`
  );

  try {
    const result = await runQuery(
      `SELECT * FROM kartu_akses WHERE id_kartu_akses = '${idkartu}'`
    );
    const _res = result.recordsets[0].length;
    const result2 = await runQuery(
      `SELECT * FROM register_gate WHERE id_register_gate = '${idgate}'`
    );
    const _res2 = result2.recordsets[0].length;
    if (Boolean(_res) && Boolean(_res2)) {
      const is_aktif = result.recordset[0]["is_aktif"];
      if (Boolean(is_aktif)) {
        logActivity(idkartu, idgate, "MASUK", 1);
        return 1;
      } else {
        logActivity(idkartu, idgate, "MASUK", 0);
        return 0;
      }
    } else {
      return 0;
    }
  } catch (err) {
    console.log(
      `[${new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
      })}] ${err}`
    );
  }
};

const keluarHandle = async (idkartu, idgate) => {
  console.log(
    `[${new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    })}] ID Kartu: ${idkartu}`
  );
  console.log(
    `[${new Date().toLocaleString("id-ID", {
      timeZone: "Asia/Jakarta",
    })}] ID Gate: ${idgate}`
  );

  try {
    // Check if idkartu is active and idgate exists
    const result = await runQuery(
      `SELECT * FROM kartu_akses WHERE id_kartu_akses = '${idkartu}'`
    );
    const _res = result.recordsets[0].length;
    const result2 = await runQuery(
      `SELECT * FROM register_gate WHERE id_register_gate = '${idgate}'`
    );
    const _res2 = result2.recordsets[0].length;
    if (Boolean(_res) && Boolean(_res2)) {
      // Log activity
      const is_aktif = result.recordset[0]["is_aktif"];
      if (Boolean(is_aktif)) {
        logActivity(idkartu, idgate, "KELUAR", 1);
        return 1;
      } else {
        logActivity(idkartu, idgate, "KELUAR", 0);
        return 0;
      }
    } else {
      return 0;
    }
  } catch (err) {
    console.log(
      `[${new Date().toLocaleString("id-ID", {
        timeZone: "Asia/Jakarta",
      })}] ${err}`
    );
  }
};

const masuk = async (call, callback) => {
  const { idkartu, idgate } = call.request;
  const result = await masukHandle(idkartu, idgate);

  const response = { status: result };
  callback(null, response);
};

const keluar = async (call, callback) => {
  const { idkartu, idgate } = call.request;
  const result = await keluarHandle(idkartu, idgate);

  const response = { status: result };
  callback(null, response);
};


const packageDefinition = protoLoader.loadSync("./gate.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const gateProto = grpc.loadPackageDefinition(packageDefinition).gate;

const server = new grpc.Server();

server.addService(gateProto.GateService.service, {
  masuk,
  keluar,
});

server.bindAsync(
  `localhost:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    if (error) {
      console.log("Error: ", error, port);
      return;
    }
    console.log(`Server started listening on port ${port}`);
    server.start();
  }
);
