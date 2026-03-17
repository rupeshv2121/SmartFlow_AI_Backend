// Types for AI Model Inputs and Outputs

export interface VehicleDetection {
  id: string;
  type: "car" | "bus" | "truck" | "bike" | "ambulance" | "fire_truck" | "police" | "motorcycle";
  x: number;
  y: number;
  width: number;
  height: number;
  confidence: number;
  lane?: string;
  speed?: number;
}

export interface LaneData {
  laneId: string;
  laneName: string;
  vehicleCount: number;
  density: "low" | "medium" | "high";
  averageSpeed: number;
  detections: VehicleDetection[];
  timestamp: Date;
}

export interface IntersectionData {
  intersectionId: string;
  intersectionName: string;
  lanes: LaneData[];
  totalVehicles: number;
  congestionLevel: number; // 0-100
  emergencyVehicleDetected: boolean;
  emergencyVehicleType?: string;
  timestamp: Date;
}

export interface EmergencyVehicleData {
  vehicleId: string;
  type: "ambulance" | "fire_truck" | "police";
  currentIntersection: string;
  route: string[];
  detectedAt: Date;
  priority: number; // 1-5, 5 being highest
}

export interface TrafficSignalState {
  signalId: string;
  intersectionId: string;
  currentPhase: "green" | "yellow" | "red";
  phaseElapsed: number; // seconds
  greenTime: number; // allocated green time in seconds
  cycleTime: number; // total cycle time in seconds
  nextPhaseIn: number; // seconds until next phase
  density: "low" | "medium" | "high";
  vehicleCount: number;
}

export interface TrafficLightControlCommand {
  signalId: string;
  action: "extend_green" | "force_green" | "normal" | "emergency_override";
  duration?: number; // seconds
  reason?: string;
}
