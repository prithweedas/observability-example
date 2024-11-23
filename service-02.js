const apm = require("elastic-apm-node").start({
  serviceName: "service-02",
  serverUrl: process.env.APM_HOST,
  environment: "development",
  serverCaCertFile: "./certs/ca/ca.crt",
});

const CHANCE = 0.5;

const {
  createLogger,
  createRedis,
  redisCall,
  apiCall,
  heavyTask,
  maybeAnError,
} = require("./helpers");
const pinoHttp = require('pino-http');

const log = createLogger(process.env.ES_HOST);

const redis = createRedis();

const app = require("express")();
app.use(pinoHttp({logger: log}))

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", async function (req, res) {
  try {
    log.info("Hey form service 2!");

    maybeAnError();

    heavyTask(apm);

    const result = await redisCall(redis, CHANCE);

    log.info(`Redis response: ${result}`);

    await apiCall(process.env.SERVICE_03);

    heavyTask(apm);

    return res.send("Hello World!");
  } catch (error) {
    apm.captureError(error);
    return res.status(500).send("Error!");
  }
});

app.listen(3000);
