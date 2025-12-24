import { serve } from "@hono/node-server";
import { Hono } from "hono";
import authenticate from "./middlewares/authenticate.ts";
import redis from "./helpers/redis.ts";

const app = new Hono();

app.use("/api", authenticate);

// health check
app.get("/", (c) => {
  return c.json({ message: "healthy" }, 200);
});

/**
 * Initiates an orbital strike at a target location.
 *
 * This endpoint is fully server-authoritative.
 * The client only provides a target latitude/longitude.
 *
 * Flow:
 * 1. Authenticates the player via Firebase Auth (middleware).
 * 2. Validates the attacker is alive and not on weapon cooldown.
 * 3. Verifies the target location is within allowed attack range
 *    based on the attacker's authoritative Redis GEO position.
 * 4. Performs a Redis GEO radius query to snapshot all players
 *    currently inside the strike radius.
 * 5. Persists a strike record and frozen target list in Redis.
 * 6. Starts a delayed resolution timer (charge-up phase).
 * 7. Notifies all affected players that an orbital strike is charging.
 * 8. Applies the weapon cooldown immediately to the attacker.
 *
 * Important:
 * - Combat resolution does NOT rely on client data.
 * - Player positions are snapshotted at attack time and are NOT
 *   re-evaluated at impact to avoid GPS jitter exploits.
 * - Damage, shields, deaths, and reflections are resolved asynchronously
 *   by the server after the charge duration elapses.
 *
 * @route GET /api/attack
 * @auth Requires valid Firebase Authentication
 * @body {Object} body
 * @body {number} body.lat - Target latitude
 * @body {number} body.lng - Target longitude
 * @returns {Object} 200 - Strike confirmation with strikeId and resolve time
 * @throws {401} Unauthorized - Missing or invalid auth
 * @throws {403} Forbidden - Player is dead or not allowed to attack
 * @throws {429} Too Many Requests - Weapon is on cooldown
 * @throws {400} Bad Request - Invalid or out-of-range target location
 */
app.get("/api/attack", (c) => {
  // implementation
});

app.get("/*", (c) => {
  return c.notFound();
});

async function start() {
  // connect to redis
  await redis.connect();
  console.log("Redis connected.");

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
