const { ecsFormat } = require("@elastic/ecs-pino-format");
const pino = require("pino");
const pinoElastic = require("pino-elasticsearch");
const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");
const { default: Redis } = require("ioredis");

exports.createRedis = function(){
  return new Redis({
    host: 'redis'
  })
}

exports.createLogger = function (node) {
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

  return log;
};

let pool

exports.createPostgresConnectionPool = async () => {
  if(pool) {
    return pool
  }

  pool = new Pool({
    host: "postgres",
    port: 5432,
    user: "user",
    password: "password",
    database: "main_db",
  });

  await pool.connect()

  return pool
};
