import express, { type IRouter } from "express";
import {
  GetCityHeatmapResponse,
  GetDashboardStatsResponse,
  GetLaneDensityResponse,
  GetTrafficDensityHistoryResponse,
  GetTrafficDensityResponse,
  GetVehicleCountsResponse,
} from "../lib/api-zod";
import { trafficStore } from "../store/traffic-store";

const router: IRouter = express.Router();

const LANES = [
  {
    id: "lane-1",
    name: "Lane-1 (Camera Feed 1)",
    density: "medium" as const,
    vehicleCount: 32,
    speed: 28.5,
  },
  {
    id: "lane-2",
    name: "Lane-2 (Camera Feed 2)",
    density: "high" as const,
    vehicleCount: 47,
    speed: 18.2,
  },
  {
    id: "lane-3",
    name: "Lane-3 (Camera Feed 3)",
    density: "medium" as const,
    vehicleCount: 29,
    speed: 35.1,
  },
  {
    id: "lane-4",
    name: "Lane-4 (Camera Feed 4)",
    density: "low" as const,
    vehicleCount: 19,
    speed: 42.3,
  },
];

function randomize<T extends object>(base: T, variance = 0.1): T {
  return Object.fromEntries(
    Object.entries(base).map(([k, v]) => {
      if (typeof v === "number") {
        const delta = v * variance * (Math.random() * 2 - 1);
        return [k, Math.max(0, Math.round((v + delta) * 10) / 10)];
      }
      return [k, v];
    }),
  ) as T;
}

router.get("/traffic-density", (_req, res) => {
  // Try to get real data from store
  const realLanes = trafficStore.getAllLanes();

  let lanes;
  if (realLanes.length > 0) {
    // Use real data from AI models
    lanes = realLanes.map((lane) => ({
      id: lane.laneId,
      name: lane.laneName,
      density: lane.density,
      vehicleCount: lane.vehicleCount,
      speed: lane.averageSpeed,
    }));
  } else {
    // Fallback to mock data if no real data available
    lanes = LANES.map((lane) => {
      const jitter = Math.floor(Math.random() * 10 - 5);
      const count = Math.max(1, lane.vehicleCount + jitter);
      const speed = Math.max(5, lane.speed + Math.random() * 4 - 2);
      let density: "low" | "medium" | "high" = lane.density;
      if (count > 80) density = "high";
      else if (count > 40) density = "medium";
      else density = "low";
      return {
        ...lane,
        vehicleCount: count,
        speed: Math.round(speed * 10) / 10,
        density,
      };
    });
  }

  const data = GetTrafficDensityResponse.parse({
    lanes,
    timestamp: new Date().toISOString(),
  });
  res.json(data);
});

router.get("/traffic-density/history", (_req, res) => {
  // Try to get historical data from store
  const historicalData = trafficStore.getHistoricalData();

  let data: { time: string; vehicles: number; congestion: number }[];

  if (historicalData.length > 0) {
    // Use real historical data
    data = historicalData.map((point) => ({
      time: point.timestamp.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      vehicles: point.totalVehicles,
      congestion: Math.round(point.congestion),
    }));
  } else {
    // Fallback to mock data
    const now = Date.now();
    data = [];
    for (let i = 29; i >= 0; i--) {
      const t = new Date(now - i * 60000);
      const hour = t.getHours();
      const baseLoad =
        hour >= 7 && hour <= 9 ? 140 : hour >= 17 && hour <= 19 ? 160 : 80;
      const vehicles = Math.floor(baseLoad + Math.random() * 30 - 15);
      const congestion = Math.min(
        100,
        Math.round((vehicles / 200) * 100 + Math.random() * 10),
      );
      data.push({
        time: t.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        vehicles,
        congestion,
      });
    }
  }

  const response = GetTrafficDensityHistoryResponse.parse({ data });
  res.json(response);
});

