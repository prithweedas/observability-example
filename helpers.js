const { ecsFormat } = require("@elastic/ecs-pino-format");
const pino = require("pino");
const pinoElastic = require("pino-elasticsearch");
const fs = require("node:fs");
const path = require("node:path");
const { Pool } = require("pg");
const { default: Redis } = require("ioredis");

exports.redisCall = async function (redis, chance = 0.2) {
  if (Math.random() < chance) {
    await redis.call("FAKECOMMAND", "key");
  } else {
    await redis.set("yo", 10);
    const response = await redis.get("yo");
    return response;
  }
};

exports.postgresCall = async function (postgres, chance = 0.2) {
  if (Math.random() < chance) {
    await postgres.query("SELECT CAST('1N6' AS INTEGER) as data;")
  } else {
    const response = await postgres.query("SELECT CAST('123' AS INTEGER) as data;")
    return response.rows;
  }
};

exports.heavyTask = function (apm, name = "Heavy Computation") {
  const span = apm.startSpan(name);
  for (var i = 0; i < 100_000_000; i++) {}
  span.end();
};

exports.maybeAnError = function (chance = 0.2) {
  if (Math.random() < chance) {
    throw new Error("Here is a surprise error for you");
  }
};

exports.createRedis = function () {
  return new Redis({
    host: "redis",
  });
};

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

let pool;

exports.createPostgresConnectionPool = async () => {
  if (pool) {
    return pool;
  }

  pool = new Pool({
    host: "postgres",
    port: 5432,
    user: "user",
    password: "password",
    database: "main_db",
  });

  await pool.connect();

  return pool;
};
