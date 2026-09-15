const { WebSocketServer } = require('ws');
const crypto = require('crypto');
const PulseEngine = require('../engine/PulseEngine');
const MessageRouter = require('./messageRouter');

class WebSocketManager {
  constructor() {
    this.wss = null;
    this.engines = new Map(); // Store active sandbox instances
  }

  initialize(httpServer) {
    this.wss = new WebSocketServer({ server: httpServer });

    this.wss.on('connection', (ws) => {
      const sessionId = crypto.randomUUID();
      console.log(`[WebSocket] Client connected. Spinning up Sandbox: ${sessionId}`);
      
      // 1. Create a dedicated engine for this user
      const engine = new PulseEngine(sessionId);
      this.engines.set(sessionId, engine);

      // 2. Subscribe the WebSocket to this specific engine's events
      engine.on('broadcast:delta', (delta) => {
        if (ws.readyState === 1 /* WebSocket.OPEN */) {
          ws.send(JSON.stringify({ type: 'DELTA_UPDATE', payload: delta }));
        }
      });

      engine.on('system:notification', (notification) => {
        if (ws.readyState === 1) {
          ws.send(JSON.stringify({ type: 'NOTIFICATION', payload: notification }));
        }
      });

      // 3. Start the engine and send initial empty state
      engine.start();
      ws.send(JSON.stringify({ 
        type: 'FULL_SNAPSHOT', 
        payload: engine.getFullSnapshot() 
      }));

      // 4. Route incoming messages to this specific engine
      ws.on('message', (message) => {
        MessageRouter.route(message, ws, engine);
      });

      ws.on('close', () => {
        console.log(`[WebSocket] Client disconnected. Destroying Sandbox: ${sessionId}`);
        engine.stop();
        engine.clearTopology(); // Release memory
        this.engines.delete(sessionId);
      });

      ws.on('error', (err) => {
        console.error(`[WebSocket] Session ${sessionId} Error:`, err);
      });
    });
  }
}

module.exports = new WebSocketManager();