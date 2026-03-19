// API endpoints for AI models to post detection data
import express, { type IRouter } from "express";
import { trafficStore } from "../store/traffic-store";
import type {
  IntersectionData,
  LaneData,
  EmergencyVehicleData,
  VehicleDetection,
} from "../types/ai-models";

const router: IRouter = express.Router();

/**
 * POST /api/ai/vehicle-detection
 * Receives vehicle detection data from YOLO model
 * Body: {
 *   intersectionId: string,
 *   laneId: string,
 *   laneName: string,
 *   detections: VehicleDetection[]
 * }
 */
router.post("/vehicle-detection", (req, res) => {
  try {
    const { intersectionId, laneId, laneName, detections } = req.body;

    if (!intersectionId || !laneId || !Array.isArray(detections)) {
      res.status(400).json({ error: "Invalid request body" });
      return;
    }

    // Calculate metrics
    const vehicleCount = detections.length;
    const averageSpeed =
      detections.reduce((sum, d) => sum + (d.speed || 0), 0) /
        (detections.length || 1);

    // Determine density based on vehicle count
    let density: "low" | "medium" | "high" = "low";
    if (vehicleCount > 15) density = "high";
    else if (vehicleCount > 7) density = "medium";

    // Create lane data
    const laneData: LaneData = {
      laneId,
      laneName: laneName || `Lane ${laneId}`,
      vehicleCount,
      density,
      averageSpeed: Math.round(averageSpeed * 10) / 10,
      detections,
      timestamp: new Date(),
    };

    // Update store
    trafficStore.updateLane(laneData);

    // Check for emergency vehicles
    const emergencyVehicles = detections.filter(
      (d) =>
        d.type === "ambulance" || d.type === "fire_truck" || d.type === "police"
    );

    if (emergencyVehicles.length > 0) {
      emergencyVehicles.forEach((ev) => {
        const emergencyData: EmergencyVehicleData = {
          vehicleId: ev.id,
          type: ev.type as "ambulance" | "fire_truck" | "police",
          currentIntersection: intersectionId,
          route: [intersectionId],
          detectedAt: new Date(),
          priority: 5, // Highest priority
        };
        trafficStore.addEmergencyVehicle(emergencyData);
      });

      // Broadcast emergency alert via Socket.io
      const io = req.app.get("io");
      if (io) {
        io.emit("emergency-vehicle-detected", {
          intersectionId,
          laneId,
          vehicles: emergencyVehicles,
          timestamp: new Date().toISOString(),
        });
      }
    }

    // Broadcast update via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.emit("lane-updated", laneData);
    }

    res.json({
      success: true,
      laneId,
      vehicleCount,
      density,
      emergencyVehiclesDetected: emergencyVehicles.length,
    });
  } catch (error) {
    console.error("Error processing vehicle detection:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/ai/intersection-update
 * Receives aggregated intersection data
 * Body: IntersectionData
 */
router.post("/intersection-update", (req, res) => {
  try {
    const data: IntersectionData = req.body;

    if (!data.intersectionId || !Array.isArray(data.lanes)) {
      res.status(400).json({ error: "Invalid intersection data" });
      return;
    }

    // Add timestamp if not present
    data.timestamp = new Date(data.timestamp || Date.now());

    // Update store
    trafficStore.updateIntersection(data);

    // Broadcast update via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.emit("intersection-updated", data);
      io.emit("dashboard-stats", trafficStore.getDashboardStats());
    }

    res.json({
      success: true,
      intersectionId: data.intersectionId,
      totalVehicles: data.totalVehicles,
      congestionLevel: data.congestionLevel,
    });
  } catch (error) {
    console.error("Error processing intersection update:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * POST /api/ai/emergency-vehicle
 * Manually report an emergency vehicle
 * Body: EmergencyVehicleData
 */
router.post("/emergency-vehicle", (req, res) => {
  try {
    const data: EmergencyVehicleData = req.body;

    if (!data.vehicleId || !data.type || !data.currentIntersection) {
      res.status(400).json({ error: "Invalid emergency vehicle data" });
      return;
    }

    data.detectedAt = new Date(data.detectedAt || Date.now());

    trafficStore.addEmergencyVehicle(data);

    // Broadcast emergency alert
    const io = req.app.get("io");
    if (io) {
      io.emit("emergency-vehicle-detected", {
        vehicleId: data.vehicleId,
        type: data.type,
        currentIntersection: data.currentIntersection,
        priority: data.priority,
        timestamp: data.detectedAt.toISOString(),
      });
    }

    res.json({
      success: true,
      vehicleId: data.vehicleId,
      corridorActivated: data.priority >= 4,
    });
  } catch (error) {
    console.error("Error processing emergency vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * DELETE /api/ai/emergency-vehicle/:vehicleId
 * Remove an emergency vehicle (when it reaches destination)
 */
router.delete("/emergency-vehicle/:vehicleId", (req, res) => {
  try {
    const { vehicleId } = req.params;

    trafficStore.removeEmergencyVehicle(vehicleId);

    // Broadcast update
    const io = req.app.get("io");
    if (io) {
      io.emit("emergency-vehicle-cleared", { vehicleId });
      io.emit("dashboard-stats", trafficStore.getDashboardStats());
    }

    res.json({ success: true, vehicleId });
  } catch (error) {
    console.error("Error removing emergency vehicle:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

/**
 * GET /api/ai/status
 * Get the current status of all AI model inputs
 */
router.get("/status", (req, res) => {
  try {
    const stats = {
      intersections: trafficStore.getAllIntersections().length,
      lanes: trafficStore.getAllLanes().length,
      signals: trafficStore.getAllSignals().length,
      emergencyVehicles: trafficStore.getAllEmergencyVehicles().length,
      activeCorridors: trafficStore.getActiveCorridors().length,
      lastUpdate: new Date().toISOString(),
    };

    res.json(stats);
  } catch (error) {
    console.error("Error getting AI status:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
