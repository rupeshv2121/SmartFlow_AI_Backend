import express, { type IRouter } from "express";
import {
  GetIntersectionsResponse,
  GetIntersectionVideoResponse,
} from "../lib/api-zod";

const router: IRouter = express.Router();

const INTERSECTIONS_MAP = [
  {
    id: "int-a",
    name: "Signal A",
    x: 120,
    y: 80,
    density: "high" as const,
    vehicles: 87,
    signalPhase: "green" as const,
  },
  {
    id: "int-b",
    name: "Signal B",
    x: 280,
    y: 80,
    density: "medium" as const,
    vehicles: 43,
    signalPhase: "red" as const,
  },
  {
    id: "int-c",
    name: "Signal C",
    x: 440,
    y: 80,
    density: "low" as const,
    vehicles: 12,
    signalPhase: "green" as const,
  },
  {
    id: "int-d",
    name: "Signal D",
    x: 120,
    y: 200,
    density: "high" as const,
    vehicles: 95,
    signalPhase: "yellow" as const,
  },
  {
    id: "int-e",
    name: "Signal E",
    x: 280,
    y: 200,
    density: "medium" as const,
    vehicles: 38,
    signalPhase: "green" as const,
  },
  {
    id: "int-f",
    name: "Signal F",
    x: 440,
    y: 200,
    density: "low" as const,
    vehicles: 19,
    signalPhase: "red" as const,
  },
  {
    id: "int-g",
    name: "Signal G",
    x: 120,
    y: 320,
    density: "medium" as const,
    vehicles: 51,
    signalPhase: "green" as const,
  },
  {
    id: "int-h",
    name: "Signal H",
    x: 280,
    y: 320,
    density: "high" as const,
    vehicles: 78,
    signalPhase: "red" as const,
  },
  {
    id: "int-i",
    name: "Signal I",
    x: 440,
    y: 320,
    density: "medium" as const,
    vehicles: 35,
    signalPhase: "green" as const,
  },
  {
    id: "int-hospital",
    name: "City Hospital",
    x: 560,
    y: 200,
    density: "low" as const,
    vehicles: 5,
    signalPhase: "green" as const,
  },
];

const ROADS = [
  { from: "int-a", to: "int-b", density: "high" as const },
  { from: "int-b", to: "int-c", density: "medium" as const },
  { from: "int-a", to: "int-d", density: "high" as const },
  { from: "int-b", to: "int-e", density: "medium" as const },
  { from: "int-c", to: "int-f", density: "low" as const },
  { from: "int-d", to: "int-e", density: "high" as const },
  { from: "int-e", to: "int-f", density: "medium" as const },
  { from: "int-d", to: "int-g", density: "medium" as const },
  { from: "int-e", to: "int-h", density: "high" as const },
  { from: "int-f", to: "int-i", density: "medium" as const },
  { from: "int-g", to: "int-h", density: "medium" as const },
  { from: "int-h", to: "int-i", density: "high" as const },
  { from: "int-c", to: "int-hospital", density: "low" as const },
  { from: "int-f", to: "int-hospital", density: "low" as const },
];

const VEHICLE_TYPES = ["car", "car", "car", "car", "bus", "truck", "bike"];

function generateBoundingBoxes(count: number) {
  const objects = [];
  for (let i = 0; i < Math.min(count, 8); i++) {
    objects.push({
      id: `obj-${i}`,
      type: VEHICLE_TYPES[Math.floor(Math.random() * VEHICLE_TYPES.length)],
      x: 50 + Math.random() * 450,
      y: 50 + Math.random() * 250,
      width: 40 + Math.random() * 40,
      height: 25 + Math.random() * 20,
      confidence: Math.round((0.75 + Math.random() * 0.24) * 100) / 100,
    });
  }
  return objects;
}

router.get("/intersections", (_req, res) => {
  const intersections = INTERSECTIONS_MAP.map((i) => {
    const jitter = Math.floor(Math.random() * 10 - 5);
    const vehicles = Math.max(1, i.vehicles + jitter);
    let density: "low" | "medium" | "high" = i.density;
    if (vehicles > 70) density = "high";
    else if (vehicles > 35) density = "medium";
    else density = "low";
    const phases: ("green" | "yellow" | "red")[] = ["green", "yellow", "red"];
    const signalPhase = phases[Math.floor(Math.random() * 3)];
    return { ...i, vehicles, density, signalPhase };
  });

  const data = GetIntersectionsResponse.parse({
    intersections,
    roads: ROADS,
  });
  res.json(data);
});

router.get("/intersection-video/:intersectionId", (req, res) => {
  const { intersectionId } = req.params;
  const intersection = INTERSECTIONS_MAP.find((i) => i.id === intersectionId);

  if (!intersection) {
    res.status(404).json({ error: "Intersection not found" });
    return;
  }

  const jitter = Math.floor(Math.random() * 15 - 7);
  const vehicles = Math.max(1, intersection.vehicles + jitter);

  const data = GetIntersectionVideoResponse.parse({
    intersectionId: intersection.id,
    intersectionName: intersection.name,
    streamUrl: `/api/stream/${intersectionId}`,
    vehicles,
    density: intersection.density,
    detectedObjects: generateBoundingBoxes(vehicles),
    fps: 24,
    resolution: "1920x1080",
  });
  res.json(data);
});

export default router;
