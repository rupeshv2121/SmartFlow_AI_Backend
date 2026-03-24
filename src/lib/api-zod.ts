/**
 * Zod schemas for SmartFlow AI Traffic Management API
 * Inlined from lib/api-zod for standalone backend usage
 */
import z from "zod";

export const HealthCheckResponse = z.object({
  status: z.string(),
});

export const GetTrafficDensityResponse = z.object({
  roads: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      density: z.enum(["low", "medium", "high"]),
      vehicleCount: z.number(),
      speed: z.number(),
    }),
  ),
  timestamp: z.string(),
});

export const GetTrafficDensityHistoryResponse = z.object({
  data: z.array(
    z.object({
      time: z.string(),
      vehicles: z.number(),
      congestion: z.number(),
    }),
  ),
});

export const GetVehicleCountsResponse = z.object({
  cars: z.number(),
  bikes: z.number(),
  buses: z.number(),
  trucks: z.number(),
  total: z.number(),
  timestamp: z.string(),
});

export const GetDashboardStatsResponse = z.object({
  totalVehicles: z.number(),
  activeIntersections: z.number(),
  congestedRoads: z.number(),
  emergencyAlerts: z.number(),
  avgSpeed: z.number(),
  systemStatus: z.string(),
});

export const GetSignalTimingResponse = z.object({
  signals: z.array(
    z.object({
      id: z.string(),
      intersection: z.string(),
      vehicles: z.number(),
      density: z.enum(["low", "medium", "high"]),
      greenTime: z.number(),
      currentPhase: z.enum(["green", "yellow", "red"]),
      phaseElapsed: z.number(),
      cycleTime: z.number(),
    }),
  ),
  timestamp: z.string(),
});

export const GetCongestionAnalyticsResponse = z.object({
  data: z.array(
    z.object({
      intersection: z.string(),
      congestion: z.number(),
      vehicles: z.number(),
      avgSpeed: z.number(),
    }),
  ),
  hourlyTrend: z.array(
    z.object({
      hour: z.string(),
      congestion: z.number(),
      throughput: z.number(),
    }),
  ),
});

export const GetEmergencyEventsResponse = z.object({
  events: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      route: z.string(),
      timestamp: z.string(),
      duration: z.number(),
      status: z.enum(["active", "completed", "cancelled"]),
      vehicleId: z.string(),
    }),
  ),
  recentCount: z.number(),
});

export const GetActiveEmergencyCorridorResponse = z.object({
  active: z.boolean(),
  corridorId: z.string().nullable(),
  route: z.array(z.string()),
  signals: z.array(
    z.object({
      signalId: z.string(),
      intersection: z.string(),
      status: z.enum(["green", "yellow", "red", "standby"]),
    }),
  ),
  vehicleType: z.string().nullable(),
  estimatedClearTime: z.number().nullable(),
});

export const GetIntersectionsResponse = z.object({
  intersections: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      x: z.number(),
      y: z.number(),
      density: z.enum(["low", "medium", "high"]),
      vehicles: z.number(),
      signalPhase: z.enum(["green", "yellow", "red"]),
    }),
  ),
  roads: z.array(
    z.object({
      from: z.string(),
      to: z.string(),
      density: z.enum(["low", "medium", "high"]),
    }),
  ),
});

export const GetIntersectionVideoParams = z.object({
  intersectionId: z.coerce.string(),
});

export const GetIntersectionVideoResponse = z.object({
  intersectionId: z.string(),
  intersectionName: z.string(),
  streamUrl: z.string(),
  vehicles: z.number(),
  density: z.enum(["low", "medium", "high"]),
  detectedObjects: z.array(
    z.object({
      id: z.string(),
      type: z.string(),
      x: z.number(),
      y: z.number(),
      width: z.number(),
      height: z.number(),
      confidence: z.number(),
    }),
  ),
  fps: z.number(),
  resolution: z.string(),
});

export const GetRoadDensityResponse = z.object({
  roads: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      density: z.enum(["low", "medium", "high"]),
      vehicleCount: z.number(),
      speed: z.number(),
    }),
  ),
});

export const GetCityHeatmapResponse = z.object({
  cells: z.array(
    z.object({
      x: z.number(),
      y: z.number(),
      value: z.number(),
      zone: z.string(),
    }),
  ),
  maxValue: z.number(),
});
