import { createClient } from "redis";

/*
* Redis key naming conventions for orbital

* players
*   GEO set containing live player positions
*   member   -> playerId
*   value    -> longitude, latitude

* cooldown:{playerId}:{actionName}
*   String key with TTL
*   Used for server-enforced cooldowns
*   Example:
*     cooldown:abc123:scan

* attack:{attackId}
*   String key (JSON payload)
*   Stores pending attack event data

* PUBSUB CHANNELS

* attack:scheduled
*   Published when a new attack is scheduled
*   Used to wake workers / listeners

* Notes:
* - Keys are flat and simple
* - Redis holds live, ephemeral state
* - Persistent data belongs in Firestore
*/

const client = createClient();

client.on("error", (err) => console.log("Redis Client Error", err));

/**
 * Connect to Redis if not already connected.
 */
export async function connectRedis() {
  if (!client.isOpen) await client.connect();
}

/**
 * Store a player's current location in Redis GEO.
 * @param playerId Player's unique ID
 * @param lat Latitude
 * @param lng Longitude
 */
export async function setPlayerLocation(
  playerId: string,
  lat: number,
  lng: number,
) {
  await connectRedis();
  await client.geoAdd("players", {
    longitude: lng,
    latitude: lat,
    member: playerId,
  });
}

/**
 * Get nearby players within a certain radius (meters)
 * @param lat Latitude of center
 * @param lng Longitude of center
 * @param radiusMeters Radius in meters
 * @returns Array of playerIds within the radius
 */
export async function getPlayersInRadius(
  lat: number,
  lng: number,
  radiusMeters: number,
): Promise<string[]> {
  await connectRedis();
  const result = await client.geoRadius(
    "players",
    {
      latitude: lat,
      longitude: lng, // dawg refer to geoqueries type
    },
    radiusMeters,
    "m",
  );
  return result;
}

/**
 * Set a cooldown key for a player action
 * @param playerId Player ID
 * @param actionName Name of the action (e.g., "scan", "weapon", "shield")
 * @param ttlMs Time to live in milliseconds
 */
export async function setCooldown(
  playerId: string,
  actionName: string,
  ttlMs: number,
) {
  await connectRedis();
  const key = `cooldown:${playerId}:${actionName}`;
  await client.set(key, "1", { PX: ttlMs });
}

/**
 * Check if a player is on cooldown for a specific action
 * @param playerId Player ID
 * @param actionName Action name
 * @returns boolean
 */
export async function isOnCooldown(
  playerId: string,
  actionName: string,
): Promise<boolean> {
  await connectRedis();
  const key = `cooldown:${playerId}:${actionName}`;
  const exists = await client.exists(key);
  return exists === 1;
}

/**
 * Push an attack event to Redis with TTL for delayed execution
 * @param attackId Unique attack ID
 * @param payload AttackEvent payload
 * @param delayMs Delay in milliseconds before strike resolves
 */
export async function scheduleAttack(
  attackId: string,
  payload: Record<string, any>,
  delayMs: number,
) {
  await connectRedis();
  const key = `attack:${attackId}`;
  await client.set(key, JSON.stringify(payload), { PX: delayMs });
  // Optional: publish immediately to notify a listener
  await client.publish("attack:scheduled", key);
}

/**
 * Subscribe to a Redis channel (Pub/Sub)
 * @param channel Redis channel name
 * @param callback Function to call when a message is received
 */
export async function subscribe(
  channel: string,
  callback: (message: string) => void,
) {
  await connectRedis();
  const subscriber = client.duplicate();
  await subscriber.connect();
  await subscriber.subscribe(channel, callback);
}

/**
 * Publish a message to a Redis channel
 * @param channel Channel name
 * @param message Message to send
 */
export async function publish(channel: string, message: string) {
  await connectRedis();
  await client.publish(channel, message);
}

export default client;
