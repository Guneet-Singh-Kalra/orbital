import type { Context } from "hono/jsx";
import { isOnCooldown, getPlayersInRadius } from "./redis.ts";

// Scan configuration
const SCAN_RADIUS_METERS = 50; // Example radius
const SCAN_COOLDOWN_MS = 30 * 1000; // 30 seconds

const scan = async (c: Context) => {
  try {
    const user = c.get("user") as { uid: string };

    const onCooldown = await isOnCooldown(user.uid, "scan");
    if (onCooldown) {
      return c.json({ message: "Scan is on cooldown." }, 403);
    }
    const playerLocation = { lat: 0, lng: 0 }; // TODO: Fetch from redis
    // Perform geo query: find nearby players
    const nearbyPlayerIds = await getPlayersInRadius(
      playerLocation.lat,
      playerLocation.lng,
      SCAN_RADIUS_METERS,
    );
    // TODO: fetch player info from Firestore / Redis to return username + location
    const players = nearbyPlayerIds.map((id) => ({
      playerId: id,
      username: "Unknown", // replace with actual username from DB
      location: { lat: 0, lng: 0 }, // replace with lastKnownLocation
    }));

    return c.json({ players }, 200);
  } catch (err) {
    console.error(err);
    return c.json({ message: "Server error." }, 500);
  }
};

export default scan;
