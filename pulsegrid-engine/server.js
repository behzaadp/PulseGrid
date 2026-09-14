const http = require('http');
const { WebSocketServer } = require('ws');

const port = process.env.PORT || 8080;

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.statusCode = 200;
  res.end(JSON.stringify({ status: 'live' }));
});

const wss = new WebSocketServer({ server });

wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify({ message: 'PulseGrid WebSocket Connected!' }));

  const interval = setInterval(() => {
    ws.send(JSON.stringify({ time: new Date().toISOString() }));
  }, 1000);

  ws.on('close', () => clearInterval(interval));
});

server.listen(port, () => console.log(`Engine running on port ${port}`));