# SmartFlow AI Backend - Quick Reference

## 🚀 What's Been Built

Your backend is now fully set up to receive data from your 3 AI models:

### 1. **Vehicle Detection Model** (YOLOv8)
- **Endpoint:** `POST /api/ai/vehicle-detection`
- Receives vehicle detections from cameras
- Automatically counts vehicles per lane
- Detects emergency vehicles (ambulance, fire truck, police)
- Calculates density (low/medium/high)

### 2. **Green Corridor Mechanism**
- **Endpoint:** `POST /api/ai/emergency-vehicle`
- Automatically activates when emergency vehicle detected
- Creates priority green route
- Overrides normal traffic signals
- Auto-deactivates after vehicle passes

### 3. **Traffic Light Algorithm**
- **Runs automatically** - no API calls needed
- Dynamically adjusts green times based on traffic
- Prevents starvation (min 5 minutes between greens)
- Optimizes every 30 seconds
- View results: `GET /api/signal-timing`

---

## 📡 How to Send Data from Your AI Models

### Python Example (YOLO)

```python
import requests

# Your backend URL
BACKEND = "http://localhost:3000/api/ai"

# Send vehicle detections
def send_detections(intersection_id, lane_id, detections):
    payload = {
        "intersectionId": intersection_id,
        "laneId": lane_id,
        "laneName": f"Lane {lane_id}",
        "detections": detections  # List of vehicle objects
    }

    response = requests.post(
        f"{BACKEND}/vehicle-detection",
        json=payload
    )

    return response.json()

# Example detection
detections = [
    {
        "id": "v001",
        "type": "car",           # or "ambulance", "bus", "truck", etc.
        "x": 120.5,
        "y": 340.2,
        "width": 80,
        "height": 50,
        "confidence": 0.95,
        "speed": 35.2            # optional
    }
]

result = send_detections("int-a", "lane-1", detections)
print(result)
```

### Report Emergency Vehicle

```python
# When you detect an ambulance/fire truck/police
def report_emergency(vehicle_id, vehicle_type, current_intersection, route):
    payload = {
        "vehicleId": vehicle_id,
        "type": vehicle_type,     # "ambulance", "fire_truck", "police"
        "currentIntersection": current_intersection,
        "route": route,           # List of intersections
        "priority": 5             # 1-5, where 5 is highest
    }

    response = requests.post(
        f"{BACKEND}/emergency-vehicle",
        json=payload
    )

    return response.json()

# Example
report_emergency(
    vehicle_id="AMB-2047",
    vehicle_type="ambulance",
    current_intersection="int-a",
    route=["int-a", "int-b", "int-c", "int-hospital"]
)
```

---

## 🎯 Testing Your Setup

### 1. Start the Backend

```bash
cd SmartFlow_AI_Backend
npm install
npm run dev
```

Server will run on `http://localhost:3000`

### 2. Test with cURL

```bash
# Test health check
curl http://localhost:3000/api/healthz

# Test vehicle detection
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

# Check system status
curl http://localhost:3000/api/ai/status
```

### 3. Test with Python

```python
import requests

# Test connection
response = requests.get("http://localhost:3000/api/healthz")
print(response.json())  # Should print: {"status": "ok"}
```

---

## 📊 Frontend Integration

The frontend automatically receives real-time updates via Socket.io.

**What gets updated automatically:**
- Traffic density changes
- Vehicle counts
- Emergency vehicle alerts
- Signal timing changes
- Dashboard statistics

**No additional work needed** - just start both backend and frontend:

```bash
# Terminal 1: Backend
cd SmartFlow_AI_Backend
npm run dev

# Terminal 2: Frontend
cd SmartFlow_AI-Intelligent_Traffic_Emergency_Grid-India_Innovate_Hackathon
npm run dev
```

Open your browser to see live updates!

---

## 🗂️ File Structure Created

```
SmartFlow_AI_Backend/
├── src/
│   ├── routes/
│   │   ├── ai-input.ts          ✅ NEW - AI model endpoints
│   │   ├── traffic.ts           ✅ Updated with real data
│   │   ├── signals.ts           ✅ Updated with algorithm
│   │   ├── emergency.ts         ✅ Updated with corridors
│   │   └── index.ts             ✅ Added AI routes
│   ├── services/
│   │   ├── traffic-light-algorithm.ts  ✅ NEW - Dynamic timing
│   │   └── green-corridor.ts            ✅ NEW - Emergency routing
│   ├── store/
│   │   └── traffic-store.ts    ✅ NEW - Data management
│   ├── types/
│   │   └── ai-models.ts        ✅ NEW - TypeScript types
│   ├── lib/
│   │   └── socket.ts           ✅ NEW - Real-time updates
│   ├── index.ts                ✅ Updated with Socket.io
│   └── app.ts                  (unchanged)
├── INTEGRATION_README.md       ✅ NEW - Complete guide
├── README.md                   ✅ NEW - Quick start
└── package.json                ✅ Updated dependencies
```

---

## 🎨 Algorithm Details

### Traffic Light Optimization
- **Dynamic Green Time:** 20-90 seconds based on density
- **Prevents Starvation:** Forces green after 5 minutes
- **Emergency Override:** Prioritizes ambulances/fire/police
- **Auto-optimization:** Runs every 30 seconds

### Density Calculation
- **Low:** 0-7 vehicles → 20s green time
- **Medium:** 8-15 vehicles → 40s green time
- **High:** 16+ vehicles → 60s green time

### Green Corridor
- Activates automatically when emergency vehicle detected
- All signals on route turn green
- Estimated clear time: ~60s per intersection
- Auto-deactivates when vehicle passes

---

## 🔗 Next Steps

1. **Integrate YOLO Model**
   - Use the Python examples above
   - Send detections every 1-2 seconds
   - Map vehicle types correctly

2. **Test Emergency Detection**
   - When YOLO detects ambulance/fire truck/police
   - Call `/api/ai/emergency-vehicle` endpoint
   - Watch frontend show green corridor

3. **Monitor Dashboard**
   - Start both backend and frontend
   - Watch real-time updates as you send data
   - Check traffic light timings adapt automatically

4. **Production Ready** (Optional)
   - Add Redis for distributed systems
   - Add database for persistence
   - Add authentication
   - See INTEGRATION_README.md for details

---

## 📞 API Summary

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/ai/vehicle-detection` | POST | Send vehicle detections |
| `/api/ai/intersection-update` | POST | Update full intersection |
| `/api/ai/emergency-vehicle` | POST | Report emergency vehicle |
| `/api/ai/emergency-vehicle/:id` | DELETE | Remove emergency vehicle |
| `/api/ai/status` | GET | Get system status |
| `/api/traffic-density` | GET | Current traffic (frontend) |
| `/api/signal-timing` | GET | Signal timings (frontend) |
| `/api/dashboard-stats` | GET | Dashboard data (frontend) |

---

## ✅ What Works Now

- ✅ Backend receives vehicle detection data
- ✅ Counts vehicles per lane automatically
- ✅ Calculates traffic density
- ✅ Detects emergency vehicles
- ✅ Creates green corridors automatically
- ✅ Optimizes traffic light timings
- ✅ Prevents lane starvation
- ✅ Real-time updates to frontend
- ✅ Mock data as fallback (for demo)

---

## 🎯 Ready to Integrate!

Your backend is fully functional and waiting for your AI models to send data!

**Start sending data and watch your traffic system come to life! 🚦🚗🚨**
