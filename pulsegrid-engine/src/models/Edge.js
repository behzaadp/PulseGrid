const EventEmitter = require('events');

const CircuitBreakerState = {
  CLOSED: 'CLOSED',       // Traffic flows normally
  OPEN: 'OPEN',           // Traffic is blocked to prevent cascading failure
  HALF_OPEN: 'HALF_OPEN', // Testing the waters with limited traffic
};

const EdgeStatus = {
  CONNECTED: 'CONNECTED',
  SEVERED: 'SEVERED',     // Used during Network Partition (Split Brain) chaos
};

class Edge extends EventEmitter {
  /**
   * @param {string} id - Unique edge identifier (e.g., 'edge-gw-to-auth')
   * @param {string} sourceId - ID of the origin node
   * @param {string} targetId - ID of the destination node
   * @param {object} config - Network properties
   */
  constructor(id, sourceId, targetId, config = {}) {
    super();
    this.id = id;
    this.sourceId = sourceId;
    this.targetId = targetId;

    this.config = {
      latencyMs: config.latencyMs || 15,          // Base network travel time
      packetLossRate: config.packetLossRate || 0, // Probability of dropping (0.0 to 1.0)
      cbFailureThreshold: config.cbFailureThreshold || 5, // Consecutive errors to open CB
      cbResetTimeoutMs: config.cbResetTimeoutMs || 6000,  // Time before trying Half-Open
      ...config,
    };

    this.status = EdgeStatus.CONNECTED;
    this.inTransit = []; // Packets currently traveling: { packet, remainingMs }

    // Circuit Breaker State
    this.cbState = CircuitBreakerState.CLOSED;
    this.cbFailures = 0;
    this.cbTimerMs = 0;

    // Telemetry
    this.metrics = {
      packetsTransmitted: 0,
      packetsDropped: 0,
    };
  }

  /**
   * Called every physics tick (~20ms / 50Hz)
   * @param {number} deltaMs - Milliseconds elapsed since last tick
   * @param {object} targetNode - The destination BaseNode instance
   * @param {object} packetPool - The PacketPool instance for memory cleanup
   */
  tick(deltaMs, targetNode, packetPool) {
    // 1. Manage Circuit Breaker reset timer
    if (this.cbState === CircuitBreakerState.OPEN) {
      this.cbTimerMs -= deltaMs;
      if (this.cbTimerMs <= 0) {
        this.cbState = CircuitBreakerState.HALF_OPEN;
        this.emit('circuit_breaker:half_open', { edgeId: this.id });
      }
    }

    // 2. Move packets through the network link
    const arrivedIndices = [];
    
    for (let i = 0; i < this.inTransit.length; i++) {
      const item = this.inTransit[i];
      item.remainingMs -= deltaMs;

      if (item.remainingMs <= 0) {
        arrivedIndices.push(i);

        // If edge was severed while packet was mid-flight, it is lost
        if (this.status === EdgeStatus.SEVERED) {
          this.metrics.packetsDropped++;
          packetPool.release(item.packet);
          continue;
        }

        // Deliver to target node
        if (targetNode) {
          const accepted = targetNode.receivePacket(item.packet);
          this.recordTransmissionResult(accepted);
          
          if (!accepted) {
            // Node rejected it (e.g., dead or queue full), recycle the packet
            this.metrics.packetsDropped++;
            packetPool.release(item.packet);
          }
        }
      }
    }

    // 3. Remove arrived packets (iterate backwards to avoid shifting index issues)
    for (let i = arrivedIndices.length - 1; i >= 0; i--) {
      this.inTransit.splice(arrivedIndices[i], 1);
    }
  }

  /**
   * Called by the Source Node when it wants to send data
   */
  transmit(packet, packetPool) {
    if (this.status === EdgeStatus.SEVERED || this.cbState === CircuitBreakerState.OPEN) {
      this.metrics.packetsDropped++;
      packetPool.release(packet);
      return false;
    }

    if (Math.random() < this.config.packetLossRate) {
      this.metrics.packetsDropped++;
      this.recordTransmissionResult(false);
      packetPool.release(packet);
      return false;
    }

    // Calculate dynamic network latency with ±20% jitter
    const jitter = (Math.random() * 0.4 - 0.2) * this.config.latencyMs;
    const travelTime = Math.max(2, this.config.latencyMs + jitter);

    this.inTransit.push({ packet, remainingMs: travelTime });
    this.metrics.packetsTransmitted++;
    
    return true;
  }

  /**
   * Adjusts the Circuit Breaker state based on node acceptance/rejection
   */
  recordTransmissionResult(success) {
    if (success) {
      if (this.cbState === CircuitBreakerState.HALF_OPEN) {
        this.cbState = CircuitBreakerState.CLOSED;
        this.cbFailures = 0;
        this.emit('circuit_breaker:closed', { edgeId: this.id });
      } else if (this.cbState === CircuitBreakerState.CLOSED) {
        this.cbFailures = 0;
      }
    } else {
      this.cbFailures++;
      if (this.cbState === CircuitBreakerState.HALF_OPEN || this.cbFailures >= this.config.cbFailureThreshold) {
        this.cbState = CircuitBreakerState.OPEN;
        this.cbTimerMs = this.config.cbResetTimeoutMs;
        this.emit('circuit_breaker:open', { edgeId: this.id });
      }
    }
  }

  getSnapshot() {
    return {
      id: this.id,
      source: this.sourceId,
      target: this.targetId,
      status: this.status,
      cbState: this.cbState,
      inTransitCount: this.inTransit.length,
      metrics: this.metrics,
    };
  }
}

module.exports = { Edge, CircuitBreakerState, EdgeStatus };