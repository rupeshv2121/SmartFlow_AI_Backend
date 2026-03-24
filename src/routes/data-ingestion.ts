import express, { type IRouter } from "express";
import { trafficStore } from "../store/traffic-store";
import type {
  EmergencyVehicleData,
  IntersectionData,
  RoadData,
  TrafficSignalState,
} from "../types/ai-models";

const router: IRouter = express.Router();

/**
 * POST /api/ingest/intersection
 * Receive real-time intersection data from AI models
 *
 * Example payload:
 * {
 *   "intersectionId": "int-001",
 *   "location": "Main St & 5th Ave",
 *   "totalVehicles": 45,
 *   "congestionLevel": 65,
 *   "timestamp": "2024-03-21T10:30:00Z",
 *   "roads": [
 *     {
 *       "roadId": "road-001",
 *       "roadName": "Main St - Road 1",
 *       "density": "high",
 *       "vehicleCount": 23,
 *       "averageSpeed": 15.5,
 *       "detections": [],
 *       "timestamp": "2024-03-21T10:30:00Z"
 *     }
 *   ]
 * }
 */
router.post("/ingest/intersection", (req, res) => {
  try {
    const data: IntersectionData = {
      ...req.body,
      timestamp: new Date(req.body.timestamp || Date.now()),
      roads: req.body.roads.map((road: any) => ({
        ...road,
        timestamp: new Date(road.timestamp || Date.now()),
        detections: road.detections || [],
      })),
    };

    // Update traffic store with real data
    trafficStore.updateIntersection(data);

    res.json({
      success: true,
      message: "Intersection data updated",
      intersectionId: data.intersectionId,
    });
  } catch (error) {
    console.error("Error ingesting intersection data:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Invalid data format",
    });
  }
});

/**
 * POST /api/ingest/road
 * Receive real-time road data from AI models
 *
 * Example payload:
 * {
 *   "roadId": "road-001",
 *   "roadName": "Main St - Road 1",
 *   "density": "high",
 *   "vehicleCount": 23,
 *   "averageSpeed": 15.5,
 *   "detections": [
 *     {
 *       "detectionId": "det-001",
 *       "type": "car",
 *       "confidence": 0.95,
 *       "boundingBox": { "x": 100, "y": 200, "width": 50, "height": 80 },
 *       "speed": 15.5,
 *       "timestamp": "2024-03-21T10:30:00Z"
 *     }
 *   ],
 *   "timestamp": "2024-03-21T10:30:00Z"
 * }
 */
router.post("/ingest/road", (req, res) => {
  try {
    const data: RoadData = {
      ...req.body,
      timestamp: new Date(req.body.timestamp || Date.now()),
      detections: req.body.detections.map((det: any) => ({
        ...det,
        timestamp: new Date(det.timestamp || Date.now()),
      })),
    };

    // Update traffic store with real road data
    trafficStore.updateRoad(data);

    res.json({
      success: true,
      message: "Road data updated",
      roadId: data.roadId,
    });
  } catch (error) {
    console.error("Error ingesting road data:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Invalid data format",
    });
  }
});

/**
 * POST /api/ingest/emergency-vehicle
 * Receive emergency vehicle detection from AI models
 *
 * Example payload:
 * {
 *   "vehicleId": "AMB-2047",
 *   "type": "ambulance",
 *   "priority": 5,
 *   "currentLocation": "Main St & 5th Ave",
 *   "destination": "City Hospital",
 *   "route": ["Signal A", "Signal B", "Signal C", "City Hospital"],
 *   "estimatedArrival": 300,
 *   "detectedAt": "2024-03-21T10:30:00Z"
 * }
 */
router.post("/ingest/emergency-vehicle", (req, res) => {
  try {
    const data: EmergencyVehicleData = {
      ...req.body,
      detectedAt: new Date(req.body.detectedAt || Date.now()),
    };

    // Add emergency vehicle to store
    trafficStore.addEmergencyVehicle(data);

    res.json({
      success: true,
      message: "Emergency vehicle data updated",
      vehicleId: data.vehicleId,
    });
  } catch (error) {
    console.error("Error ingesting emergency vehicle data:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Invalid data format",
    });
  }
});

