// Green Corridor Service
// Manages emergency vehicle corridors with intelligent routing

import { trafficStore } from "../store/traffic-store";
import { trafficLightAlgorithm } from "./traffic-light-algorithm";
import type {
  EmergencyVehicleData,
  TrafficLightControlCommand,
} from "../types/ai-models";

interface CorridorRoute {
  vehicleId: string;
  signalIds: string[];
  activatedAt: Date;
  estimatedClearTime: number; // seconds
  status: "active" | "completed" | "cancelled";
}

class GreenCorridorService {
  private activeCorridors: Map<string, CorridorRoute> = new Map();
  private corridorHistory: CorridorRoute[] = [];

  /**
   * Activate green corridor for an emergency vehicle
   */
  activateCorridor(emergencyVehicle: EmergencyVehicleData): CorridorRoute {
    const { vehicleId, route, currentIntersection, priority } = emergencyVehicle;

    // Calculate estimated clear time based on route length
    const estimatedClearTime = route.length * 60; // Assume 1 minute per intersection

    const corridor: CorridorRoute = {
      vehicleId,
      signalIds: this.getSignalIdsFromRoute(route),
      activatedAt: new Date(),
      estimatedClearTime,
      status: "active",
    };

    // Store corridor
    this.activeCorridors.set(vehicleId, corridor);

    // Create emergency control commands
    const commands = trafficLightAlgorithm.createEmergencyCorridor(
      corridor.signalIds
    );

    // Apply commands (override signals to green)
    this.applyCorridorCommands(commands);

    // Schedule corridor deactivation
    setTimeout(() => {
      this.deactivateCorridor(vehicleId, "completed");
    }, estimatedClearTime * 1000);

    console.log(
      `Green corridor activated for ${vehicleId} (${emergencyVehicle.type})`
    );

    return corridor;
  }

  /**
   * Deactivate corridor when vehicle reaches destination
   */
  deactivateCorridor(
    vehicleId: string,
    status: "completed" | "cancelled"
  ): void {
    const corridor = this.activeCorridors.get(vehicleId);
    if (!corridor) return;

    corridor.status = status;
    this.corridorHistory.push(corridor);
    this.activeCorridors.delete(vehicleId);

    // Restore normal signal operations
    corridor.signalIds.forEach((signalId) => {
      const signal = trafficStore.getSignal(signalId);
      if (signal) {
        // Recalculate normal green time
        const normalGreenTime =
          trafficLightAlgorithm.calculateGreenTime(signalId);
        trafficStore.updateSignal({
          ...signal,
          greenTime: normalGreenTime,
        });
      }
    });

    console.log(
      `Green corridor deactivated for ${vehicleId} - Status: ${status}`
    );
  }

  /**
   * Get all active corridors
   */
  getActiveCorridors(): CorridorRoute[] {
    return Array.from(this.activeCorridors.values());
  }

  /**
   * Get corridor for a specific vehicle
   */
  getCorridor(vehicleId: string): CorridorRoute | undefined {
    return this.activeCorridors.get(vehicleId);
  }

  /**
   * Check if a signal is part of any active corridor
   */
  isSignalInCorridor(signalId: string): boolean {
    for (const corridor of this.activeCorridors.values()) {
      if (corridor.signalIds.includes(signalId)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get priority for a signal (1-5, 5 being highest)
   * Higher priority if it's part of an emergency corridor
   */
  getSignalPriority(signalId: string): number {
    return this.isSignalInCorridor(signalId) ? 5 : 1;
  }

  /**
   * Convert route (intersection names) to signal IDs
   */
  private getSignalIdsFromRoute(route: string[]): string[] {
    // This is a simplified mapping
    // In production, you'd have a proper intersection-to-signal mapping
    const signalMap: Record<string, string> = {
      "Signal A": "sig-a",
      "Signal B": "sig-b",
      "Signal C": "sig-c",
      "Signal D": "sig-d",
      "Signal E": "sig-e",
      "Signal F": "sig-f",
      "int-a": "sig-a",
      "int-b": "sig-b",
      "int-c": "sig-c",
      "int-d": "sig-d",
      "int-e": "sig-e",
      "int-f": "sig-f",
    };

    return route
      .map((intersection) => signalMap[intersection])
      .filter(Boolean);
  }

  /**
   * Apply emergency control commands to signals
   */
  private applyCorridorCommands(
    commands: TrafficLightControlCommand[]
  ): void {
    commands.forEach((command) => {
      const signal = trafficStore.getSignal(command.signalId);
      if (signal) {
        // Override signal to green for emergency
        trafficStore.updateSignal({
          ...signal,
          currentPhase: "green",
          greenTime: command.duration || 120,
          phaseElapsed: 0,
        });
      }
    });
  }

  /**
   * Get corridor statistics
   */
  getStatistics() {
    const activeCount = this.activeCorridors.size;
    const completedCount = this.corridorHistory.filter(
      (c) => c.status === "completed"
    ).length;
    const cancelledCount = this.corridorHistory.filter(
      (c) => c.status === "cancelled"
    ).length;

    const avgClearTime =
      this.corridorHistory.length > 0
        ? this.corridorHistory.reduce(
            (sum, c) => sum + c.estimatedClearTime,
            0
          ) / this.corridorHistory.length
        : 0;

    return {
      activeCorridors: activeCount,
      completedCorridors: completedCount,
      cancelledCorridors: cancelledCount,
      averageClearTime: Math.round(avgClearTime),
      totalProcessed: this.corridorHistory.length,
    };
  }

  /**
   * Smart routing: Find optimal route considering current traffic
   */
  findOptimalRoute(
    fromIntersection: string,
    toIntersection: string
  ): string[] {
    // This is a simplified version
    // In production, implement Dijkstra's algorithm considering:
    // 1. Current traffic density
    // 2. Signal timing
    // 3. Distance

    // For now, return a simple route
    // You can enhance this with actual pathfinding
    const intersectionGraph: Record<string, string[]> = {
      "int-a": ["int-b", "int-d"],
      "int-b": ["int-a", "int-c", "int-e"],
      "int-c": ["int-b", "int-f", "int-hospital"],
      "int-d": ["int-a", "int-e", "int-g"],
      "int-e": ["int-b", "int-d", "int-f", "int-h"],
      "int-f": ["int-c", "int-e", "int-i", "int-hospital"],
      "int-g": ["int-d", "int-h"],
      "int-h": ["int-e", "int-g", "int-i"],
      "int-i": ["int-f", "int-h"],
      "int-hospital": ["int-c", "int-f"],
    };

    // Simple BFS for shortest path
    const queue: { node: string; path: string[] }[] = [
      { node: fromIntersection, path: [fromIntersection] },
    ];
    const visited = new Set<string>([fromIntersection]);

    while (queue.length > 0) {
      const { node, path } = queue.shift()!;

      if (node === toIntersection) {
        return path;
      }

      const neighbors = intersectionGraph[node] || [];
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          visited.add(neighbor);
          queue.push({ node: neighbor, path: [...path, neighbor] });
        }
      }
    }

    // If no path found, return direct route
    return [fromIntersection, toIntersection];
  }
}

// Singleton instance
export const greenCorridorService = new GreenCorridorService();
