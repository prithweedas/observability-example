const apm = require("elastic-apm-node").start({
  serviceName: "service-01",
  serverUrl: process.env.APM_HOST,
  environment: "development",
  serverCaCertFile: "./certs/ca/ca.crt",
});

const { createLogger, apiCall } = require("./helpers");

const log = createLogger(process.env.ES_HOST);
const pinoHttp = require('pino-http');

const app = require("express")();

app.use(pinoHttp({logger: log}))

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", async function (req, res) {
  try {
    log.info("Hey form service 1!");
    await apiCall(process.env.SERVICE_02);
    log.info("Hey form service 1 again!");
    return res.send("Hello World!");
  } catch (error) {
    apm.captureError(error);
    return res.status(500).send("Error!");
  }
});

app.listen(3000);
