const grpc = require("@grpc/grpc-js");
const protoLoader = require("@grpc/proto-loader");

// const host = "localhost:3001"; 

const packageDefinition = protoLoader.loadSync("./gate.proto", {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});

const gateProto = grpc.loadPackageDefinition(packageDefinition).gate;

const host = "10.15.43.74:3001"; 
const client = new gateProto.GateService(
  host,
  grpc.credentials.createInsecure()
);

async function masuk(idkartu, idgate) {
  try {
    const request = { idkartu, idgate };

    client.masuk(request, (err, response) => {
      if (err) {
        console.error("Error:", err.message);
      } else {
        console.log("Response:", response);
      }
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}

async function keluar(idkartu, idgate) {
  try {
    const request = { idkartu, idgate };
    client.keluar(request, (err, response) => {
      if (err) {
        console.error("Error:", err.message);
      } else {
        console.log("Response:", response);
      }
    });
  } catch (err) {
    console.error("Error:", err.message);
  }
}

function retryConnection(retryOptions) {
  setTimeout(() => {
    retryOptions.currentRetryDelay *= retryOptions.retryDelayMultiplier;
    if (retryOptions.currentRetryDelay > retryOptions.maxRetryDelay) {
      console.error("Exceeded max retry delay. Giving up.");
      return;
    }
    console.log(
      `Retrying connection in ${retryOptions.currentRetryDelay} ms...`
    );
    startConnection(client, retryOptions);
  }, retryOptions.currentRetryDelay);
}

function startConnection(client, retryOptions) {
  client.waitForReady(Date.now() + retryOptions.currentRetryDelay, (error) => {
    if (error) {
      console.error("Failed to connect to the server:", error);
      // retryOptions.backoff();
      retryConnection(retryOptions);
    } else {
      console.log("Connected to the server");
      masuk(1212121212, 5);
      // keluar(1212121212, 5);
    }
}
  });

const retryOptions = {
  currentRetryDelay: 1000,
  retryDelayMultiplier: 1.6,
  maxRetryDelay: 60000,
};

// Start the initial connection
startConnection(client, retryOptions);
