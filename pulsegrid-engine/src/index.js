const http = require('http');
const websocketManager = require('./network/websocketManager');
const simulationLoop = require('./engine/simulationLoop');

const port = process.env.PORT || 8080;

// Create the base HTTP server for Azure's health probes
const server = http.createServer((req, res) => {
  // Basic CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  res.statusCode = 200;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify({ 
    status: 'live', 
    engine: 'PulseGrid Simulation Core',
    uptime: process.uptime()
  }));
});

// Attach the WebSocket Manager
websocketManager.initialize(server);

// Start the physics simulation loop
simulationLoop.start();

// Boot the server
server.listen(port, () => {
  console.log(`[System] PulseGrid Engine running on port ${port}`);
});