router.get("/vehicle-counts", (_req, res) => {
  // Try to get real vehicle counts from store
  const realCounts = trafficStore.getVehicleCounts();

  let cars, bikes, buses, trucks;

  if (realCounts.total > 0) {
    // Use real data
    cars = realCounts.cars;
    bikes = realCounts.bikes;
    buses = realCounts.buses;
    trucks = realCounts.trucks;
  } else {
    // Fallback to mock data - adjusted for 4-camera system
    cars = Math.floor(85 + Math.random() * 30 - 15);
    bikes = Math.floor(25 + Math.random() * 10 - 5);
    buses = Math.floor(8 + Math.random() * 4 - 2);
    trucks = Math.floor(12 + Math.random() * 6 - 3);
  }

  const data = GetVehicleCountsResponse.parse({
    cars,
    bikes,
    buses,
    trucks,
    total: cars + bikes + buses + trucks,
    timestamp: new Date().toISOString(),
  });
  res.json(data);
});

router.get("/dashboard-stats", (_req, res) => {
  // Get real stats from store
  const stats = trafficStore.getDashboardStats();

  // If we have real lane data, use actual stats (even if some are 0)
  // Only use mock data if we have NO real data at all
  const hasRealData = trafficStore.getAllLanes().length > 0;

  const data = GetDashboardStatsResponse.parse({
    totalVehicles:
      stats.totalVehicles ||
      (!hasRealData ? Math.floor(127 + Math.random() * 50 - 25) : 0),
    activeIntersections: stats.activeIntersections || (!hasRealData ? 4 : 1),
    congestedLanes:
      stats.congestedLanes ||
      (!hasRealData ? Math.floor(3 + Math.random() * 3) : 0),
    emergencyAlerts:
      stats.emergencyAlerts ||
      (!hasRealData ? (Math.random() > 0.7 ? 1 : 0) : 0),
    avgSpeed:
      stats.avgSpeed ||
      (!hasRealData ? Math.round((28.4 + Math.random() * 8 - 4) * 10) / 10 : 0),
    systemStatus: stats.systemStatus,
  });
  res.json(data);
});

router.get("/lane-density", (_req, res) => {
  // Try to get real data from store
  const realLanes = trafficStore.getAllLanes();

  let lanes;
  if (realLanes.length > 0) {
    // Use real data
    lanes = realLanes.map((lane) => ({
      id: lane.laneId,
      name: lane.laneName,
      density: lane.density,
      vehicleCount: lane.vehicleCount,
      speed: lane.averageSpeed,
    }));
  } else {
    // Fallback to mock data
    lanes = LANES.map((lane) => {
      const jitter = Math.floor(Math.random() * 8 - 4);
      const count = Math.max(1, lane.vehicleCount + jitter);
      let density: "low" | "medium" | "high" = lane.density;
      if (count > 80) density = "high";
      else if (count > 40) density = "medium";
      else density = "low";
      return { ...lane, vehicleCount: count, density };
    });
  }

  const data = GetLaneDensityResponse.parse({ lanes });
  res.json(data);
});

router.get("/heatmap", (_req, res) => {
  const cells = [];
  const zones = [
    "Downtown",
    "Midtown",
    "Uptown",
    "East Side",
    "West Side",
    "Harbor",
    "Airport",
    "Suburbs",
  ];
  let zoneIdx = 0;
  for (let x = 0; x < 8; x++) {
    for (let y = 0; y < 6; y++) {
      const centerX = 3.5,
        centerY = 2.5;
      const dist = Math.sqrt(
        Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2),
      );
      const baseVal = Math.max(0, 1 - dist / 5);
      const val = Math.min(1, baseVal + Math.random() * 0.3 - 0.1);
      cells.push({
        x,
        y,
        value: Math.round(val * 100) / 100,
        zone: zones[zoneIdx % zones.length],
      });
      zoneIdx++;
    }
  }
  const data = GetCityHeatmapResponse.parse({ cells, maxValue: 1.0 });
  res.json(data);
});

export default router;
