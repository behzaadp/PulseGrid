const { WebSocketServer } = require('ws');
const eventBus = require('../engine/eventBus');
const simulationLoop = require('../engine/simulationLoop');
const MessageRouter = require('./messageRouter');

class WebSocketManager {
  constructor() {
    this.wss = null;
  }

  /**
   * Attaches the WebSocket server to the core HTTP server
   */
  initialize(httpServer) {
    this.wss = new WebSocketServer({ server: httpServer });

    this.wss.on('connection', (ws) => {
      console.log('[WebSocket] Client connected to PulseGrid Telemetry');

      // 1. Immediately send the full topology state to the new client
      const fullSnapshot = simulationLoop.getFullSnapshot();
      ws.send(JSON.stringify({ 
        type: 'FULL_SNAPSHOT', 
        payload: fullSnapshot 
      }));

      // 2. Listen for UI interactions and pass them to the router
      ws.on('message', (message) => {
        MessageRouter.route(message, ws);
      });

      ws.on('close', () => {
        console.log('[WebSocket] Client disconnected');
      });
      
      ws.on('error', (err) => {
        console.error('[WebSocket] Connection Error:', err);
      });
    });

    // 3. Subscribe to the Engine's delta broadcast and push to all active clients
    eventBus.on('broadcast:delta', (delta) => {
      this.broadcast({ type: 'DELTA_UPDATE', payload: delta });
    });

    // 4. Subscribe to system-wide notification events (like a node dying)
    eventBus.on('system:notification', (notification) => {
      this.broadcast({ type: 'NOTIFICATION', payload: notification });
    });
  }

  /**
   * Pushes a stringified JSON payload to all connected clients
   */
  broadcast(data) {
    if (!this.wss) return;
    const payload = JSON.stringify(data);
    
    for (const client of this.wss.clients) {
      if (client.readyState === 1 /* WebSocket.OPEN */) {
        client.send(payload);
      }
    }
  }
}

// Export as Singleton
module.exports = new WebSocketManager();