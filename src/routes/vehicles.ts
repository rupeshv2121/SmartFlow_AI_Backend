import { Router, type IRouter, type Request, type Response } from "express";

type Vehicle = {
  id: string | number;
  lat?: number;
  lng?: number;
  x?: number;
  y?: number;
};

type TrafficLight = {
  id: string;
  state: string;
  lat: number;
  lng: number;
};

type TrafficDensity = {
  level: "low" | "medium" | "high";
  label: "Low (Green)" | "Medium (Yellow)" | "High (Red)";
  color: "green" | "yellow" | "red";
};

type VehiclesPayload = {
  total?: number;
  count?: number;
  vehicles?: unknown;
  lights?: unknown;
};

let latestVehicles: Vehicle[] = [];
let latestTrafficLights: TrafficLight[] = [];
let totalVehiclesInSimulation = 0;

function getTrafficDensityByCount(count: number): TrafficDensity {
  if (count < 50) {
    return { level: "low", label: "Low (Green)", color: "green" };
  }

  if (count <= 100) {
    return { level: "medium", label: "Medium (Yellow)", color: "yellow" };
  }

  return { level: "high", label: "High (Red)", color: "red" };
}

function isVehicle(value: unknown): value is Vehicle {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Vehicle>;
  const hasValidGeo =
    typeof candidate.lat === "number" && typeof candidate.lng === "number";
  const hasValidCartesian =
    typeof candidate.x === "number" && typeof candidate.y === "number";

  return (
    (typeof candidate.id === "string" || typeof candidate.id === "number") &&
    (hasValidGeo || hasValidCartesian)
  );
}

function isVehicleArray(value: unknown): value is Vehicle[] {
  return Array.isArray(value) && value.every(isVehicle);
}

function normalizeVehicle(vehicle: Vehicle): Vehicle {
  const normalized: Vehicle = {
    id: vehicle.id,
  };

  if (typeof vehicle.lat === "number" && typeof vehicle.lng === "number") {
    normalized.lat = vehicle.lat;
    normalized.lng = vehicle.lng;
  }

  if (typeof vehicle.x === "number" && typeof vehicle.y === "number") {
    normalized.x = vehicle.x;
    normalized.y = vehicle.y;
  }

  return normalized;
}

function isTrafficLight(value: unknown): value is TrafficLight {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TrafficLight>;

  return (
    typeof candidate.id === "string" &&
    typeof candidate.state === "string" &&
    typeof candidate.lat === "number" &&
    typeof candidate.lng === "number"
  );
}

function isTrafficLightArray(value: unknown): value is TrafficLight[] {
  return Array.isArray(value) && value.every(isTrafficLight);
}

const vehiclesRouter: IRouter = Router();

vehiclesRouter.post("/vehicles", (req: Request, res: Response) => {
  let vehiclesToStore: Vehicle[] = [];
  let lightsToStore: TrafficLight[] = [];
  let total = 0;

  if (isVehicleArray(req.body)) {
    vehiclesToStore = req.body.map(normalizeVehicle);
    total = vehiclesToStore.length;
  } else if (req.body && typeof req.body === "object") {
    const payload = req.body as VehiclesPayload;

    if (payload.vehicles !== undefined && !isVehicleArray(payload.vehicles)) {
      return res.status(400).json({
        error:
          "Request body.vehicles must be an array: [{ id, lat, lng }] or [{ id, x, y }]",
      });
    }

    if (payload.lights !== undefined && !isTrafficLightArray(payload.lights)) {
      return res.status(400).json({
        error:
          "Request body.lights must be an array: [{ id, state, lat, lng }]",
      });
    }

    vehiclesToStore = (payload.vehicles ?? []).map(normalizeVehicle);
    lightsToStore = payload.lights ?? [];

    if (typeof payload.total === "number") {
      total = payload.total;
    } else if (typeof payload.count === "number") {
      total = payload.count;
    } else {
      total = vehiclesToStore.length;
    }
  } else {
    return res.status(400).json({
      error:
        "Request body must be either an array or { total, count, vehicles }",
    });
  }

  latestVehicles = vehiclesToStore;
  latestTrafficLights = lightsToStore;
  totalVehiclesInSimulation = total;

  const density = getTrafficDensityByCount(totalVehiclesInSimulation);

  return res.status(200).json({
    message: "Vehicle data updated",
    count: latestVehicles.length,
    total: totalVehiclesInSimulation,
    lights: latestTrafficLights.length,
    density,
  });
});

vehiclesRouter.get("/vehicles", (_req: Request, res: Response) => {
  return res.status(200).json({
    total: totalVehiclesInSimulation,
    count: latestVehicles.length,
    vehicles: latestVehicles,
    lights: latestTrafficLights,
  });
});

vehiclesRouter.get("/vehicles/status", (_req: Request, res: Response) => {
  const density = getTrafficDensityByCount(totalVehiclesInSimulation);

  return res.status(200).json({
    total: totalVehiclesInSimulation,
    count: latestVehicles.length,
    lights: latestTrafficLights.length,
    density,
  });
});

vehiclesRouter.get("/traffic-lights", (_req: Request, res: Response) => {
  return res.status(200).json({
    count: latestTrafficLights.length,
    lights: latestTrafficLights,
  });
});

export default vehiclesRouter;
