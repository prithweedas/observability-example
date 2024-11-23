const apm = require("elastic-apm-node").start({
  serviceName: "service-03",
  serverUrl: process.env.APM_HOST,
  environment: "development",
  serverCaCertFile: "./certs/ca/ca.crt",
});

const { createLogger } = require("./helpers");

const log = createLogger(process.env.ES_HOST);

const app = require("express")();

app.get("/", async function (req, res) {
  try {
    log.info("Hey form service 3!");

    for (var i = 0; i < 100_000_000; i++) {}

    res.send("Hello World!");
  } catch (error) {
    apm.captureError(error);
    res.status(500).send("Error!");
  }
});

app.listen(3000);
