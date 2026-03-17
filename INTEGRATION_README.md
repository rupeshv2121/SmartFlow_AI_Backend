# SmartFlow AI Backend - Integration Guide

## Overview

This backend system is designed to integrate with three AI models for intelligent traffic management:

1. **Vehicle Detection Model (YOLOv8)** - Detects and counts vehicles, identifies emergency vehicles
2. **Green Corridor Algorithm** - Creates priority routes for emergency vehicles
3. **Traffic Light Optimization** - Dynamically adjusts signal timings to prevent starvation and optimize flow

## Architecture

```
┌─────────────────┐
│  AI Models      │
│  (YOLOv8, etc.) │
└────────┬────────┘
         │ HTTP POST
         ▼
┌─────────────────────────────┐
│  Backend API Server          │
│  - Express.js                │
│  - Socket.io (Real-time)    │
│  - In-memory Data Store     │
└────────┬────────────────────┘
         │ Socket.io / REST
         ▼
┌─────────────────────────────┐
│  Frontend Dashboard          │
│  - React.js                  │
│  - Real-time Updates         │
└─────────────────────────────┘
```

## Setup and Installation

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

```bash
cd SmartFlow_AI_Backend
npm install
```

### Running the Server

```bash
# Development mode
npm run dev

# Build for production
npm run build
```

The server will start on `http://localhost:3000` by default.

## API Endpoints

### 1. Vehicle Detection Input

**Endpoint:** `POST /api/ai/vehicle-detection`

**Description:** Receive real-time vehicle detection data from YOLO model

**Request Body:**
```json
{
  "intersectionId": "int-a",
  "laneId": "lane-1",
  "laneName": "North Avenue - Lane 1",
  "detections": [
    {
      "id": "vehicle-001",
      "type": "car",
      "x": 120.5,
      "y": 340.2,
      "width": 80,
      "height": 50,
      "confidence": 0.95,
      "lane": "lane-1",
      "speed": 35.2
    },
    {
      "id": "vehicle-002",
      "type": "ambulance",
      "x": 450.3,
      "y": 280.1,
      "width": 100,
      "height": 60,
      "confidence": 0.92,
      "lane": "lane-1",
      "speed": 45.6
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "laneId": "lane-1",
  "vehicleCount": 2,
  "density": "low",
  "emergencyVehiclesDetected": 1
}
```

**Vehicle Types:** `car`, `bus`, `truck`, `bike`, `motorcycle`, `ambulance`, `fire_truck`, `police`

**Density Levels:**
- `low`: 0-7 vehicles
- `medium`: 8-15 vehicles
- `high`: 16+ vehicles

---

### 2. Intersection Update

**Endpoint:** `POST /api/ai/intersection-update`

**Description:** Update complete intersection data including all lanes

**Request Body:**
```json
{
  "intersectionId": "int-a",
  "intersectionName": "Central Plaza Intersection",
  "lanes": [
    {
      "laneId": "lane-1",
      "laneName": "North Approach",
      "vehicleCount": 12,
      "density": "medium",
      "averageSpeed": 28.5,
      "detections": [...],
      "timestamp": "2026-03-17T10:30:00Z"
    }
  ],
  "totalVehicles": 45,
  "congestionLevel": 65,
  "emergencyVehicleDetected": false,
  "timestamp": "2026-03-17T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "intersectionId": "int-a",
  "totalVehicles": 45,
  "congestionLevel": 65
}
```

---

### 3. Emergency Vehicle Detection

**Endpoint:** `POST /api/ai/emergency-vehicle`

**Description:** Report detection of an emergency vehicle

**Request Body:**
```json
{
  "vehicleId": "AMB-2047",
  "type": "ambulance",
  "currentIntersection": "int-a",
  "route": ["int-a", "int-b", "int-c", "int-hospital"],
  "priority": 5,
  "detectedAt": "2026-03-17T10:30:00Z"
}
```

**Response:**
```json
{
  "success": true,
  "vehicleId": "AMB-2047",
  "corridorActivated": true
}
```

**Priority Levels:** 1 (lowest) to 5 (highest). Priority 4+ automatically activates green corridor.

---

### 4. Remove Emergency Vehicle

**Endpoint:** `DELETE /api/ai/emergency-vehicle/:vehicleId`

**Description:** Remove emergency vehicle when it reaches destination

