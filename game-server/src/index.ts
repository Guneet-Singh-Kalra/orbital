import { serve } from "@hono/node-server";
import { Hono } from "hono";
import authenticate from "./middlewares/authenticate.ts";
import redis, { testRedisConnection } from "./helpers/redis.ts";

const app = new Hono();

app.use("/api", authenticate);

// health check
app.get("/", (c) => {
  return c.json({ message: "healthy" }, 200);
});

/**
 * @api {post} /api/scan Perform a radar scan for nearby players
 * @apiName RadarScan
 * @apiGroup Player
 *
 * @apiHeader {String} Authorization Firebase ID token in Bearer format.
 *
 * @apiDescription
 * Allows a player to perform a radar scan that reveals nearby players within a predefined radius.
 * The scan has a server-enforced cooldown. Scanned players are notified via FCM that they have been detected.
 *
 * @apiSuccess {Object[]} players List of nearby players detected by the scan.
 * @apiSuccess {String} players.playerId Unique ID of the scanned player.
 * @apiSuccess {String} players.username Username of the scanned player.
 * @apiSuccess {Object} players.location Last known location of the scanned player.
 * @apiSuccess {Number} players.location.lat Latitude.
 * @apiSuccess {Number} players.location.lng Longitude.
 *
 * @apiError (403) {String} message Player is on cooldown and cannot scan yet.
 * @apiError (401) {String} message Invalid or missing authorization token.
 * @apiError (500) {String} message Server error.
 */
app.get("/api/scan", async (c) => {});

app.get("/*", (c) => {
  return c.notFound();
});

async function start() {
  // connect to redis
  await redis.connect();
  console.log("Redis connected.");
  await testRedisConnection();

  // start server
  const server = serve(
    {
      fetch: app.fetch,
      port: 6767,
    },
    (info) => {
      console.log(`Server is running on http://localhost:${info.port}`);
    },
  );

  // 3. Graceful shutdown
  const shutdown = async (signal: string) => {
    console.log(`Received ${signal}, shutting down...`);

    try {
      await redis.quit(); // graceful Redis shutdown
      console.log("Redis connection closed");
    } catch (err) {
      console.error("Error closing Redis:", err);
    }

    // Close HTTP server if available
    if (server?.close) {
      server.close();
    }

    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

start().catch((err) => {
  console.error("Server startup failed:", err);
  process.exit(1);
});
