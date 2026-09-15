class PacketPool {
  constructor() {
    this.pool = [];
    this.packetIdCounter = 0;
  }

  /**
   * Retrieves a clean packet from the pool or creates a new one if empty
   */
  acquire(sourceId, targetId, payload = {}) {
    let packet;
    
    if (this.pool.length > 0) {
      packet = this.pool.pop();
    } else {
      packet = { id: `pkt-${++this.packetIdCounter}` };
    }

    packet.source = sourceId;
    packet.destination = targetId;
    packet.payload = payload;
    packet.history = [];
    packet.createdAt = Date.now();
    
    return packet;
  }

  /**
   * Wipes a packet clean and returns it to the pool array
   */
  release(packet) {
    if (!packet) return;
    
    packet.source = null;
    packet.destination = null;
    packet.payload = null;
    packet.history = null;
    packet.createdAt = null;
    
    this.pool.push(packet);
  }
}

// Export as a Singleton so the entire engine shares one memory pool
module.exports = new PacketPool();