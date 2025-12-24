import { z } from "zod";

export const PlayerModel = z.object({
  // Firebase Auth UID (injected by server, never trusted from client)
  uid: z.string(),

  // Public identity
  username: z.string().min(1),
  points: z.number().int().min(0),

  // Core gameplay state
  alive: z.boolean(),

  // Cooldowns & timers (absolute timestamps, ms)
  weaponCooldownEndsAt: z.number().int().min(0),
  shieldCooldownEndsAt: z.number().int().min(0),
  lastScanAt: z.number().int().min(0),
  respawnAt: z.number().int().min(0),

  // Snapshot-only location (NOT authoritative)
  lastKnownLocation: z.object({
    lat: z.number().min(-90).max(90),
    lng: z.number().min(-180).max(180),
  }),

  // Stored for convenience / debugging
  geohash: z.string().min(1),

  // Experimental / future-proofing
  metadata: z.record(z.string(), z.unknown()).optional(),
});
