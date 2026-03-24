// Socket.io server setup for real-time updates
import { Server as SocketIOServer } from "socket.io";
import type { Server as HTTPServer } from "http";
import { trafficStore } from "../store/traffic-store";

export function setupSocketIO(httpServer: HTTPServer) {
  const io = new SocketIOServer(httpServer, {
    cors: {
      origin: "*", // Configure this properly for production
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`Client connected: ${socket.id}`);

    // Send initial data on connection
    socket.emit("initial-data", {
      intersections: trafficStore.getAllIntersections(),
      roads: trafficStore.getAllRoads(),
      signals: trafficStore.getAllSignals(),
      emergencyVehicles: trafficStore.getAllEmergencyVehicles(),
      dashboardStats: trafficStore.getDashboardStats(),
    });

    socket.on("disconnect", () => {
      console.log(`Client disconnected: ${socket.id}`);
    });

    // Allow clients to request specific data
    socket.on("request-intersection", (intersectionId: string) => {
      const data = trafficStore.getIntersection(intersectionId);
      socket.emit("intersection-data", data);
    });

    socket.on("request-road", (roadId: string) => {
      const data = trafficStore.getRoad(roadId);
      socket.emit("road-data", data);
    });
  });

  return io;
}

// Helper to broadcast updates to all connected clients
export function broadcastUpdate(
  io: SocketIOServer,
  event: string,
  data: any
): void {
  io.emit(event, data);
}
