// In-memory data store for traffic management
// This can be replaced with Redis for production

import type {
  EmergencyVehicleData,
  IntersectionData,
  LaneData,
  TrafficSignalState,
  VehicleDetection,
} from "../types/ai-models";

class TrafficStore {
  private intersections: Map<string, IntersectionData> = new Map();
  private lanes: Map<string, LaneData> = new Map();
  private signals: Map<string, TrafficSignalState> = new Map();
  private emergencyVehicles: Map<string, EmergencyVehicleData> = new Map();
  private activeCorridors: Map<string, EmergencyVehicleData> = new Map();
  private historicalData: {
    timestamp: Date;
    totalVehicles: number;
    congestion: number;
  }[] = [];

  // Intersection methods
  updateIntersection(data: IntersectionData): void {
    this.intersections.set(data.intersectionId, data);
    // Update lanes as well
    data.lanes.forEach((lane) => {
      this.lanes.set(lane.laneId, lane);
    });
    // Add to historical data
    this.addHistoricalData(data.totalVehicles, data.congestionLevel);
  }

  getIntersection(intersectionId: string): IntersectionData | undefined {
    return this.intersections.get(intersectionId);
  }

  getAllIntersections(): IntersectionData[] {
    return Array.from(this.intersections.values());
  }

  // Lane methods
  updateLane(data: LaneData): void {
    this.lanes.set(data.laneId, data);
    // Also update historical data when we get new lane data
    const totalVehicles = Array.from(this.lanes.values()).reduce(
      (sum, lane) => sum + lane.vehicleCount,
      0
    );
    const congestionPercentage = Math.min(
      100,
      Math.round((totalVehicles / 100) * 100)
    );
    this.addHistoricalData(totalVehicles, congestionPercentage);
  }

  getLane(laneId: string): LaneData | undefined {
    return this.lanes.get(laneId);
  }

  getAllLanes(): LaneData[] {
    return Array.from(this.lanes.values());
  }

  // Signal methods
  updateSignal(data: TrafficSignalState): void {
    this.signals.set(data.signalId, data);
  }

  getSignal(signalId: string): TrafficSignalState | undefined {
    return this.signals.get(signalId);
  }

  getAllSignals(): TrafficSignalState[] {
    return Array.from(this.signals.values());
  }

  // Emergency vehicle methods
  addEmergencyVehicle(data: EmergencyVehicleData): void {
    this.emergencyVehicles.set(data.vehicleId, data);
    if (data.priority >= 4) {
      this.activeCorridors.set(data.vehicleId, data);
    }
  }

  removeEmergencyVehicle(vehicleId: string): void {
    this.emergencyVehicles.delete(vehicleId);
    this.activeCorridors.delete(vehicleId);
  }

  getEmergencyVehicle(vehicleId: string): EmergencyVehicleData | undefined {
    return this.emergencyVehicles.get(vehicleId);
  }

  getAllEmergencyVehicles(): EmergencyVehicleData[] {
    return Array.from(this.emergencyVehicles.values());
  }

  getActiveCorridors(): EmergencyVehicleData[] {
    return Array.from(this.activeCorridors.values());
  }

  // Historical data methods
  private addHistoricalData(vehicles: number, congestion: number): void {
    this.historicalData.push({
      timestamp: new Date(),
      totalVehicles: vehicles,
      congestion,
    });
    // Keep only last 30 minutes of data
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    this.historicalData = this.historicalData.filter(
      (d) => d.timestamp.getTime() > thirtyMinutesAgo,
    );
  }

  getHistoricalData(): typeof this.historicalData {
    return this.historicalData;
  }

  // Dashboard stats
  getDashboardStats() {
    // Count total vehicles from intersections first
    let totalVehicles = Array.from(this.intersections.values()).reduce(
      (sum, int) => sum + int.totalVehicles,
      0,
    );

    // If no intersection data, count from lanes (for integration script data)
    if (totalVehicles === 0 && this.lanes.size > 0) {
      totalVehicles = Array.from(this.lanes.values()).reduce(
        (sum, lane) => sum + lane.vehicleCount,
        0,
      );
    }

    const congestedLanes = Array.from(this.lanes.values()).filter(
      (lane) => lane.density === "high",
    ).length;

    const activeIntersections =
      this.intersections.size > 0
        ? this.intersections.size
        : this.lanes.size > 0
          ? 1
          : 0; // Count as 1 active intersection if we have lanes

    const emergencyAlerts = this.emergencyVehicles.size;

    const avgSpeed =
      this.lanes.size > 0
        ? Array.from(this.lanes.values()).reduce(
            (sum, lane) => sum + lane.averageSpeed,
            0,
          ) / this.lanes.size
        : 0;

    return {
      totalVehicles,
      activeIntersections,
      congestedLanes,
      emergencyAlerts,
      avgSpeed: Math.round(avgSpeed * 10) / 10,
      systemStatus: "operational" as const,
    };
  }

  // Vehicle counts by type
  getVehicleCounts() {
    const allDetections: VehicleDetection[] = [];
    this.lanes.forEach((lane) => {
      allDetections.push(...lane.detections);
    });

    const cars = allDetections.filter((d) => d.type === "car").length;
    const bikes = allDetections.filter(
      (d) => d.type === "bike" || d.type === "motorcycle",
    ).length;
    const buses = allDetections.filter((d) => d.type === "bus").length;
    const trucks = allDetections.filter((d) => d.type === "truck").length;

    return {
      cars,
      bikes,
      buses,
      trucks,
      total: cars + bikes + buses + trucks,
    };
  }

  // Clear old data (cleanup)
  cleanup(): void {
    const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;

    // Remove stale intersections (no update in 5 minutes)
    for (const [id, data] of this.intersections.entries()) {
      if (data.timestamp.getTime() < fiveMinutesAgo) {
        this.intersections.delete(id);
      }
    }

    // Remove stale lanes
    for (const [id, data] of this.lanes.entries()) {
      if (data.timestamp.getTime() < fiveMinutesAgo) {
        this.lanes.delete(id);
      }
    }

    // Remove completed emergency vehicles (older than 1 hour)
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    for (const [id, data] of this.emergencyVehicles.entries()) {
      if (data.detectedAt.getTime() < oneHourAgo) {
        this.emergencyVehicles.delete(id);
        this.activeCorridors.delete(id);
      }
    }
  }
}

// Singleton instance
export const trafficStore = new TrafficStore();

// Cleanup every 5 minutes
setInterval(
  () => {
    trafficStore.cleanup();
  },
  5 * 60 * 1000,
);
