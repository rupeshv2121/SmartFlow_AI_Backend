/**
 * Zod schemas for SmartFlow AI Traffic Management API
 * Inlined from lib/api-zod for standalone backend usage
 */
import * as zod from "zod";

export const HealthCheckResponse = zod.object({
  status: zod.string(),
});

export const GetTrafficDensityResponse = zod.object({
  lanes: zod.array(
    zod.object({
      id: zod.string(),
      name: zod.string(),
      density: zod.enum(["low", "medium", "high"]),
      vehicleCount: zod.number(),
      speed: zod.number(),
    }),
  ),
  timestamp: zod.string(),
});

export const GetTrafficDensityHistoryResponse = zod.object({
  data: zod.array(
    zod.object({
      time: zod.string(),
      vehicles: zod.number(),
      congestion: zod.number(),
    }),
  ),
});

export const GetVehicleCountsResponse = zod.object({
  cars: zod.number(),
  bikes: zod.number(),
  buses: zod.number(),
  trucks: zod.number(),
  total: zod.number(),
  timestamp: zod.string(),
});

export const GetDashboardStatsResponse = zod.object({
  totalVehicles: zod.number(),
  activeIntersections: zod.number(),
  congestedLanes: zod.number(),
  emergencyAlerts: zod.number(),
  avgSpeed: zod.number(),
  systemStatus: zod.string(),
});

export const GetSignalTimingResponse = zod.object({
  signals: zod.array(
    zod.object({
      id: zod.string(),
      intersection: zod.string(),
      vehicles: zod.number(),
      density: zod.enum(["low", "medium", "high"]),
      greenTime: zod.number(),
      currentPhase: zod.enum(["green", "yellow", "red"]),
      phaseElapsed: zod.number(),
      cycleTime: zod.number(),
    }),
  ),
  timestamp: zod.string(),
});

export const GetCongestionAnalyticsResponse = zod.object({
  data: zod.array(
    zod.object({
      intersection: zod.string(),
      congestion: zod.number(),
      vehicles: zod.number(),
      avgSpeed: zod.number(),
    }),
  ),
  hourlyTrend: zod.array(
    zod.object({
      hour: zod.string(),
      congestion: zod.number(),
      throughput: zod.number(),
    }),
  ),
});

export const GetEmergencyEventsResponse = zod.object({
  events: zod.array(
    zod.object({
      id: zod.string(),
      type: zod.string(),
      route: zod.string(),
      timestamp: zod.string(),
      duration: zod.number(),
      status: zod.enum(["active", "completed", "cancelled"]),
      vehicleId: zod.string(),
    }),
  ),
  recentCount: zod.number(),
});

export const GetActiveEmergencyCorridorResponse = zod.object({
  active: zod.boolean(),
  corridorId: zod.string().nullable(),
  route: zod.array(zod.string()),
  signals: zod.array(
    zod.object({
      signalId: zod.string(),
      intersection: zod.string(),
      status: zod.enum(["green", "yellow", "red", "standby"]),
    }),
  ),
  vehicleType: zod.string().nullable(),
  estimatedClearTime: zod.number().nullable(),
});

export const GetIntersectionsResponse = zod.object({
  intersections: zod.array(
    zod.object({
      id: zod.string(),
      name: zod.string(),
      x: zod.number(),
      y: zod.number(),
      density: zod.enum(["low", "medium", "high"]),
      vehicles: zod.number(),
      signalPhase: zod.enum(["green", "yellow", "red"]),
    }),
  ),
  roads: zod.array(
    zod.object({
      from: zod.string(),
      to: zod.string(),
      density: zod.enum(["low", "medium", "high"]),
    }),
  ),
});

export const GetIntersectionVideoParams = zod.object({
  intersectionId: zod.coerce.string(),
});

export const GetIntersectionVideoResponse = zod.object({
  intersectionId: zod.string(),
  intersectionName: zod.string(),
  streamUrl: zod.string(),
  vehicles: zod.number(),
  density: zod.enum(["low", "medium", "high"]),
  detectedObjects: zod.array(
    zod.object({
      id: zod.string(),
      type: zod.string(),
      x: zod.number(),
      y: zod.number(),
      width: zod.number(),
      height: zod.number(),
      confidence: zod.number(),
    }),
  ),
  fps: zod.number(),
  resolution: zod.string(),
});

export const GetLaneDensityResponse = zod.object({
  lanes: zod.array(
    zod.object({
      id: zod.string(),
      name: zod.string(),
      density: zod.enum(["low", "medium", "high"]),
      vehicleCount: zod.number(),
      speed: zod.number(),
    }),
  ),
});

export const GetCityHeatmapResponse = zod.object({
  cells: zod.array(
    zod.object({
      x: zod.number(),
      y: zod.number(),
      value: zod.number(),
      zone: zod.string(),
    }),
  ),
  maxValue: zod.number(),
});
