const { ecsFormat } = require("@elastic/ecs-pino-format");
const pino = require("pino");
const pinoElastic = require("pino-elasticsearch");
const fs = require("node:fs");
const path = require("node:path");

exports.createLogger = function(node) {
  const streamToElastic = pinoElastic({
    index: "logs-service",
    esVersion: 8,
    flushBytes: 1000,
    node: node,
    auth: {
      username: "elastic",
      password: "password",
    },
    tls: {
      ca: fs.readFileSync(path.join(__dirname, "certs", "ca", "ca.crt")),
      rejectUnauthorized: true,
    },
  });
  
  const log = pino(ecsFormat({ apmIntegration: true }), streamToElastic);

  return log
}