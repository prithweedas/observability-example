const apm = require("elastic-apm-node").start({
  serviceName: "service-03",
  serverUrl: process.env.APM_HOST,
  environment: "development",
  serverCaCertFile: "./certs/ca/ca.crt",
});

const CHANCE = 0.2;

const {
  createLogger,
  createPostgresConnectionPool,
  postgresCall,
  heavyTask,
  maybeAnError,
} = require("./helpers");
const pinoHttp = require("pino-http");

const log = createLogger(process.env.ES_HOST);

const app = require("express")();

app.use(
  pinoHttp({
    logger: log,

    customLogLevel: function (req, res, err) {
      if (res.statusCode >= 400 && res.statusCode < 500) {
        return "warn";
      } else if (res.statusCode >= 500 || err) {
        return "error";
      } else if (res.statusCode >= 300 && res.statusCode < 400) {
        return "silent";
      }
      return "info";
    },

    customSuccessMessage: function (req, res) {
      return res.statusCode === 404
        ? `[${req.method}] ${req.url} - resource not found`
        : `[${req.method}] ${req.url} - ${req.method} completed`;
    },

    customReceivedMessage: function (req, res) {
      return `[${req.method}] ${req.url} - request received`;
    },

    customErrorMessage: function (req, res, err) {
      return `[${req.method}] ${req.url} - request errored with status code ${res.statusCode}`;
    },
  })
);

app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

app.get("/", async function (req, res) {
  try {
    const pgPool = await createPostgresConnectionPool();

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