/**
 * DELETE /api/ingest/emergency-vehicle/:vehicleId
 * Remove emergency vehicle when it reaches destination
 */
router.delete("/ingest/emergency-vehicle/:vehicleId", (req, res) => {
  try {
    const { vehicleId } = req.params;
    trafficStore.removeEmergencyVehicle(vehicleId);

    res.json({
      success: true,
      message: "Emergency vehicle removed",
      vehicleId,
    });
  } catch (error) {
    console.error("Error removing emergency vehicle:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Error removing vehicle",
    });
  }
});

/**
 * POST /api/ingest/signal
 * Update traffic signal state
 *
 * Example payload:
 * {
 *   "signalId": "sig-001",
 *   "intersectionId": "int-001",
 *   "currentPhase": "green",
 *   "timeRemaining": 25,
 *   "cycleLength": 90,
 *   "isEmergencyOverride": false,
 *   "timestamp": "2024-03-21T10:30:00Z"
 * }
 */
router.post("/ingest/signal", (req, res) => {
  try {
    const data: TrafficSignalState = {
      ...req.body,
      timestamp: new Date(req.body.timestamp || Date.now()),
    };

    // Update signal state in store
    trafficStore.updateSignal(data);

    res.json({
      success: true,
      message: "Signal state updated",
      signalId: data.signalId,
    });
  } catch (error) {
    console.error("Error ingesting signal data:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Invalid data format",
    });
  }
});

/**
 * POST /api/ingest/batch
 * Receive batch updates from multiple sources
 *
 * Example payload:
 * {
 *   "intersections": [...],
 *   "roads": [...],
 *   "emergencyVehicles": [...],
 *   "signals": [...]
 * }
 */
router.post("/ingest/batch", (req, res) => {
  try {
    const {
      intersections = [],
      roads = [],
      emergencyVehicles = [],
      signals = [],
    } = req.body;
    let updated = 0;

    // Update intersections
    intersections.forEach((int: any) => {
      const data: IntersectionData = {
        ...int,
        timestamp: new Date(int.timestamp || Date.now()),
        roads: int.roads.map((road: any) => ({
          ...road,
          timestamp: new Date(road.timestamp || Date.now()),
          detections: road.detections || [],
        })),
      };
      trafficStore.updateIntersection(data);
      updated++;
    });

    // Update roads
    roads.forEach((road: any) => {
      const data: RoadData = {
        ...road,
        timestamp: new Date(road.timestamp || Date.now()),
        detections: road.detections.map((det: any) => ({
          ...det,
          timestamp: new Date(det.timestamp || Date.now()),
        })),
      };
      trafficStore.updateRoad(data);
      updated++;
    });

    // Update emergency vehicles
    emergencyVehicles.forEach((ev: any) => {
      const data: EmergencyVehicleData = {
        ...ev,
        detectedAt: new Date(ev.detectedAt || Date.now()),
      };
      trafficStore.addEmergencyVehicle(data);
      updated++;
    });

    // Update signals
    signals.forEach((sig: any) => {
      const data: TrafficSignalState = {
        ...sig,
        timestamp: new Date(sig.timestamp || Date.now()),
      };
      trafficStore.updateSignal(data);
      updated++;
    });

    res.json({
      success: true,
      message: "Batch update completed",
      itemsUpdated: updated,
    });
  } catch (error) {
    console.error("Error processing batch update:", error);
    res.status(400).json({
      success: false,
      error: error instanceof Error ? error.message : "Batch update failed",
    });
  }
});

/**
 * GET /api/ingest/status
 * Check current data ingestion status
 */
router.get("/ingest/status", (_req, res) => {
  const stats = trafficStore.getDashboardStats();
  const intersections = trafficStore.getAllIntersections();
  const roads = trafficStore.getAllRoads();
  const emergencyVehicles = trafficStore.getAllEmergencyVehicles();
  const signals = trafficStore.getAllSignals();

  res.json({
    status: "operational",
    dataCount: {
      intersections: intersections.length,
      roads: roads.length,
      emergencyVehicles: emergencyVehicles.length,
      signals: signals.length,
    },
    stats,
    lastUpdate: new Date().toISOString(),
  });
});

export default router;
