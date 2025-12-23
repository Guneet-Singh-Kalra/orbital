# Orbital

Orbital is a **location-based multiplayer mobile game** designed for real-world environments such as hostels, apartment blocks, or campuses.

Players exist on a real map, scan nearby areas to reveal others, and deploy delayed orbital weapons that give targets time to react. Death has real-world consequences: once eliminated, players must wait to respawn and physically reposition for an opportunity to strike back.

This repository contains the **full-stack MVP**, including a **Next.js client** and a **Node.js authoritative game server**, backed by **Redis GEO** and **Firebase**.

---

## Core Gameplay (MVP)

* Minimap is empty by default

* Players can perform a **Radar Scan**

  * Reveals nearby players within a radius for a short duration
  * Notifies scanned players that they have been spotted
  * Scan has a server-enforced cooldown

* Players can target an area and deploy an **Orbital Railcannon**

  * Weapon has a charge-up time
  * All players in the kill zone are notified during the charge phase
  * Strike resolves automatically after charging

* Players can activate a **Shield**

  * Single-use
  * Cooldown-based
  * Reflects the attack back to the attacker
  * Shield status is hidden from the attacker

* **Death & Respawn**

  * On being eliminated, a player is temporarily removed from active play
  * Respawn occurs after a cooldown timer (default 5 minutes)
  * While waiting, eliminated players can still scan the map to gather intel

---

## Architecture Overview

Orbital uses an **authoritative server model**.
All combat resolution, timing, validation, and cooldown logic runs **server-side**.

### High-Level Components

* **Client**

  * Next.js (App Router)
  * PWA-ready
  * Uses Geolocation API
  * Receives push notifications

* **Game Server**

  * Node.js 20+
  * Hono (HTTP API)
  * Redis (live geospatial state)
  * Firebase Admin SDK (auth, persistence, notifications)

* **Infrastructure**

  * Redis (GEO + ephemeral game state)
  * Firebase Authentication
  * Firestore (persistent / last-known data)
  * Firebase Cloud Messaging (player notifications)
  * Docker Compose for local development

This keeps gameplay fast, cheap, and scalable while preserving persistence where it matters.

---

## Data Flow Summary

### Location Updates

```
Client -> REST
       -> Game Server
       -> Redis GEO (authoritative live position)
       -> Firestore (throttled last-known snapshot)
```

* Server validates:

  * Movement speed
  * Teleporting
  * Accuracy thresholds
* Redis holds the current “truth” for gameplay

---

### Radar Scan

```
Client -> POST /scan
Server -> Redis GEO radius query
Server -> Return scan results to scanner
Server -> FCM notifications to scanned players
```

---

### Orbital Strike

```
Client -> POST /attack
Server -> Redis GEO radius query
Server -> Start charge timer
Server -> FCM warnings to players in kill zone
Server -> Resolve strike (kill or shield reflect)
Server -> FCM outcome notifications
```

---

## Project Structure

```
.
├── client                    # Next.js frontend
│   ├── app
│   ├── public
│   └── README.md
│
├── game-server               # Authoritative backend
│   ├── src
│   │   ├── index.ts          # Hono app entry
│   │   ├── firebase.ts       # Firebase admin init
│   │   ├── middlewares
│   │   │   └── authenticate.ts
│   │   ├── helpers
│   │   │   └── getgeoqueries.ts
│   │   └── models
│   │       └── player.ts
│   ├── Dockerfile
│   └── README.md
│
├── docker-compose.yml        # Redis + game server
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

### Last Known State (Snapshot)

```
players/{playerId}/live
  lat: number
  lng: number
  geohash: string
  updatedAt: timestamp
  alive: boolean
```

> Firestore is **not** used for real-time position streaming or proximity checks.

---

## Notifications (Pub/Sub)

All player-facing events are delivered via **Firebase Cloud Messaging**:

* You have been spotted
* Orbital strike charging
* Orbital strike impact
* Shield parry
* Elimination notice

Clients subscribe to:

* Per-player topics
* Area-based topics (geohash prefix)
* Global announcements

---

## Anti-Abuse Measures (MVP)

* Server-enforced cooldowns
* Redis-side authoritative positions
* Speed and teleport detection
* Accuracy threshold checks
* No client-trusted combat logic
* Rate-limited scan and attack endpoints

---

## Getting Started (Local Dev)

### Prerequisites

* Docker + Docker Compose
* Node.js 20+

### Environment Variables

```
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY=
```

### Run Everything

```
docker-compose up --build
```

---

## MVP Scope

**Included**

* Single building or campus
* Anonymous authentication
* One weapon type
* Manual scanning
* Redis-backed live gameplay

**Not Included**

* Teams or factions
* In-app purchases
* Persistent minimap
* Matchmaking
* Multi-region support

---

## Future Improvements

* Additional orbital weapons with unique charge/radius profiles
* Advanced GPS spoof detection
* Factions, alliances, and betrayal mechanics
* Heatmaps, safe zones, and deception tools
* Replay and strike history visualization
* Location-locked superweapons

---

## Design Philosophy

Orbital is designed around:

* Delayed consequences
* Psychological pressure
* Real-world movement
* Imperfect information

The game is intentionally asymmetric, slow-burning, and social.
