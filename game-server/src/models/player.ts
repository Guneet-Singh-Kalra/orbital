import { z } from "zod";

export const PlayerModel = z.object({
  // Firebase Auth UID (server-trusted)
  uid: z.string(),

  // Public identity
  username: z.string().min(1),
  points: z.number().int().min(0),

  // Core gameplay state
  alive: z.boolean(),

  // Cooldowns & timers (absolute timestamps in ms)
  weaponCooldownEndsAt: z.number().int().min(0),
  shieldCooldownEndsAt: z.number().int().min(0),
  lastScanAt: z.number().int().min(0),
  respawnAt: z.number().int().min(0),

  // Authoritative location (from Redis GEO)
  location: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),

  // Snapshot-only location (for Firestore persistence / debugging)
  lastKnownLocation: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),

  // Geohash (for proximity queries / Redis convenience)
  geohash: z.string().min(1),

  // Experimental / future-proofing
  metadata: z.record(z.string(), z.unknown()).optional(),
});
