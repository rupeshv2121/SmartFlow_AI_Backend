# SmartFlow AI - Intelligent Traffic and Emergency Grid

---

## 📋 Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Architecture](#architecture)
- [Technology Stack](#technology-stack)
- [Getting Started](#getting-started)
- [API Reference](#api-reference)
- [Real-time Events](#real-time-events)
- [Integration Guide](#integration-guide)
- [Development](#development)
- [Project Structure](#project-structure)
- [Performance Optimization](#performance-optimization)
- [Production Deployment](#production-deployment)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

**SmartFlow AI Backend** is a high-performance Express + TypeScript server designed for the SmartFlow AI Intelligent Traffic and Emergency Grid, part of the India Innovate Hackathon project. The backend serves as the central orchestration hub for:

- **AI-powered traffic analysis** from YOLO object detection models
- **Real-time traffic data ingestion** from multiple camera feeds
- **Dynamic traffic signal optimization** using intelligent algorithms
- **Emergency vehicle green corridor management**
- **Live dashboard metrics** with WebSocket updates
- **Traffic density analytics** and predictive insights

The system processes vehicle detection data from 4 camera intersections, maintains an in-memory traffic state store, calculates optimal signal timings, and activates emergency corridors when ambulances are detected.

---

## ✨ Key Features

### 🚦 Traffic Management
- **Real-time Vehicle Detection Processing** - Ingest and process YOLO detection results
- **Multi-Intersection Monitoring** - Track traffic across multiple road intersections
- **Dynamic Signal Timing** - Adaptive green/yellow/red phase calculations based on traffic density
- **Congestion Analytics** - Real-time congestion level monitoring and historical trends
- **Traffic Density Classification** - Automatic low/medium/high density categorization

### 🚨 Emergency Vehicle System
- **Automated Emergency Detection** - Detect ambulances from AI models
- **Green Corridor Activation** - Automatically create priority routes for emergency vehicles
- **Route Management** - Track emergency vehicle paths through intersections
- **Priority-based Scheduling** - Configure priority for different emergency types

### 📊 Analytics & Monitoring
- **Live Dashboard Statistics** - Total vehicles, active intersections, congested roads
- **Historical Traffic Data** - Last 5 hrs rolling window of traffic patterns
- **Vehicle Type Classification** - Track cars, bikes, buses, and emergency vehicles
- **Hourly Congestion Trends** - Analyze peak hours and traffic patterns

### 🔧 System Controls
- **Settings Management** - Configure AI model parameters, alert thresholds, traffic controls
- **AI Confidence Tuning** - Adjust detection confidence threshold (0.5-0.99)
- **Alert Configuration** - Customize congestion and emergency alert settings
- **Reset to Defaults** - Restore factory settings

### 🔌 Real-time Communication
- **Socket.io Integration** - WebSocket-based real-time updates
- **Event Broadcasting** - Push updates for roads, intersections, signals, emergencies
- **Client Synchronization** - Send initial data snapshot on connection

---

## 🏗 Architecture

### High-Level System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                     Frontend (React)                            │
│                   & green-corridor-sim                          │
└───────────────────────────┬─────────────────────────────────────┘
					 		│ HTTP/Socket.io
					 		▼
┌────────────────────────────────────────────────────────────────┐
│                SmartFlow AI Backend (Express + TypeScript)     │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  REST API Routes                                         │  │
│  │  ├── /api/ai            - AI model integration           │  │
│  │  ├── /api/ingest        - Data ingestion                 │  │
│  │  ├── /api/traffic       - Traffic analytics              │  │
│  │  ├── /api/signals       - Signal timing                  │  │
│  │  ├── /api/emergency     - Emergency management           │  │
│  │  ├── /api/settings      - System configuration           │  │
│  │  └── /api/health        - Health checks                  │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Core Services                                           │  │
│  │  ├── Traffic Light Algorithm - Dynamic timing calc.      │  │
│  │  ├── Green Corridor Service - Emergency routing          │  │
│  │  ├── Traffic Store - In-memory state management          │  │
│  │  └── Settings Store - System configuration               │  │
│  └──────────────────────────────────────────────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Socket.io Server - Real-time event broadcasting         │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬────────────────────────────────┘
					 			│ HTTP API
					 			▼
┌─────────────────────────────────────────────────────────────────┐
│                 SmartFlow AI Model Service (FastAPI)            │
│                       YOLO Object Detection                     │
└─────────────────────────────────────────────────────────────────┘
```
 
### Data Flow

1. **Detection Pipeline**
   - Camera feeds → YOLO Model → Detection results
   - POST `/api/ai/vehicle-detection` → Traffic Store update
   - Real-time Socket.io broadcast → Frontend updates

2. **Signal Optimization**
   - Traffic Store → Traffic Light Algorithm → Optimal timings
   - GET `/api/signal-timing` → Frontend displays recommendations
   - Dynamic adjustment based on vehicle density

3. **Emergency Corridor**
   - Emergency vehicle detected → Traffic Store
   - Green Corridor Service activates → Signal overrides
   - Socket.io alert → Dashboard notifications

---

## 🛠 Technology Stack

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Runtime** | Node.js | 18+ | JavaScript runtime |
| **Framework** | Express | 5.0 | Web application framework |
| **Language** | TypeScript | 5.6 | Type-safe development |
| **Real-time** | Socket.io | 4.8.3 | WebSocket communication |
| **Validation** | Zod | 3.25.76 | Schema validation |
| **Build Tool** | esbuild | 0.27.3 | Fast bundling |
| **Dev Server** | tsx | 4.20.6 | TypeScript execution |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18 or higher
- **npm** or **yarn** package manager
- **Git** for version control

### Installation

1. **Clone the repository**

```bash
git clone <repository-url>
cd SmartFlow_AI_Backend
```

2. **Install dependencies**

```bash
npm install
```

3. **Configure environment variables**

Create a `.env` file in the root directory:

```env
PORT=3000
NODE_ENV=development
CORS_ORIGIN=http://localhost:5173,http://localhost:3000
```

4. **Start development server**

```bash
npm run dev
npm run dev
```

The server will start at `http://localhost:3000`

### Quick Test

```bash
# Health check
curl http://localhost:3000/api/health

# Get dashboard stats
curl http://localhost:3000/api/dashboard-stats

# Get signal timing
curl http://localhost:3000/api/signal-timing
```

---

## 📡 API Reference

All endpoints are mounted under `/api` prefix.

### AI Model Integration

#### POST `/api/ai/vehicle-detection`
Receive vehicle detection data from YOLO model.

**Request Body:**
```json
{
  "intersectionId": "int-001",
  "roadId": "road-1",
  "roadName": "Main Street North",
  "detections": [
    {
      "id": "det-001",
      "type": "car",
      "confidence": 0.92,
      "speed": 28.5,
      "bbox": [120, 340, 280, 480]
    },
    {
      "id": "det-002",
      "type": "bus",
      "confidence": 0.88,
      "speed": 15.2
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "roadId": "road-1",
  "vehicleCount": 2,
  "density": "medium",
  "emergencyVehiclesDetected": 0
}
```

#### POST `/api/ai/intersection-update`
Send aggregated intersection data.

**Request Body:**
```json
{
  "intersectionId": "int-001",
  "intersectionName": "Main & Cross Junction",
  "totalVehicles": 48,
  "congestionLevel": 67.5,
  "roads": [
    {
      "roadId": "road-1",
      "roadName": "Main Street North",
      "vehicleCount": 15,
      "averageSpeed": 25.3,
      "density": "medium"
    }
  ],
  "timestamp": "2026-03-27T10:30:00Z"
}
```

#### POST `/api/ai/emergency-vehicle`
Report emergency vehicle detection.

**Request Body:**
```json
{
  "vehicleId": "AMB-2047",
  "type": "ambulance",
  "currentIntersection": "int-001",
  "route": ["int-001", "int-002", "hospital"],
  "priority": 5,
  "detectedAt": "2026-03-27T10:30:00Z"
}
```

#### DELETE `/api/ai/emergency-vehicle/:vehicleId`
Remove emergency vehicle when it reaches destination.

#### GET `/api/ai/status`
Get current AI system status.

**Response:**
```json
{
  "intersections": 4,
  "roads": 16,
  "signals": 4,
  "emergencyVehicles": 1,
  "activeCorridors": 1,
  "lastUpdate": "2026-03-27T10:30:00Z"
}
```

### Data Ingestion

#### POST `/api/ingest/intersection`
Ingest complete intersection payload with multiple roads.

#### POST `/api/ingest/road`
Update single road data.

#### POST `/api/ingest/emergency-vehicle`
Ingest emergency vehicle data.

#### DELETE `/api/ingest/emergency-vehicle/:vehicleId`
Remove emergency vehicle.

#### POST `/api/ingest/signal`
Update signal state (phase, timing).

#### POST `/api/ingest/batch`
Batch upload multiple data points in single request.

**Request Body:**
```json
{
  "intersections": [...],
  "roads": [...],
  "signals": [...],
  "emergencyVehicles": [...]
}
```

#### GET `/api/ingest/status`
Get ingestion statistics.

### Traffic Analytics

#### GET `/api/traffic-density`
Get current traffic density for all roads.

**Response:**
```json
{
  "roads": [
    {
      "id": "road-1",
      "name": "Main Street North",
      "density": "medium",
      "vehicleCount": 32,
      "speed": 28.5
    }
  ],
  "timestamp": "2026-03-27T10:30:00Z"
}
```

#### GET `/api/traffic-density/history`
Get historical traffic data (last 30 minutes).

**Response:**
```json
{
  "data": [
    {
      "time": "10:00",
      "vehicles": 127,
      "congestion": 65
    }
  ]
}
```

#### GET `/api/vehicle-counts`
Get vehicle counts by type.

**Response:**
```json
{
  "cars": 85,
  "bikes": 25,
  "buses": 8,
  "trucks": 12,
  "total": 130,
  "timestamp": "2026-03-27T10:30:00Z"
}
```

#### GET `/api/dashboard-stats`
Get dashboard statistics.

**Response:**
```json
{
  "totalVehicles": 127,
  "activeIntersections": 4,
  "congestedRoads": 2,
  "emergencyAlerts": 1,
  "avgSpeed": 28.4,
  "systemStatus": "operational"
}
```

#### GET `/api/road-density`
Get road density mapping.

**Response:**
```json
{
  "cells": [
    {
      "x": 0,
      "y": 0,
      "value": 0.75,
      "zone": "Downtown"
    }
  ],
  "maxValue": 1.0
}
```

### Signal Control

#### GET `/api/signal-timing`
Get current and recommended signal timings.

**Response:**
```json
{
  "signals": [
    {
      "id": "signal-1",
      "intersection": "Main Junction",
      "vehicles": 32,
      "density": "medium",
      "greenTime": 45,
      "currentPhase": "green",
      "phaseElapsed": 23,
      "cycleTime": 75
    }
  ],
  "timestamp": "2026-03-27T10:30:00Z"
}
```

#### GET `/api/congestion-analytics`
Get per-intersection congestion analytics.

**Response:**
```json
{
  "data": [
    {
      "intersection": "Main Junction",
      "congestion": 67.5,
      "vehicles": 48,
      "avgSpeed": 22.3
    }
  ],
  "hourlyTrend": [
    {
      "hour": "07:00",
      "congestion": 85,
      "throughput": 650
    }
  ]
}
```

### Emergency Management

#### GET `/api/emergency-events`
Get recent emergency events.

**Response:**
```json
{
  "events": [
    {
      "id": "evt-001",
      "type": "Ambulance",
      "route": "Signal A → Signal B → Hospital",
      "timestamp": "2026-03-27T10:28:00Z",
      "duration": 142,
      "status": "active",
      "vehicleId": "AMB-2047"
    }
  ],
  "recentCount": 1
}
```

#### GET `/api/emergency-corridor/active`
Get active emergency corridor information.

**Response:**
```json
{
  "active": true,
  "corridorId": "corridor-2047",
  "route": ["Signal A", "Signal B", "Signal C", "Hospital"],
  "signals": [
    {
      "signalId": "sig-a",
      "intersection": "Signal A - North/Central",
      "status": "green"
    }
  ],
  "vehicleType": "Ambulance",
  "estimatedClearTime": 45
}
```

### System Settings

#### GET `/api/settings`
Get all system settings.

**Response:**
```json
{
  "success": true,
  "data": {
    "aiModel": {
      "enabled": true,
      "confidenceThreshold": 0.7,
      "detectionInterval": 1000
    },
    "alerts": {
      "congestionThreshold": 75,
      "emergencyAlerts": true
    },
    "trafficControl": {
      "autoOptimize": true,
      "minGreenTime": 20,
      "maxGreenTime": 90
    },
    "display": {
      "refreshRate": 2000,
      "showDetections": true
    }
  },
  "timestamp": "2026-03-27T10:30:00Z"
}
```

#### PUT `/api/settings`
Update system settings.

**Request Body:**
```json
{
  "aiModel": {
    "confidenceThreshold": 0.75
  },
  "alerts": {
    "congestionThreshold": 80
  }
}
```

#### GET `/api/settings/ai`
Get AI model settings only.

#### GET `/api/settings/alerts`
Get alert configuration.

#### GET `/api/settings/traffic`
Get traffic control settings.

#### GET `/api/settings/display`
Get display preferences.

#### POST `/api/settings/reset`
Reset all settings to factory defaults.

#### PUT `/api/settings/ai/confidence`
Update AI model confidence threshold.

**Request Body:**
```json
{
  "confidenceThreshold": 0.75
}
```

### Health Check

#### GET `/api/health`
Server health status.

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-03-27T10:30:00Z"
}
```

---

## 🔄 Real-time Events

The backend uses Socket.io for real-time bidirectional communication.

### Server-to-Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `initial-data` | `{ intersections, roads, signals, emergencyVehicles, dashboardStats }` | Sent on client connection with complete state snapshot |
| `road-updated` | `RoadData` | Emitted when road traffic data changes |
| `intersection-updated` | `IntersectionData` | Emitted when intersection data updates |
| `dashboard-stats` | `DashboardStats` | Real-time dashboard statistics |
| `emergency-vehicle-detected` | `{ vehicleId, type, currentIntersection, priority, timestamp }` | Emergency vehicle detection alert |
| `emergency-vehicle-cleared` | `{ vehicleId }` | Emergency vehicle completed route |
| `settings-updated` | `SystemSettings` | System settings changed |

### Client-to-Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `request-intersection` | `intersectionId: string` | Request specific intersection data |
| `request-road` | `roadId: string` | Request specific road data |

### Connection Example

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to SmartFlow Backend');
});

socket.on('initial-data', (data) => {
  console.log('Initial state:', data);
});

socket.on('road-updated', (roadData) => {
  console.log('Road updated:', roadData);
});

socket.on('emergency-vehicle-detected', (alert) => {
  console.log('🚨 Emergency vehicle detected:', alert);
});
```
## 🔄 Real-time Events

The backend uses Socket.io for real-time bidirectional communication.

### Server-to-Client Events

| Event | Payload | Description |
|-------|---------|-------------|
| `initial-data` | `{ intersections, roads, signals, emergencyVehicles, dashboardStats }` | Sent on client connection with complete state snapshot |
| `road-updated` | `RoadData` | Emitted when road traffic data changes |
| `intersection-updated` | `IntersectionData` | Emitted when intersection data updates |
| `dashboard-stats` | `DashboardStats` | Real-time dashboard statistics |
| `emergency-vehicle-detected` | `{ vehicleId, type, currentIntersection, priority, timestamp }` | Emergency vehicle detection alert |
| `emergency-vehicle-cleared` | `{ vehicleId }` | Emergency vehicle completed route |
| `settings-updated` | `SystemSettings` | System settings changed |

### Client-to-Server Events

| Event | Payload | Description |
|-------|---------|-------------|
| `request-intersection` | `intersectionId: string` | Request specific intersection data |
| `request-road` | `roadId: string` | Request specific road data |

### Connection Example

```typescript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to SmartFlow Backend');
});

socket.on('initial-data', (data) => {
  console.log('Initial state:', data);
});

socket.on('road-updated', (roadData) => {
  console.log('Road updated:', roadData);
});

socket.on('emergency-vehicle-detected', (alert) => {
  console.log('🚨 Emergency vehicle detected:', alert);
});
```

---

## 🔗 Integration Guide

### Integrating with YOLO Detection Service

The backend expects detection data from the SmartFlow AI Model Service (FastAPI on port 8000).

**Step 1:** Capture frame from camera feed
**Step 2:** Send frame to YOLO service (`http://localhost:8000/detect`)
**Step 3:** Forward detection results to backend

```javascript
// Example integration
const detections = await fetch('http://localhost:8000/detect', {
  method: 'POST',
  body: frameData
});

const result = await detections.json();

// Send to backend
await fetch('http://localhost:3000/api/ai/vehicle-detection', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    intersectionId: 'int-001',
    roadId: 'road-1',
    roadName: 'Main Street',
    detections: result.detections
  })
});
```

### Batch Upload Example

For faster synchronization across multiple intersections:

```bash
curl -X POST http://localhost:3000/api/ingest/batch \
  -H "Content-Type: application/json" \
  -d '{
    "intersections": [...],
    "roads": [...],
    "signals": [...]
  }'
```

---

## 💻 Development
## 💻 Development

### Available Scripts
### Available Scripts

```bash
# Development server with hot reload
# Development server with hot reload
npm run dev

# Type checking
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment (development/production) |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (comma-separated) |

### Development Workflow

1. **Edit TypeScript files** in `src/` directory
2. **Hot reload** automatically restarts server (via `tsx`)
3. **Type check** with `npm run typecheck`
4. **Test endpoints** with curl/Postman
5. **Monitor console** for Socket.io connections and API requests

### Code Style Guidelines

- Use **TypeScript** for all new code
- Define **types** in `src/types/ai-models.ts`
- Add **Zod schemas** in `src/lib/api-zod.ts` for validation
- Follow **Express middleware** patterns
- Use **async/await** for asynchronous operations
- Log important events with **ISO timestamps**


# Type checking
npm run typecheck

# Build for production
npm run build

# Start production server
npm start
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port |
| `NODE_ENV` | `development` | Environment (development/production) |
| `CORS_ORIGIN` | `*` | Allowed CORS origins (comma-separated) |

### Development Workflow

1. **Edit TypeScript files** in `src/` directory
2. **Hot reload** automatically restarts server (via `tsx`)
3. **Type check** with `npm run typecheck`
4. **Test endpoints** with curl/Postman
5. **Monitor console** for Socket.io connections and API requests

### Code Style Guidelines

- Use **TypeScript** for all new code
- Define **types** in `src/types/ai-models.ts`
- Add **Zod schemas** in `src/lib/api-zod.ts` for validation
- Follow **Express middleware** patterns
- Use **async/await** for asynchronous operations
- Log important events with **ISO timestamps**

---

## 📁 Project Structure

```
SmartFlow_AI_Backend/
├── src/
│   ├── index.ts                          # Server entry point
│   ├── app.ts                            # Express app configuration
│   │
│   ├── routes/                           # API route handlers
│   │   ├── index.ts                      # Route aggregation
│   │   ├── ai-input.ts                   # /api/ai/* - AI model integration
│   │   ├── data-ingestion.ts             # /api/ingest/* - Data ingestion
│   │   ├── traffic.ts                    # /api/traffic-* - Traffic analytics
│   │   ├── signals.ts                    # /api/signal-* - Signal control
│   │   ├── emergency.ts                  # /api/emergency-* - Emergency management
│   │   ├── intersections.ts              # Intersection endpoints
│   │   ├── settings.ts                   # /api/settings/* - System settings
│   │   └── health.ts                     # /api/health - Health check
│   │
│   ├── services/                         # Business logic
│   │   ├── traffic-light-algorithm.ts    # Dynamic signal timing calculation
│   │   └── green-corridor.ts             # Emergency corridor management
│   │
│   ├── store/                            # In-memory state management
│   │   ├── traffic-store.ts              # Traffic data store
│   │   └── settings-store.ts             # System settings store
│   │
│   ├── lib/                              # Utilities
│   │   ├── socket.ts                     # Socket.io server setup
│   │   └── api-zod.ts                    # Zod validation schemas
│   │
│   └── types/                            # TypeScript type definitions
│       └── ai-models.ts                  # Request/response types
│
├── dist/                                 # Built output (generated)
├── node_modules/                         # Dependencies
├── build.ts                              # esbuild configuration
├── tsconfig.json                         # TypeScript configuration
├── package.json                          # Project metadata
└── README.md                             # This file
```

### Key Components

#### **Traffic Store** (`src/store/traffic-store.ts`)
In-memory storage for:
- Intersections (multi-road junctions)
- Roads (individual traffic lanes)
- Signals (traffic light states)
- Emergency vehicles (active alerts)
- Historical data (5 hrs rolling window)

#### **Traffic Light Algorithm** (`src/services/traffic-light-algorithm.ts`)
Calculates optimal green light duration based on:
- Current vehicle count
- Traffic density (low/medium/high)
- Congestion level
- Historical patterns
- Emergency vehicle priority

#### **Green Corridor Service** (`src/services/green-corridor.ts`)
Manages emergency vehicle routing:
- Activates green corridors for priority vehicles
- Overrides normal signal timing
- Calculates estimated clear time
- Broadcasts real-time alerts

#### **Socket.io Integration** (`src/lib/socket.ts`)
Real-time event system:
- Sends initial data snapshot on connection
- Broadcasts updates to all clients
- Supports client data requests
- Handles disconnections gracefully

---

## ⚡ Performance Optimization

Based on the SmartFlow AI system optimizations:

### Backend Optimizations
- **Frame skipping prevention** - Process detections asynchronously to avoid blocking
- **Reduced payload size** - Image quality reduced from 85% → 60% (70% smaller)
- **Parallel processing** - Independent camera processing in parallel
- **In-memory storage** - Fast read/write operations without database overhead

### Current Performance Metrics
- **Single detection processing**: ~50-75ms (with YOLO at 8000)
- **4 parallel detections**: 100-150ms total (5-8x faster than sequential)
- **WebSocket latency**: <10ms for local connections
- **API response time**: <5ms for cached data

### Recommended Optimizations for Production
1. **Add Redis** - Replace in-memory store for persistence and multi-instance support
2. **Database integration** - Store historical data in PostgreSQL/MongoDB
3. **Caching layer** - Use Redis for frequently accessed endpoints
4. **Load balancing** - Use NGINX or cloud load balancer for scaling
5. **Rate limiting** - Protect API from abuse (express-rate-limit)
6. **Compression** - Enable gzip compression for API responses
7. **CDN integration** - Serve static assets via CDN
## ⚡ Performance Optimization

Based on the SmartFlow AI system optimizations:

### Backend Optimizations
- **Frame skipping prevention** - Process detections asynchronously to avoid blocking
- **Reduced payload size** - Image quality reduced from 85% → 60% (70% smaller)
- **Parallel processing** - Independent camera processing in parallel
- **In-memory storage** - Fast read/write operations without database overhead

### Current Performance Metrics
- **Single detection processing**: ~50-75ms (with YOLO at 8000)
- **4 parallel detections**: 100-150ms total (5-8x faster than sequential)
- **WebSocket latency**: <10ms for local connections
- **API response time**: <5ms for cached data

### Recommended Optimizations for Production
1. **Add Redis** - Replace in-memory store for persistence and multi-instance support
2. **Database integration** - Store historical data in PostgreSQL/MongoDB
3. **Caching layer** - Use Redis for frequently accessed endpoints
4. **Load balancing** - Use NGINX or cloud load balancer for scaling
5. **Rate limiting** - Protect API from abuse (express-rate-limit)
6. **Compression** - Enable gzip compression for API responses
7. **CDN integration** - Serve static assets via CDN

---

## 🚀 Production Deployment

### Build for Production

```bash
npm run build
npm start
```

### Docker Deployment

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY dist ./dist

EXPOSE 3000

CMD ["node", "dist/index.cjs"]
```

```bash
docker build -t smartflow-backend .
docker run -p 3000:3000 smartflow-backend
```

### Environment Setup

```bash
# Production .env
PORT=3000
NODE_ENV=production
CORS_ORIGIN=https://yourdomain.com
```

---

## 🤝 Contributing

We welcome contributions to the SmartFlow AI Backend!

### Contribution Guidelines

1. **Fork the repository** and create a feature branch
   ```bash
   git checkout -b feat/your-feature-name
   ```

2. **Make your changes** following code style guidelines

3. **Run type checking**
   ```bash
   npm run typecheck
   ```

4. **Test your changes** with API calls and Socket.io events

5. **Update documentation** if you change APIs or behavior
   - Update `README.md` with new endpoints
   - Update `src/lib/api-zod.ts` with new schemas
   - Update `src/types/ai-models.ts` with new types

6. **Commit with descriptive messages**
   ```bash
   git commit -m "feat: add vehicle speed analytics endpoint"
   ```

7. **Submit a pull request** with detailed description

### Branch Naming Convention

- `feat/feature-name` - New features
- `fix/bug-description` - Bug fixes
- `docs/update-readme` - Documentation updates
- `refactor/component-name` - Code refactoring
- `perf/optimization-name` - Performance improvements

### Code Review Process

1. All PRs require **type checking** to pass
2. Maintainers will review within **48 hours**
3. Address feedback and **push updates**
4. Once approved, PRs will be **merged to main**

---

<div align="center">

**Built with ❤️ for the India Innovate Hackathon**

[Architecture](#architecture) • [API Reference](#api-reference) • [Getting Started](#getting-started) • [Contributing](#contributing)

</div>