**Response:**
```json
{
  "success": true,
  "vehicleId": "AMB-2047"
}
```

---

### 5. Get System Status

**Endpoint:** `GET /api/ai/status`

**Description:** Get current system status and data availability

**Response:**
```json
{
  "intersections": 12,
  "lanes": 48,
  "signals": 12,
  "emergencyVehicles": 1,
  "activeCorridors": 1,
  "lastUpdate": "2026-03-17T10:30:00Z"
}
```

---

## Frontend API Endpoints

These endpoints are consumed by the frontend dashboard:

- `GET /api/healthz` - Health check
- `GET /api/traffic-density` - Current traffic density
- `GET /api/traffic-density/history` - Historical traffic data
- `GET /api/vehicle-counts` - Vehicle counts by type
- `GET /api/dashboard-stats` - Dashboard summary
- `GET /api/signal-timing` - Traffic signal timings
- `GET /api/congestion-analytics` - Congestion analysis
- `GET /api/emergency-events` - Emergency events list
- `GET /api/emergency-corridor/active` - Active green corridors
- `GET /api/intersections` - All intersections for map
- `GET /api/intersection-video/:id` - Intersection video feed info
- `GET /api/lane-density` - Lane-by-lane density
- `GET /api/heatmap` - City congestion heatmap

---

## Real-time Updates (Socket.io)

The backend uses Socket.io for real-time updates to the frontend.

### Client Connection

```javascript
import io from 'socket.io-client';

const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected to backend');
});

// Receive initial data
socket.on('initial-data', (data) => {
  console.log('Initial data:', data);
});

// Real-time updates
socket.on('lane-updated', (laneData) => {
  console.log('Lane updated:', laneData);
});

socket.on('intersection-updated', (intersectionData) => {
  console.log('Intersection updated:', intersectionData);
});

socket.on('emergency-vehicle-detected', (emergencyData) => {
  console.log('Emergency vehicle detected!', emergencyData);
});

socket.on('dashboard-stats', (stats) => {
  console.log('Dashboard stats updated:', stats);
});
```

### Events Emitted by Server

1. **`initial-data`** - Sent on connection with current state
2. **`lane-updated`** - When a lane receives new detection data
3. **`intersection-updated`** - When intersection data is updated
4. **`emergency-vehicle-detected`** - When emergency vehicle is detected
5. **`emergency-vehicle-cleared`** - When emergency vehicle is removed
6. **`dashboard-stats`** - Updated dashboard statistics

---

## Integration with AI Models

### Model 1: Vehicle Detection (YOLOv8)

Your YOLO model should:

1. Process video frames from intersection cameras
2. Detect vehicles and classify types
3. Calculate bounding boxes and confidence scores
4. Estimate vehicle speed (optional)
5. Send data to backend every 1-2 seconds

**Example Python Integration:**

```python
import requests
import cv2
from ultralytics import YOLO

# Load YOLO model
model = YOLO('yolov8n.pt')

# Backend URL
BACKEND_URL = 'http://localhost:3000/api/ai'

def process_frame(frame, intersection_id, lane_id):
    # Run detection
    results = model(frame)

    detections = []
    for r in results:
        boxes = r.boxes
        for box in boxes:
            detection = {
                'id': f'vehicle-{hash(box)}',
                'type': model.names[int(box.cls)],
                'x': float(box.xyxy[0][0]),
                'y': float(box.xyxy[0][1]),
                'width': float(box.xyxy[0][2] - box.xyxy[0][0]),
                'height': float(box.xyxy[0][3] - box.xyxy[0][1]),
                'confidence': float(box.conf),
                'lane': lane_id,
                'speed': estimate_speed(box)  # Implement speed estimation
            }
            detections.append(detection)

    # Send to backend
    payload = {
        'intersectionId': intersection_id,
        'laneId': lane_id,
        'laneName': f'Lane {lane_id}',
        'detections': detections
    }

    response = requests.post(
        f'{BACKEND_URL}/vehicle-detection',
        json=payload
    )

    return response.json()
```

---

### Model 2: Green Corridor Mechanism

The backend automatically handles green corridor activation:

1. When an emergency vehicle is detected (ambulance, fire_truck, police)
2. A corridor is automatically created
3. All signals along the route turn green
4. Frontend shows the active corridor in real-time

**Manual Corridor Activation:**

