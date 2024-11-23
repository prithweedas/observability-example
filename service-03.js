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
} = require("./helpers");

const log = createLogger(process.env.ES_HOST);

const app = require("express")();

app.get("/", async function (req, res) {
  try {
    const pgPool = await createPostgresConnectionPool();

    log.info("Hey form service 3!");

    const pgPromise = postgresCall(pgPool, CHANCE);

    heavyTask();

    const result = await pgPromise;

    maybeAnError()

    log.info(`Result: ${JSON.stringify(result)}`);

    res.send("Hello World!");
  } catch (error) {
    apm.captureError(error);
    res.status(500).send("Error!");
  }
});

app.listen(3000);
