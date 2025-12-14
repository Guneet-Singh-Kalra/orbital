# Orbital

Orbital is a **location-based multiplayer mobile game** designed for real-world environments such as hostels, apartment blocks, or campuses.

Players exist on a real map, scan nearby areas to reveal others, and deploy delayed orbital weapons that give targets time to react. Death has real-world consequences: once eliminated, players must physically reposition and wait for an opportunity to strike back.

This repository contains the **Node.js backend MVP**, built with **Hono** and **Firebase**.

---

## Core Gameplay (MVP)

- Minimap is empty by default
- Players can perform a **Radar Scan**
  - Reveals nearby players within a radius for a short duration
  - Notifies scanned players that they have been spotted
  - Scan has a server-enforced cooldown

- Players can target an area and deploy an **Orbital Railcannon**
  - Weapon has a charge-up time
  - All players in the kill zone are notified during the charge phase
  - Strike resolves automatically after charging

- Players can activate a **Shield**
  - Single-use
  - Cooldown-based
  - Reflects the attack back to the attacker
  - Shield status is hidden from the attacker

- **Death & Respawn**
  - On being eliminated, a player is temporarily removed from active play
  - Respawn occurs after a cooldown timer (default 5 minutes)
  - While waiting, eliminated players can still see attacker locations to plan revenge

---

## Architecture Overview

Orbital uses an **authoritative server model**. All combat, timing, and validation logic runs server-side.

### High-Level Components

- Client (separate repo)
  - Next.js PWA
  - Geolocation API
  - Push notifications

- Backend
  - Node.js
  - Hono (HTTP + WebSocket handling)
  - Firebase Admin SDK

- Firebase
  - Firestore (persistent and last-known state)
  - Firebase Authentication
  - Firebase Cloud Messaging (pub/sub notifications)

---

## Data Flow Summary

### Location Updates

- Client sends location updates via REST
- Server validates movement and accuracy
- Location is stored:
  - In-memory for hot gameplay state
  - Periodically persisted to Firestore as last-known position

```
Client -> REST -> Hono -> In-memory state -> Firestore (throttled)
```

### Radar Scan

```
Client -> REST /scan
Server -> Geo query (Firestore)
Server -> Scan results returned to scanner
Server -> Pub/Sub notifications to scanned players
```

### Orbital Strike

```
Client -> REST /attack
Server -> Start charge timer
Server -> Pub/Sub warnings to players in kill zone
Server -> Resolve strike (kill or shield reflect)
Server -> Pub/Sub outcome notifications
```

---

## Tech Stack

### Backend

- Node.js 20+
- Hono
- TypeScript

### Firebase

- Firestore
- Firebase Authentication
- Firebase Cloud Messaging

---

## Project Structure

```
.
├── src
│   ├── index.ts            # Hono app entry
│   ├── ws.ts               # WebSocket handling
│   ├── firebase.ts         # Firebase admin initialization
│   ├── routes
│   │   ├── location.ts
│   │   ├── scan.ts
│   │   ├── attack.ts
│   │   └── shield.ts
│   ├── game
│   │   ├── state.ts        # In-memory live state
│   │   ├── radar.ts
│   │   ├── weapons.ts
│   │   └── combat.ts
│   └── utils
│       ├── geo.ts
│       ├── cooldown.ts
│       └── antiCheat.ts
├── package.json
├── tsconfig.json
└── README.md
```

---

## Firebase Data Model (MVP)

### Players

```
players/{playerId}
  username: string
  points: number
  weapons: string[]
  createdAt: timestamp
```

### Live State (Last Known)

```
players/{playerId}/live
  lat: number
  lng: number
  geohash: string
  updatedAt: timestamp
  alive: boolean
```

Firestore is **not** used as a real-time position stream.

---

## Notifications (Pub/Sub)

All player-facing events are delivered via Firebase Cloud Messaging:

- You have been spotted
- Orbital strike charging
- Orbital strike impact
- Shield parry
- Elimination notice

Clients subscribe to:

- Per-player topics
- Area-based topics (geohash prefix)
- Global announcements

---

## Anti-Abuse Measures (MVP)

- Server-side cooldown enforcement
- Speed and teleport detection on location updates
- Accuracy threshold checks
- No client-trusted combat resolution
- Rate-limited scan and attack endpoints

---

## Getting Started

### Install

```
npm install
```

### Environment Variables

```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Run Development Server

```
npm run dev
```

---

## MVP Scope

Included:

- Single building or campus
- Anonymous authentication
- One weapon type
- Manual scanning only

Not included:

- Teams or factions
- In-app purchases
- Persistent minimap
- Matchmaking

---

## Future Improvements

- Weapon-specific elimination penalties
- Additional orbital weapons with varying charge times and radii
- Persistent or semi-persistent radar powerups
- Cooldown-reduction and deception powerups
- Rare, location-locked superweapons discoverable in the environment
- Factions, alliances, and betrayal mechanics
- Heatmaps and safe zones
- Multiple backend instances with shared state
- Advanced GPS spoof detection
- Replay and strike history visualization

---

## Design Philosophy

Orbital is designed around:

- Delayed consequences
- Psychological pressure
- Real-world movement
- Imperfect information

The game is intentionally asymmetric, slow-burning, and social.
