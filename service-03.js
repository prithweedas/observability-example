const apm = require("elastic-apm-node").start({
  serviceName: "service-03",
  serverUrl: process.env.APM_HOST,
  environment: "development",
  serverCaCertFile: "./certs/ca/ca.crt",
});

const { createLogger, createPostgresConnectionPool } = require("./helpers");

const log = createLogger(process.env.ES_HOST);

const app = require("express")();

app.get("/", async function (req, res) {
  try {
    const pgPool = await createPostgresConnectionPool();

    log.info("Hey form service 3!");

    const computationSpan = apm.startSpan('Heavy Computation')
    
    for (var i = 0; i < 100_000_000; i++) {}
    
    computationSpan.end()
    
    const result = await pgPool.query("SELECT 1 as data");
    
    log.info(`Result: ${JSON.stringify(result.rows)}`)
    
    const anotherComputationSpan = apm.startSpan('Heavy Computation Again')

    for (var i = 0; i < 100_000_000; i++) {}

    anotherComputationSpan.end()

    res.send("Hello World!");
  } catch (error) {
    apm.captureError(error);
    res.status(500).send("Error!");
  }
});

app.listen(3000);
