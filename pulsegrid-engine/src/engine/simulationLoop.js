const eventBus = require('./eventBus');
const packetPool = require('../models/PacketPool');

const PHYSICS_TICK_RATE_MS = 20;  // 50Hz (Physics & Traffic)
const BROADCAST_TICK_RATE_MS = 100; // 10Hz (UI Updates)

class SimulationLoop {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    
    this.physicsInterval = null;
    this.broadcastInterval = null;
    
    this.lastPhysicsTick = Date.now();
    this.previousState = { nodes: {}, edges: {} };
    
    this.isRunning = false;
    
    // Traffic generator properties
    this.isTrafficActive = false;
    this.trafficRatePerSec = 20; 
    this.trafficAccumulator = 0;
  }

  // --- Topology Management ---

  addNode(node) {
    this.nodes.set(node.id, node);
    
    // Event bindings for routing and memory management
    node.on('packet:processed', (data) => this.handlePacketProcessed(data));
    node.on('packet:failed', (data) => packetPool.release(data.packet));
    node.on('packet:dropped', (data) => packetPool.release(data.packet));
    
    eventBus.emit('topology:changed');
  }

  removeNode(nodeId) {
    this.nodes.delete(nodeId);
    // Remove orphaned edges
    for (const [edgeId, edge] of this.edges) {
      if (edge.sourceId === nodeId || edge.targetId === nodeId) {
        this.edges.delete(edgeId);
      }
    }
    eventBus.emit('topology:changed');
  }

  addEdge(edge) {
    this.edges.set(edge.id, edge);
    eventBus.emit('topology:changed');
  }

  removeEdge(edgeId) {
    this.edges.delete(edgeId);
    eventBus.emit('topology:changed');
  }

  // --- Core Loops ---

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastPhysicsTick = Date.now();

    this.physicsInterval = setInterval(() => this.physicsTick(), PHYSICS_TICK_RATE_MS);
    this.broadcastInterval = setInterval(() => this.broadcastTick(), BROADCAST_TICK_RATE_MS);
    
    console.log('Simulation Engine started.');
  }

  stop() {
    this.isRunning = false;
    clearInterval(this.physicsInterval);
    clearInterval(this.broadcastInterval);
    console.log('Simulation Engine stopped.');
  }

  physicsTick() {
    const now = Date.now();
    const deltaMs = now - this.lastPhysicsTick;
    this.lastPhysicsTick = now;

    // 1. Generate inbound simulated user traffic
    this.generateTraffic(deltaMs);

    // 2. Tick Edges (moves packets across network links)
    for (const edge of this.edges.values()) {
      const targetNode = this.nodes.get(edge.targetId);
      edge.tick(deltaMs, targetNode, packetPool);
    }

    // 3. Tick Nodes (processes queues, computes faults and Apdex)
    for (const node of this.nodes.values()) {
      node.tick(deltaMs);
    }
  }

  /**
   * Computes delta-encoded updates to preserve WebSocket bandwidth
   */
  broadcastTick() {
    const currentState = { nodes: {}, edges: {} };
    const diff = { nodes: {}, edges: {} };
    let hasChanges = false;

    // Sweep Nodes
    for (const [id, node] of this.nodes) {
      const snap = node.getSnapshot();
      currentState.nodes[id] = snap;
      
      // Shallow diff to determine if state mutated since last broadcast
      if (JSON.stringify(snap) !== JSON.stringify(this.previousState.nodes[id])) {
        diff.nodes[id] = snap;
        hasChanges = true;
      }
    }

    // Sweep Edges
    for (const [id, edge] of this.edges) {
      const snap = edge.getSnapshot();
      currentState.edges[id] = snap;
      
      if (JSON.stringify(snap) !== JSON.stringify(this.previousState.edges[id])) {
        diff.edges[id] = snap;
        hasChanges = true;
      }
    }

    this.previousState = currentState;

    if (hasChanges) {
      eventBus.emit('broadcast:delta', diff);
    }
  }

  // --- Network Routing & Traffic ---

  /**
   * Routes a successfully processed packet to the next node in the graph
   */
  handlePacketProcessed({ nodeId, packet }) {
    // Find all network links originating from this node
    const outboundEdges = Array.from(this.edges.values()).filter(e => e.sourceId === nodeId);
    
    if (outboundEdges.length === 0) {
      // Packet reached the end of the topology (e.g., Database saved it)
      packetPool.release(packet);
      return;
    }

    // Basic Load Balancing: Pick a random outbound edge
    const selectedEdge = outboundEdges[Math.floor(Math.random() * outboundEdges.length)];
    selectedEdge.transmit(packet, packetPool);
  }

  /**
   * Injects packets at Gateway nodes to simulate user load
   */
  generateTraffic(deltaMs) {
    if (!this.isTrafficActive) return;

    // Calculate how many packets to spawn this tick
    this.trafficAccumulator += (this.trafficRatePerSec * deltaMs) / 1000;
    const packetsToSpawn = Math.floor(this.trafficAccumulator);
    this.trafficAccumulator -= packetsToSpawn;

    if (packetsToSpawn <= 0) return;

    // Find ingress points (API Gateways)
    const gateways = Array.from(this.nodes.values()).filter(n => n.type === 'gateway');
    
    // If no gateways exist, fallback to injecting at random services
    const entryNodes = gateways.length > 0 ? gateways : Array.from(this.nodes.values());
    if (entryNodes.length === 0) return;

    for (let i = 0; i < packetsToSpawn; i++) {
      const entryNode = entryNodes[Math.floor(Math.random() * entryNodes.length)];
      const packet = packetPool.acquire('user_client', entryNode.id, { endpoint: '/api/data' });
      
      const accepted = entryNode.receivePacket(packet);
      if (!accepted) {
        packetPool.release(packet);
      }
    }
  }
  
  // --- Global Engine Controls ---
  
  setTraffic(active, rate = 20) {
    this.isTrafficActive = active;
    this.trafficRatePerSec = rate;
  }

  /**
   * Emits a full snapshot bypassing the delta check (used when a new UI client connects)
   */
  getFullSnapshot() {
    return this.previousState;
  }
  
  clearTopology() {
    this.nodes.clear();
    this.edges.clear();
    this.previousState = { nodes: {}, edges: {} };
    eventBus.emit('topology:changed');
  }
}

// Export as Singleton to maintain one unified physics instance
module.exports = new SimulationLoop();