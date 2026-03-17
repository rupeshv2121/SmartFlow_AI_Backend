import { Router, type IRouter } from "express";
import {
  GetCongestionAnalyticsResponse,
  GetSignalTimingResponse,
} from "../lib/api-zod";
import { trafficStore } from "../store/traffic-store";
import { trafficLightAlgorithm } from "../services/traffic-light-algorithm";

const router: IRouter = Router();

const INTERSECTIONS = [
  {
    id: "sig-a",
    intersection: "Signal A - North/Central",
    baseVehicles: 45,
    density: "high" as const,
    greenTime: 60,
    cycleTime: 90,
  },
  {
    id: "sig-b",
    intersection: "Signal B - East/Central",
    baseVehicles: 20,
    density: "medium" as const,
    greenTime: 40,
    cycleTime: 70,
  },
  {
    id: "sig-c",
    intersection: "Signal C - South/West",
    baseVehicles: 10,
    density: "low" as const,
    greenTime: 20,
    cycleTime: 50,
  },
  {
    id: "sig-d",
    intersection: "Signal D - Market/Main",
    baseVehicles: 67,
    density: "high" as const,
    greenTime: 65,
    cycleTime: 95,
  },
  {
    id: "sig-e",
    intersection: "Signal E - Harbor/Bay",
    baseVehicles: 33,
    density: "medium" as const,
    greenTime: 45,
    cycleTime: 75,
  },
  {
    id: "sig-f",
    intersection: "Signal F - Airport Rd",
    baseVehicles: 8,
    density: "low" as const,
    greenTime: 18,
    cycleTime: 48,
  },
];

const PHASES: ("green" | "yellow" | "red")[] = ["green", "yellow", "red"];

let phaseCounters: Record<string, { phase: number; elapsed: number }> = {};
INTERSECTIONS.forEach((s) => {
  phaseCounters[s.id] = { phase: 0, elapsed: 0 };
});

function tickPhases() {
  INTERSECTIONS.forEach((s) => {
    const c = phaseCounters[s.id];
    const durations = [s.greenTime, 5, s.cycleTime - s.greenTime - 5];
    c.elapsed++;
    if (c.elapsed >= durations[c.phase]) {
      c.phase = (c.phase + 1) % 3;
      c.elapsed = 0;
    }
  });
}

setInterval(tickPhases, 1000);

router.get("/signal-timing", (_req, res) => {
  // Get real signals from store
  const realSignals = trafficStore.getAllSignals();

  let signals;
  if (realSignals.length > 0) {
    // Use real data with algorithm-calculated timings
    signals = realSignals.map((s) => ({
      id: s.signalId,
      intersection: s.intersectionId,
      vehicles: s.vehicleCount,
      density: s.density,
      greenTime: trafficLightAlgorithm.calculateGreenTime(s.signalId),
      currentPhase: s.currentPhase,
      phaseElapsed: s.phaseElapsed,
      cycleTime: s.cycleTime,
    }));
  } else {
    // Fallback to mock data
    signals = INTERSECTIONS.map((s) => {
      const jitter = Math.floor(Math.random() * 10 - 5);
      const vehicles = Math.max(1, s.baseVehicles + jitter);
      let density: "low" | "medium" | "high" = s.density;
      if (vehicles > 55) density = "high";
      else if (vehicles > 25) density = "medium";
      else density = "low";
      const greenTime = density === "high" ? 60 : density === "medium" ? 40 : 20;
      const c = phaseCounters[s.id];
      return {
        id: s.id,
        intersection: s.intersection,
        vehicles,
        density,
        greenTime,
        currentPhase: PHASES[c.phase],
        phaseElapsed: c.elapsed,
        cycleTime: s.cycleTime,
      };
    });
  }

  const data = GetSignalTimingResponse.parse({
    signals,
    timestamp: new Date().toISOString(),
  });
  res.json(data);
});

router.get("/congestion-analytics", (_req, res) => {
  // Get real intersections from store
  const realIntersections = trafficStore.getAllIntersections();

  let analyticsData;
  if (realIntersections.length > 0) {
    // Use real data
    analyticsData = realIntersections.map((int) => ({
      intersection: int.intersectionName,
      congestion: int.congestionLevel,
      vehicles: int.totalVehicles,
      avgSpeed:
        int.lanes.reduce((sum, lane) => sum + lane.averageSpeed, 0) /
        (int.lanes.length || 1),
    }));
  } else {
    // Fallback to mock data
    analyticsData = INTERSECTIONS.map((s) => {
      const jitter = Math.random() * 20 - 10;
      const congestion = Math.min(
        100,
        Math.max(0, (s.baseVehicles / 80) * 100 + jitter),
      );
      const vehicles = Math.max(
        1,
        s.baseVehicles + Math.floor(Math.random() * 10 - 5),
      );
      const avgSpeed = Math.max(5, 60 - congestion * 0.5 + Math.random() * 5);
      return {
        intersection: s.intersection.split(" - ")[0],
        congestion: Math.round(congestion * 10) / 10,
        vehicles,
        avgSpeed: Math.round(avgSpeed * 10) / 10,
      };
    });
  }

  const hourlyTrend = [];
  for (let h = 0; h < 24; h++) {
    const isPeakMorning = h >= 7 && h <= 9;
    const isPeakEvening = h >= 17 && h <= 19;
    const baseCongest =
      isPeakMorning || isPeakEvening ? 75 : h < 6 || h > 22 ? 15 : 45;
    hourlyTrend.push({
      hour: `${String(h).padStart(2, "0")}:00`,
      congestion: Math.round(
        Math.min(100, baseCongest + Math.random() * 15 - 7),
      ),
      throughput: Math.floor(
        (1 - baseCongest / 100) * 800 + Math.random() * 100,
      ),
    });
  }

  const data = GetCongestionAnalyticsResponse.parse({
    data: analyticsData,
    hourlyTrend,
  });
  res.json(data);
});

export default router;
