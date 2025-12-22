import { z } from "zod";

// Zod schema for **Player** data
const PlayerModel = z.object({
  // Player's unique identifier (playerId)
  playerId: z.string(),

  // Player status: "alive" or "eliminated"
  status: z.enum(["alive", "eliminated"]),

  // Player's username (from Google OAuth or custom input)
  username: z.string().min(1), // Username must be non-empty

  // Player's points (e.g., score or in-game currency)
  points: z.number().int().min(0), // Non-negative integer for points

  // Weapon cooldowns (in milliseconds from now)
  weaponCooldown: z.number().int().min(0), // Timestamp for weapon cooldown end
  shieldCooldown: z.number().int().min(0), // Timestamp for shield cooldown end

  // Last time the player scanned (used for rate-limiting)
  lastScanTime: z.number().int().min(0), // Timestamp of the last scan

  // Timestamp for when player can respawn if eliminated
  respawnTime: z.number().int().min(0), // Timestamp when player can respawn

  // Player's location (latitude, longitude)
  location: z.object({
    lat: z.number().min(-90).max(90), // Latitude range: -90 to 90
    lng: z.number().min(-180).max(180), // Longitude range: -180 to 180
  }),

  // Player’s geohash for geo-query purposes (used for proximity search)
  geohash: z.string().min(1), // A string representing the geohash

  // Whether the player is currently alive
  alive: z.boolean(),

  // Player's last known location (helps with movement and proximity checks)
  lastKnownLocation: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),

  // Optional field for any custom metadata (e.g., inventory, temporary buffs)
  metadata: z.record(z.string(), z.unknown()).optional(), // e.g., { "weapon": "orbital railgun" }
});

export default PlayerModel;