```python
import requests

def activate_emergency_corridor(vehicle_id, vehicle_type, route):
    payload = {
        'vehicleId': vehicle_id,
        'type': vehicle_type,  # 'ambulance', 'fire_truck', or 'police'
        'currentIntersection': route[0],
        'route': route,
        'priority': 5
    }

    response = requests.post(
        'http://localhost:3000/api/ai/emergency-vehicle',
        json=payload
    )

    return response.json()

# Example usage
activate_emergency_corridor(
    vehicle_id='AMB-2047',
    vehicle_type='ambulance',
    route=['int-a', 'int-b', 'int-c', 'int-hospital']
)
```

---

### Model 3: Traffic Light Algorithm

The traffic light algorithm runs automatically in the background:

**Features:**
- **Dynamic Timing:** Adjusts green time based on vehicle count and density
- **Starvation Prevention:** Ensures no lane waits too long
- **Emergency Override:** Automatically prioritizes emergency corridors
- **Optimization:** Runs every 30 seconds to adjust timings

**Algorithm Logic:**
```
Green Time = Base Time × Vehicle Multiplier

Base Time:
- High density: 60 seconds
- Medium density: 40 seconds
- Low density: 20 seconds

Vehicle Multiplier: min(vehicleCount / 50, 1.5)

Constraints:
- Min green time: 15 seconds
- Max green time: 90 seconds
- Starvation threshold: 5 minutes
```

**Accessing Algorithm Recommendations:**

```python
import requests

# Get current signal timings (includes algorithm recommendations)
response = requests.get('http://localhost:3000/api/signal-timing')
signals = response.json()['signals']

for signal in signals:
    print(f"Signal {signal['id']}: {signal['greenTime']}s green time")
```

---

## Data Store

The backend uses an in-memory data store (can be replaced with Redis for production):

- **Intersections:** Current state of all intersections
- **Lanes:** Real-time lane data with detections
- **Signals:** Traffic signal states and timings
- **Emergency Vehicles:** Active emergency vehicles
- **Historical Data:** Last 30 minutes of traffic data

**Data Cleanup:**
- Stale data (>5 minutes old) is automatically removed
- Historical data limited to 30 minutes
- Emergency vehicle records kept for 1 hour after completion

---

## Testing

### Test Vehicle Detection Endpoint

```bash
curl -X POST http://localhost:3000/api/ai/vehicle-detection \
  -H "Content-Type: application/json" \
  -d '{
    "intersectionId": "int-a",
    "laneId": "lane-1",
    "laneName": "Test Lane",
    "detections": [
      {
        "id": "test-001",
        "type": "car",
        "x": 100,
        "y": 200,
        "width": 80,
        "height": 50,
        "confidence": 0.95,
        "speed": 35
      }
    ]
  }'
```

### Test Emergency Vehicle

```bash
curl -X POST http://localhost:3000/api/ai/emergency-vehicle \
  -H "Content-Type: application/json" \
  -d '{
    "vehicleId": "TEST-AMB-001",
    "type": "ambulance",
    "currentIntersection": "int-a",
    "route": ["int-a", "int-b", "int-hospital"],
    "priority": 5
  }'
```

---

## Configuration

### Environment Variables

Create a `.env` file:

```env
PORT=3000
NODE_ENV=development

# CORS (for production)
CORS_ORIGIN=http://localhost:5173

# Socket.io
SOCKET_IO_PATH=/socket.io
```

### Production Deployment

For production, consider:

1. **Redis:** Replace in-memory store with Redis
2. **Database:** Add PostgreSQL/MongoDB for persistence
3. **Load Balancing:** Use PM2 or Docker Swarm
4. **Monitoring:** Add logging (Winston) and monitoring (Prometheus)
5. **Security:** Add authentication, rate limiting, HTTPS

---

## Troubleshooting

### No Data Showing

- Check if AI models are sending data to `/api/ai/vehicle-detection`
- Verify network connectivity between AI model and backend
- Check backend logs for errors

### Emergency Corridor Not Activating

- Ensure vehicle type is `ambulance`, `fire_truck`, or `police`
- Check priority is >= 4
- Verify route contains valid intersection IDs

### Socket.io Connection Issues

- Check CORS configuration
- Verify frontend is connecting to correct backend URL
- Check firewall settings

---

## Support

For issues or questions, refer to the main project documentation or contact the development team.

---

## License

MIT License - See main project README for details.
