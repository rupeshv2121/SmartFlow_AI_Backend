import { Router, type IRouter, type Request, type Response } from "express";

type Vehicle = {
  id: string | number;
  x: number;
  y: number;
};

type TrafficDensity = {
  level: "low" | "medium" | "high";
  label: "Low (Green)" | "Medium (Yellow)" | "High (Red)";
  color: "green" | "yellow" | "red";
};

let latestVehicles: Vehicle[] = [];
let totalVehiclesInSimulation: number = 0;

function getTrafficDensityByCount(count: number): TrafficDensity {
  if (count < 50) {
    return {
      level: "low",
      label: "Low (Green)",
      color: "green",
    };
  }

  if (count <= 100) {
    return {
      level: "medium",
      label: "Medium (Yellow)",
      color: "yellow",
    };
  }

  return {
    level: "high",
    label: "High (Red)",
    color: "red",
  };
}

function isVehicle(value: unknown): value is Vehicle {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<Vehicle>;
  const hasValidId =
    typeof candidate.id === "string" || typeof candidate.id === "number";

  return (
    hasValidId &&
    typeof candidate.x === "number" &&
    typeof candidate.y === "number"
  );
}

function isVehicleArray(value: unknown): value is Vehicle[] {
  return Array.isArray(value) && value.every(isVehicle);
}

const vehiclesRouter: IRouter = Router();

vehiclesRouter.post("/vehicles", (req: Request, res: Response) => {
  let vehiclesToStore: Vehicle[] = [];
  let totalVehicles: number = 0;

  // Handle optimized format: { total, count, vehicles }
  if (
    req.body &&
    typeof req.body === "object" &&
    "vehicles" in req.body &&
    "total" in req.body
  ) {
    const { total, vehicles, count } = req.body;

    if (!isVehicleArray(vehicles)) {
      return res.status(400).json({
        error:
          "Request body.vehicles must be an array of vehicles: [{ id, x, y }]",
      });
    }

    vehiclesToStore = vehicles;
    totalVehicles =
      typeof total === "number" ? total : count || vehicles.length;
    totalVehiclesInSimulation = totalVehicles;
  }
  // Handle legacy format: direct array
  else if (isVehicleArray(req.body)) {
    vehiclesToStore = req.body;
    totalVehicles = req.body.length;
    totalVehiclesInSimulation = totalVehicles;
  }
  // Handle minimal format: { total } or { count }
  else if (
    req.body &&
    typeof req.body === "object" &&
    ("total" in req.body || "count" in req.body)
  ) {
    totalVehicles = req.body.total || req.body.count || 0;
    totalVehiclesInSimulation = totalVehicles;
    vehiclesToStore = []; // No vehicle data sent
  } else {
    return res.status(400).json({
      error:
        "Request body must be either: array of vehicles OR { total, count, vehicles }",
    });
  }

  // Overwrite the in-memory state with only the latest snapshot.
  latestVehicles = vehiclesToStore;
  // Use total vehicle count for density calculation
  const density = getTrafficDensityByCount(totalVehiclesInSimulation);

  console.log(
    `[vehicles] Received ${vehiclesToStore.length} vehicle details (${totalVehiclesInSimulation} total in simulation) at ${new Date().toISOString()}`,
  );
  console.log(`[vehicles] Traffic density: ${density.label}`);
  if (vehiclesToStore.length > 0) {
    console.log("[vehicles] Sample data:", vehiclesToStore.slice(0, 3));
  }

  return res.status(200).json({
    message: "Vehicle data updated",
    count: vehiclesToStore.length,
    total: totalVehiclesInSimulation,
    density,
  });
});

vehiclesRouter.get("/vehicles", (_req: Request, res: Response) => {
  return res.status(200).json(latestVehicles);
});

vehiclesRouter.get("/vehicles/status", (_req: Request, res: Response) => {
  const count = latestVehicles.length;
  const density = getTrafficDensityByCount(count);

  return res.status(200).json({ count, density });
});

export default vehiclesRouter;
