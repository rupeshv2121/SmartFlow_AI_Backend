# SmartFlow AI Backend

Backend server for the SmartFlow AI Traffic Management System. This repository contains the Express + TypeScript server used for ingesting AI model outputs, maintaining an in-memory traffic store, running traffic-light optimization, and orchestrating green corridors for emergency vehicles.

---

## Quick Start

Install and run locally:

```bash
# From backend/
npm install
npm run dev      # Start development server (nodemon / ts-node)
```

Build for production:

```bash
npm run build
npm start
```

Default server URL: http://localhost:3000

---

## Overview

What this backend does:

- Accepts vehicle/intersection/road/signal data from AI models and ingestion scripts
- Updates an in-memory store (`src/store/traffic-store.ts`) and emits real-time Socket.io events
- Runs a dynamic traffic light optimization algorithm (`src/services/traffic-light-algorithm.ts`)
- Manages green corridors for emergency vehicles (`src/services/green-corridor.ts`)
- Provides REST endpoints and real-time events used by the frontend and integration services

Key project files:

- [src/index.ts](src/index.ts#L1) — server entry point and Socket.io setup
- [src/app.ts](src/app.ts#L1) — express app and middleware
- [src/routes/index.ts](src/routes/index.ts#L1) — route registration
- [src/store/traffic-store.ts](src/store/traffic-store.ts#L1) — in-memory store
- [src/services/traffic-light-algorithm.ts](src/services/traffic-light-algorithm.ts#L1) — timing logic
- [src/services/green-corridor.ts](src/services/green-corridor.ts#L1) — corridor management
- [src/lib/api-zod.ts](src/lib/api-zod.ts#L1) — response schemas
- [src/types/ai-models.ts](src/types/ai-models.ts#L1) — request/response TypeScript types

---

## API Reference (summary)

All endpoints are mounted under `/api`.

### AI Model Integration (`/api/ai`)

- `POST /api/ai/vehicle-detection` — send detection list from object detection model
- `POST /api/ai/intersection-update` — aggregated intersection data
- `POST /api/ai/emergency-vehicle` — report emergency vehicle
- `DELETE /api/ai/emergency-vehicle/:vehicleId` — remove emergency vehicle
- `GET /api/ai/status` — system counts and status

### Data Ingestion (`/api/ingest`)

- `POST /api/ingest/intersection` — intersection payload (with roads array)
- `POST /api/ingest/road` — single road update
- `POST /api/ingest/emergency-vehicle` — emergency ingestion
- `DELETE /api/ingest/emergency-vehicle/:vehicleId` — remove emergency vehicle
- `POST /api/ingest/signal` — update signal state
- `POST /api/ingest/batch` — batch uploads
- `GET /api/ingest/status` — ingestion stats

### Traffic & Dashboard

- `GET /api/traffic-density` — roads with density, vehicleCount, speed
- `GET /api/traffic-density/history` — recent history
- `GET /api/vehicle-counts` — aggregated counts
- `GET /api/dashboard-stats` — dashboard stats
- `GET /api/heatmap` — city heatmap

### Signals & Analytics

- `GET /api/signal-timing` — recommended/current signal timings
- `GET /api/congestion-analytics` — per-intersection analytics

### Emergency

- `GET /api/emergency-events` — recent emergency events
- `GET /api/emergency-corridor/active` — active corridor info

### Settings

- `GET /api/settings` — all settings
- `PUT /api/settings` — update settings
- `GET /api/settings/ai` `GET /api/settings/alerts` `GET /api/settings/traffic` `GET /api/settings/display`
- `POST /api/settings/reset` — reset defaults
- `PUT /api/settings/ai/confidence` — set AI confidence threshold (0.5–0.99)

For full payload examples and guidance, see the Integration section below.

---

## Real-time (Socket.io)

The backend exposes Socket.io events. The Socket.io server is attached in `src/index.ts` and configured in `src/lib/socket.ts`.

- `initial-data` — sent on connect (intersections, roads, signals, emergencyVehicles, dashboardStats)
- `road-updated` — payload: `RoadData`
- `intersection-updated` — payload: `IntersectionData`
- `dashboard-stats` — payload: dashboard stats
- `emergency-vehicle-detected` — payload: emergency info
- `emergency-vehicle-cleared` — payload: `{ vehicleId }`

---

## Integration guide (examples)

Send vehicle detection (example):

```bash
curl -X POST http://localhost:3000/api/ai/vehicle-detection \
	-H "Content-Type: application/json" \
	-d '{"intersectionId":"int-001","roadId":"road-1","detections":[{"id":"d1","type":"car","confidence":0.9,"speed":12}]}'
```

Check signal timing:

```bash
curl http://localhost:3000/api/signal-timing
```

Use `/api/ingest/batch` to push multiple items in a single payload when syncing many intersections.

Time fields: prefer ISO 8601 timestamps; the server coerces them into Date objects.

---

## Development

Prerequisites: Node.js 18+, npm

Install and run locally:

```bash
cd backend
npm install
npm run dev
```

Scripts (see `package.json`):

- `dev` — development server (`tsx ./src/index.ts`)
- `build` — build scripts (`tsx ./build.ts`)
- `start` — run built dist
- `typecheck` — TypeScript check

Environment variables:
- `PORT` — server port (default 3000)

When editing types/schemas, update both `src/types/ai-models.ts` and `src/lib/api-zod.ts`.

---

## Architecture

High-level components:

- Routes: `src/routes/*`
- Store: `src/store/traffic-store.ts` (in-memory)
- Services: `src/services/traffic-light-algorithm.ts`, `src/services/green-corridor.ts`
- Socket: `src/lib/socket.ts`
- Validation: `src/lib/api-zod.ts`

Data flow summary:

1. Ingested payload -> route -> store update
2. Store updates -> historical samples recorded
3. Store/Services emit Socket.io updates
4. Services may update signals or activate corridors

Scaling notes:

- Replace in-memory store with Redis/DB for production
- Use Socket.io Redis adapter for multi-instance deployments
- Protect endpoints with API gateway/auth

---

## Contributing

See contributor guidance:

- Use branches: `feat/..` or `fix/..`
- Run `npm run typecheck` before PRs
- Update docs and Zod schemas when changing APIs

Short checklist for PRs:

1. Ensure TypeScript compiles (`npm run typecheck`)
2. Update `src/lib/api-zod.ts` and `src/types/ai-models.ts` if payloads changed
3. Add tests where applicable
4. Update this README if API or behavior changes

---

## Production considerations

- Persist the store (Redis / DB)
- Add authentication/TLS and rate limiting
- Use a Socket.io adapter for scaling and sticky sessions where necessary

---

## Reference files included

- `src/lib/api-zod.ts` — Zod response schemas
- `src/types/ai-models.ts` — TypeScript payload types
- `src/services/traffic-light-algorithm.ts` — signal timing algorithm
- `src/services/green-corridor.ts` — emergency corridor logic
- `src/store/traffic-store.ts` — in-memory store

---

If you'd like, I can also generate an OpenAPI spec or Postman collection from the routes and Zod schemas.

---

MIT
