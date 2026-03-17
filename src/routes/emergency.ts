import { Router, type IRouter } from "express";
import {
  GetActiveEmergencyCorridorResponse,
  GetEmergencyEventsResponse,
} from "../lib/api-zod";

const router: IRouter = Router();

const EMERGENCY_EVENTS = [
  {
    id: "evt-001",
    type: "Ambulance",
    route: "Signal A → Signal B → Signal C → City Hospital",
    timestamp: new Date(Date.now() - 2 * 60000).toISOString(),
    duration: 142,
    status: "active" as const,
    vehicleId: "AMB-2047",
  },
  {
    id: "evt-002",
    type: "Fire Truck",
    route: "Signal D → Signal E → Downtown Fire Station",
    timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
    duration: 98,
    status: "completed" as const,
    vehicleId: "FTK-0831",
  },
  {
    id: "evt-003",
    type: "Police",
    route: "Signal F → Signal A → Precinct 7",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    duration: 67,
    status: "completed" as const,
    vehicleId: "POL-1193",
  },
  {
    id: "evt-004",
    type: "Ambulance",
    route: "Signal B → Signal C → Memorial Hospital",
    timestamp: new Date(Date.now() - 92 * 60000).toISOString(),
    duration: 115,
    status: "completed" as const,
    vehicleId: "AMB-0512",
  },
  {
    id: "evt-005",
    type: "Fire Truck",
    route: "Signal A → Signal D → Harbor District",
    timestamp: new Date(Date.now() - 3 * 3600000).toISOString(),
    duration: 203,
    status: "completed" as const,
    vehicleId: "FTK-2274",
  },
  {
    id: "evt-006",
    type: "Police",
    route: "Signal C → Signal E → Signal F → Airport",
    timestamp: new Date(Date.now() - 5 * 3600000).toISOString(),
    duration: 188,
    status: "cancelled" as const,
    vehicleId: "POL-0044",
  },
];

router.get("/emergency-events", (_req, res) => {
  const recentCount = EMERGENCY_EVENTS.filter(
    (e) => Date.now() - new Date(e.timestamp).getTime() < 3600000,
  ).length;
  const data = GetEmergencyEventsResponse.parse({
    events: EMERGENCY_EVENTS,
    recentCount,
  });
  res.json(data);
});

router.get("/emergency-corridor/active", (_req, res) => {
  const data = GetActiveEmergencyCorridorResponse.parse({
    active: true,
    corridorId: "corridor-2047",
    route: ["Signal A", "Signal B", "Signal C", "City Hospital"],
    signals: [
      {
        signalId: "sig-a",
        intersection: "Signal A - North/Central",
        status: "green",
      },
      {
        signalId: "sig-b",
        intersection: "Signal B - East/Central",
        status: "green",
      },
      {
        signalId: "sig-c",
        intersection: "Signal C - South/West",
        status: "green",
      },
    ],
    vehicleType: "Ambulance",
    estimatedClearTime: 45,
  });
  res.json(data);
});

export default router;
