const apm = require("elastic-apm-node").start({
  serviceName: "service-02",
  serverUrl: process.env.APM_HOST,
  environment: "development",
  serverCaCertFile: "./certs/ca/ca.crt",
});

const { createLogger, createRedis } = require("./helpers");

const log = createLogger(process.env.ES_HOST)

const redis = createRedis()

const app = require("express")();

app.get("/", async function (req, res) {
  try {
    log.info("Hey form service 2!");

    await fetch(process.env.SERVICE_03);

    await redis.set('yo', 10)

    const response = await redis.get('yo')

    log.info(`Redis response: ${response}`)

    
    res.send("Hello World!");
  } catch (error) {
    apm.captureError(error);
    res.status(500).send("Error!");
  }
});

app.listen(3000);
