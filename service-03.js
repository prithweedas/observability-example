const apm = require("elastic-apm-node").start({
  serviceName: "service-03",
  serverUrl: process.env.APM_HOST,
  environment: "development",
  serverCaCertFile: "./certs/ca/ca.crt",
});

const CHANCE = 0.4;

const {
  createLogger,
  createPostgresConnectionPool,
  postgresCall,
  heavyTask,
  maybeAnError,
} = require("./helpers");

const log = createLogger(process.env.ES_HOST);

const app = require("express")();

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", async function (req, res) {
  try {
    const pgPool = await createPostgresConnectionPool();

    log.info("Hey form service 3!");

    const result = await postgresCall(pgPool, CHANCE);

    log.info(`Result: ${JSON.stringify(result)}`);

    maybeAnError();

    heavyTask(apm);

    return res.send("Hello World!");
  } catch (error) {
    apm.captureError(error);
    return res.status(500).send("Error!");
  }
});

app.listen(3000);
