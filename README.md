# SmartFlow AI Backend

Backend server for the SmartFlow AI Traffic Management System.

## Quick Start

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build
```

Server runs on `http://localhost:3000`

## Features

- ✅ Real-time vehicle detection data processing
- ✅ Dynamic traffic light optimization algorithm
- ✅ Green corridor mechanism for emergency vehicles
- ✅ Socket.io for real-time frontend updates
- ✅ RESTful API for AI model integration
- ✅ In-memory data store with automatic cleanup
- ✅ Starvation prevention in traffic signals

## API Endpoints

### AI Model Integration
- `POST /api/ai/vehicle-detection` - Receive vehicle detection data
- `POST /api/ai/intersection-update` - Update intersection data
- `POST /api/ai/emergency-vehicle` - Report emergency vehicle
- `DELETE /api/ai/emergency-vehicle/:id` - Remove emergency vehicle
- `GET /api/ai/status` - Get system status

### Frontend API
- `GET /api/traffic-density` - Current traffic density
- `GET /api/signal-timing` - Signal timings with optimization
- `GET /api/emergency-events` - Emergency events
- `GET /api/dashboard-stats` - Dashboard statistics
- And more... (see INTEGRATION_README.md)

## Documentation

See [INTEGRATION_README.md](./INTEGRATION_README.md) for complete integration guide.

## Architecture

```
src/
├── routes/           # API route handlers
│   ├── ai-input.ts   # AI model input endpoints
│   ├── traffic.ts    # Traffic data endpoints
│   ├── signals.ts    # Signal timing endpoints
│   └── emergency.ts  # Emergency vehicle endpoints
├── services/         # Business logic
│   ├── traffic-light-algorithm.ts
│   └── green-corridor.ts
├── store/           # Data management
│   └── traffic-store.ts
├── types/           # TypeScript types
│   └── ai-models.ts
├── lib/             # Utilities
│   └── socket.ts    # Socket.io setup
├── app.ts           # Express app setup
└── index.ts         # Server entry point
```

## Tech Stack

- Express.js 5
- Socket.io (real-time communication)
- TypeScript
- Zod (validation)
- Better-SQLite3 (optional persistence)

## Development

```bash
npm run dev          # Start dev server
npm run build        # Build for production
npm run typecheck    # Type checking
```

## License

MIT
