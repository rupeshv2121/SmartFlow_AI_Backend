import { createServer } from "http";
import app from "./app";
import { setupSocketIO } from "./lib/socket";

const port = Number(process.env["PORT"]) || 3000;

// Create HTTP server
const httpServer = createServer(app);

// Setup Socket.io
export const io = setupSocketIO(httpServer);

// Make io available in app context
app.set("io", io);

httpServer.listen(port, () => {
  console.log(`Server listening on port ${port}`);
  console.log(`Socket.io enabled for real-time updates`);
});
