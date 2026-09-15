const http = require('http');
const websocketManager = require('./network/websocketManager');

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
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
    engine: 'PulseGrid Sandbox Controller',
    uptime: process.uptime()
  }));
});

websocketManager.initialize(server);

server.listen(port, () => {
  console.log(`[System] PulseGrid Engine running on port ${port}`);
  console.log(`[System] Multi-tenant Sandbox Mode Enabled.`);
});