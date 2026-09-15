import useEngineStore from '../store/useEngineStore';

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    // Vite handles the environment switch automatically via .env files
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    console.log(`[WebSocket] Connecting to ${this.url}...`);
    this.ws = new WebSocket(this.url);

    this.ws.onopen = () => {
      console.log('[WebSocket] Connection established.');
      this.reconnectAttempts = 0;
      useEngineStore.getState().setConnectionStatus(true);
      
      // Clear any pending reconnects
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    this.ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (err) {
        console.error('[WebSocket] Failed to parse message:', err);
      }
    };

    this.ws.onclose = () => {
      console.log('[WebSocket] Connection closed.');
      useEngineStore.getState().setConnectionStatus(false);
      this.attemptReconnect();
    };

    this.ws.onerror = (error) => {
      console.error('[WebSocket] Error occurred:', error);
      this.ws.close();
    };
  }

  handleMessage(message) {
    const { type, payload } = message;
    const store = useEngineStore.getState();

    switch (type) {
      case 'FULL_SNAPSHOT':
        store.initializeState(payload);
        break;
      case 'DELTA_UPDATE':
        store.applyDelta(payload);
        break;
      case 'NOTIFICATION':
        store.addNotification(payload.message);
        break;
      default:
        // Ignore simple heartbeats or unknown types
        break;
    }
  }

  /**
   * Exposes a method for the React UI to send chaos and builder commands
   */
  sendCommand(type, payload = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[WebSocket] Cannot send command, socket is not open.', type);
    }
  }

  attemptReconnect() {
    // Exponential backoff for reconnects (max 10 seconds)
    const delay = Math.min(1000 * (2 ** this.reconnectAttempts), 10000);
    this.reconnectAttempts++;
    
    console.log(`[WebSocket] Attempting reconnect in ${delay / 1000}s...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }
  }
}

// Export as a singleton
const websocketClient = new WebSocketClient();
export default websocketClient;