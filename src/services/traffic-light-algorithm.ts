// Traffic Light Algorithm Service
// Implements dynamic signal timing to prevent starvation and optimize flow

import { trafficStore } from "../store/traffic-store";
import type {
  TrafficSignalState,
  TrafficLightControlCommand,
} from "../types/ai-models";

interface SignalConfig {
  minGreenTime: number; // Minimum green time in seconds
  maxGreenTime: number; // Maximum green time in seconds
  yellowTime: number; // Yellow light duration
  redClearanceTime: number; // All-red time for safety
}

const DEFAULT_CONFIG: SignalConfig = {
  minGreenTime: 15,
  maxGreenTime: 90,
  yellowTime: 5,
  redClearanceTime: 2,
};

class TrafficLightAlgorithm {
  private config: SignalConfig;
  private signalTimers: Map<string, NodeJS.Timeout> = new Map();
  private lastGreenTime: Map<string, number> = new Map(); // Track last green to prevent starvation

  constructor(config: SignalConfig = DEFAULT_CONFIG) {
    this.config = config;
  }

  /**
   * Calculate optimal green time based on traffic density
   * ENHANCED VERSION - Matches Python algorithm implementation
   * Formula: greenTime = baseTime + (vehicleCount * factor)
   * Clamped between minGreenTime and maxGreenTime
   *
   * Priority considerations:
   * 1. Vehicle count (direct proportional)
   * 2. Emergency vehicle detection (boost green time)
   * 3. Starvation prevention (minimum time guarantee)
   */
  calculateGreenTime(signalId: string): number {
    const signal = trafficStore.getSignal(signalId);
    if (!signal) return this.config.minGreenTime;

    // ENHANCED ALGORITHM: Base time + (vehicle count * factor)
    // This matches the Python algorithm for consistency
    const baseTime = 10; // Base green time in seconds
    const factor = 2.0;   // Additional seconds per vehicle

    let dynamicTime = baseTime + (signal.vehicleCount * factor);

    // Emergency vehicle boost - ensure adequate green time
    const lanes = trafficStore.getAllLanes();
    const hasEmergency = lanes.some(
      lane => lane.laneId === signalId &&
      lane.detections.some(d =>
        d.type === "ambulance" || d.type === "fire_truck" || d.type === "police"
      )
    );

    if (hasEmergency) {
      // Ensure emergency lanes get at least base + 5 seconds
      dynamicTime = Math.max(dynamicTime, baseTime + 5);
    }

    // Starvation prevention: If this signal hasn't been green for a while, prioritize it
    const lastGreen = this.lastGreenTime.get(signalId) || 0;
    const timeSinceGreen = Date.now() - lastGreen;
    const starvationThreshold = 3 * 60 * 1000; // 3 minutes

    if (timeSinceGreen > starvationThreshold) {
      // Force a reasonable green time even if density is low
      dynamicTime = Math.max(dynamicTime, this.config.minGreenTime + 10);
    }

    // Clamp to min/max bounds
    const greenTime = Math.max(
      this.config.minGreenTime,
      Math.min(this.config.maxGreenTime, dynamicTime)
    );

    return Math.round(greenTime);
  }

  /**
   * Calculate cycle time for an intersection (sum of all phase times)
   */
  calculateCycleTime(signalIds: string[]): number {
    let totalGreenTime = 0;
    signalIds.forEach((id) => {
      totalGreenTime += this.calculateGreenTime(id);
    });

    // Add yellow and clearance times for each phase
    const phaseOverhead =
      signalIds.length * (this.config.yellowTime + this.config.redClearanceTime);

    return totalGreenTime + phaseOverhead;
  }

  /**
   * Determine if a signal should switch phase
   * Returns control command if action is needed
   */
  evaluateSignal(signalId: string): TrafficLightControlCommand | null {
    const signal = trafficStore.getSignal(signalId);
    if (!signal) return null;

    // Check if current phase has elapsed
    if (signal.currentPhase === "green") {
      // If high density and green time not maxed, consider extending
      if (
        signal.density === "high" &&
        signal.phaseElapsed >= signal.greenTime &&
        signal.greenTime < this.config.maxGreenTime
      ) {
        return {
          signalId,
          action: "extend_green",
          duration: 10, // Extend by 10 seconds
          reason: "High density detected",
        };
      }

      // If minimum time elapsed and low density, can switch early
      if (
        signal.density === "low" &&
        signal.phaseElapsed >= this.config.minGreenTime
      ) {
        return {
          signalId,
          action: "normal",
          reason: "Low density - normal cycle",
        };
      }
    }

    return null;
  }

  /**
   * Get recommended signal timing for all signals
   */
  getRecommendedTimings(): Map<string, number> {
    const recommendations = new Map<string, number>();
    const signals = trafficStore.getAllSignals();

    signals.forEach((signal) => {
      const greenTime = this.calculateGreenTime(signal.signalId);
      recommendations.set(signal.signalId, greenTime);
    });

    return recommendations;
  }

  /**
   * Update last green time for starvation tracking
   */
  recordGreenPhase(signalId: string): void {
    this.lastGreenTime.set(signalId, Date.now());
  }

  /**
   * Priority-based signal control for emergency corridors
   */
  createEmergencyCorridor(
    signalIds: string[]
  ): TrafficLightControlCommand[] {
    const commands: TrafficLightControlCommand[] = [];

    signalIds.forEach((signalId) => {
      commands.push({
        signalId,
        action: "emergency_override",
        duration: 120, // 2 minutes for corridor
        reason: "Emergency vehicle corridor",
      });
    });

    return commands;
  }

  /**
   * Auto-optimization: Continuously adjust signal timings
   * This should be called periodically (e.g., every 30 seconds)
   */
  optimizeAll(): void {
    const signals = trafficStore.getAllSignals();

    signals.forEach((signal) => {
      const optimalGreenTime = this.calculateGreenTime(signal.signalId);

      // Update signal with new green time if significantly different
      if (Math.abs(signal.greenTime - optimalGreenTime) > 5) {
        const updatedSignal: TrafficSignalState = {
          ...signal,
          greenTime: optimalGreenTime,
        };
        trafficStore.updateSignal(updatedSignal);
      }
    });
  }
}

// Singleton instance
export const trafficLightAlgorithm = new TrafficLightAlgorithm();

// Run optimization every 30 seconds
setInterval(() => {
  trafficLightAlgorithm.optimizeAll();
}, 30 * 1000);
