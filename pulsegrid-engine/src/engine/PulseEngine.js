const EventEmitter = require('events');
const packetPool = require('../models/PacketPool');

const PHYSICS_TICK_RATE_MS = 20;
const BROADCAST_TICK_RATE_MS = 100;

class PulseEngine extends EventEmitter {
  constructor(sessionId) {
    super();
    this.sessionId = sessionId;
    
    // Isolated Topology Maps
    this.nodes = new Map();
    this.edges = new Map();
    
    this.physicsInterval = null;
    this.broadcastInterval = null;
    
    this.lastPhysicsTick = Date.now();
    this.previousState = { nodes: {}, edges: {} };
    
    this.isRunning = false;
    this.isTrafficActive = false;
    this.trafficRatePerSec = 20; 
    this.trafficAccumulator = 0;
  }

  // --- Topology CRUD Operations ---

  addNode(node) {
    this.nodes.set(node.id, node);
    node.on('packet:processed', (data) => this.handlePacketProcessed(data));
    node.on('packet:failed', (data) => packetPool.release(data.packet));
    node.on('packet:dropped', (data) => packetPool.release(data.packet));
    this.emit('topology:changed');
  }

  removeNode(nodeId) {
    this.nodes.delete(nodeId);
    // Remove orphaned edges
    for (const [edgeId, edge] of this.edges) {
      if (edge.sourceId === nodeId || edge.targetId === nodeId) {
        this.edges.delete(edgeId);
      }
    }
    this.emit('topology:changed');
  }

  updateNodeLabel(nodeId, newLabel) {
    const node = this.nodes.get(nodeId);
    if (node) {
      node.label = newLabel;
      this.emit('topology:changed');
    }
  }

  addEdge(edge) {
    this.edges.set(edge.id, edge);
    this.emit('topology:changed');
  }

  removeEdge(edgeId) {
    this.edges.delete(edgeId);
    this.emit('topology:changed');
  }

  clearTopology() {
    this.nodes.clear();
    this.edges.clear();
    this.previousState = { nodes: {}, edges: {} };
    this.emit('topology:changed');
  }

  // --- Engine Loops ---

  start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.lastPhysicsTick = Date.now();
    this.physicsInterval = setInterval(() => this.physicsTick(), PHYSICS_TICK_RATE_MS);
    this.broadcastInterval = setInterval(() => this.broadcastTick(), BROADCAST_TICK_RATE_MS);
  }

  stop() {
    this.isRunning = false;
    clearInterval(this.physicsInterval);
    clearInterval(this.broadcastInterval);
  }

  physicsTick() {
    const now = Date.now();
    const deltaMs = now - this.lastPhysicsTick;
    this.lastPhysicsTick = now;

    this.generateTraffic(deltaMs);

    for (const edge of this.edges.values()) {
      const targetNode = this.nodes.get(edge.targetId);
      edge.tick(deltaMs, targetNode, packetPool);
    }

    for (const node of this.nodes.values()) {
      node.tick(deltaMs);
    }
  }

  broadcastTick() {
    const currentState = { nodes: {}, edges: {} };
    const diff = { nodes: {}, edges: {} };
    let hasChanges = false;

    for (const [id, node] of this.nodes) {
      const snap = node.getSnapshot();
      currentState.nodes[id] = snap;
      if (JSON.stringify(snap) !== JSON.stringify(this.previousState.nodes[id])) {
        diff.nodes[id] = snap;
        hasChanges = true;
      }
    }

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
      this.emit('broadcast:delta', diff);
    }
  }

  // --- Networking & Traffic ---

  handlePacketProcessed({ nodeId, packet }) {
    const outboundEdges = Array.from(this.edges.values()).filter(e => e.sourceId === nodeId);
    if (outboundEdges.length === 0) {
      packetPool.release(packet);
      return;
    }
    const selectedEdge = outboundEdges[Math.floor(Math.random() * outboundEdges.length)];
    selectedEdge.transmit(packet, packetPool);
  }

  generateTraffic(deltaMs) {
    if (!this.isTrafficActive) return;
    this.trafficAccumulator += (this.trafficRatePerSec * deltaMs) / 1000;
    const packetsToSpawn = Math.floor(this.trafficAccumulator);
    this.trafficAccumulator -= packetsToSpawn;

    if (packetsToSpawn <= 0) return;

    const gateways = Array.from(this.nodes.values()).filter(n => n.type === 'gateway');
    const entryNodes = gateways.length > 0 ? gateways : Array.from(this.nodes.values());
    if (entryNodes.length === 0) return;

    for (let i = 0; i < packetsToSpawn; i++) {
      const entryNode = entryNodes[Math.floor(Math.random() * entryNodes.length)];
      const packet = packetPool.acquire('user_client', entryNode.id, { endpoint: '/api/data' });
      const accepted = entryNode.receivePacket(packet);
      if (!accepted) packetPool.release(packet);
    }
  }
  
  setTraffic(active, rate = 20) {
    this.isTrafficActive = active;
    this.trafficRatePerSec = rate;
  }

  getFullSnapshot() {
    return this.previousState;
  }
}

module.exports = PulseEngine;