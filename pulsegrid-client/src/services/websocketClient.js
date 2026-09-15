import useEngineStore from '../store/useEngineStore';

class WebSocketClient {
  constructor() {
    this.ws = null;
    this.reconnectTimer = null;
    this.reconnectAttempts = 0;
    this.url = import.meta.env.VITE_WS_URL || 'ws://localhost:8080';
  }

  connect() {
    if (this.ws && (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)) {
      return;
    }

    console.log(`[WebSocket] Connecting to ${this.url}...`);
    const ws = new WebSocket(this.url);
    this.ws = ws; // Assign immediately

    ws.onopen = () => {
      if (this.ws !== ws) return; // Prevent zombie instances from modifying state
      console.log('[WebSocket] Connection established.');
      this.reconnectAttempts = 0;
      useEngineStore.getState().setConnectionStatus(true);
      
      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }
    };

    ws.onmessage = (event) => {
      if (this.ws !== ws) return;
      try {
        const data = JSON.parse(event.data);
        this.handleMessage(data);
      } catch (err) {
        console.error('[WebSocket] Failed to parse message:', err);
      }
    };

    ws.onclose = () => {
      if (this.ws !== ws) return;
      console.log('[WebSocket] Connection closed.');
      useEngineStore.getState().setConnectionStatus(false);
      this.attemptReconnect();
    };

    ws.onerror = (error) => {
      if (this.ws !== ws) return;
      console.error('[WebSocket] Error occurred:', error);
      // Safely close the current instance
      if (ws.readyState !== WebSocket.CLOSED) {
        ws.close();
      }
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
        break;
    }
  }

  sendCommand(type, payload = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    } else {
      console.warn('[WebSocket] Cannot send command, socket is not open.', type);
    }
  }

  attemptReconnect() {
    const delay = Math.min(1000 * (2 ** this.reconnectAttempts), 10000);
    this.reconnectAttempts++;
    
    console.log(`[WebSocket] Attempting reconnect in ${delay / 1000}s...`);
    
    this.reconnectTimer = setTimeout(() => {
      this.connect();
    }, delay);
  }

  disconnect() {
    if (this.ws) {
      const ws = this.ws;
      this.ws = null; // Detach immediately so async handlers ignore it
      if (ws.readyState !== WebSocket.CLOSED) {
        ws.close();
      }
    }
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
  }
}

const websocketClient = new WebSocketClient();
export default websocketClient;