const NodeFactory = require('../models/NodeFactory');
const { Edge } = require('../models/Edge');

class K8sController {
  constructor(engine) {
    this.engine = engine;
    this.enabled = false;
    this.desiredNodes = new Map();
    this.desiredEdges = new Map();
    this.timers = new Map(); // Tracks both restart and respawn countdowns
  }

  setEnabled(isEnabled) {
    this.enabled = isEnabled;
    if (isEnabled) {
      // 1. Take a snapshot of the current canvas as the "Desired ReplicaSet State"
      this.desiredNodes.clear();
      this.desiredEdges.clear();
      this.engine.nodes.forEach(n => {
        this.desiredNodes.set(n.id, { id: n.id, label: n.label, type: n.type, config: n.config });
      });
      this.engine.edges.forEach(e => {
        this.desiredEdges.set(e.id, { id: e.id, sourceId: e.sourceId, targetId: e.targetId, config: e.config });
      });
      this.engine.emit('system:notification', { message: 'K8s Auto-Recovery Enabled. Desired state locked.' });
    } else {
      this.timers.clear();
      this.engine.emit('system:notification', { message: 'K8s Auto-Recovery Disabled.' });
    }
  }

  tick(deltaMs) {
    if (!this.enabled) return;

    // 2. Check for DEAD nodes (e.g. killed by Thanos Snap)
    for (const [id, node] of this.engine.nodes) {
      if (node.status === 'DEAD') {
        this.processTimer(id, deltaMs, 3000, () => {
          node.restart();
          this.engine.emit('system:notification', { message: `K8s: Restarted dead Pod ${node.label}` });
        });
      } else {
        this.timers.delete(id); // Clear timer if healthy
      }
    }

    // 3. Check for MISSING nodes (e.g. deleted by the user)
    for (const [id, desiredNode] of this.desiredNodes) {
      if (!this.engine.nodes.has(id)) {
        this.processTimer(`missing-${id}`, deltaMs, 3000, () => {
          // Recreate the missing node
          const newNode = NodeFactory.createNode(desiredNode.id, desiredNode.label, desiredNode.type, desiredNode.config);
          newNode.status = 'RECOVERING';
          newNode.recoveryRemainingMs = newNode.config.recoveryTimeMs || 4000;
          this.engine.addNode(newNode);
          this.engine.emit('system:notification', { message: `K8s: Rescheduled missing Pod ${desiredNode.label}` });
          
          // Re-wire severed network edges
          for (const [edgeId, desiredEdge] of this.desiredEdges) {
            if ((desiredEdge.sourceId === id || desiredEdge.targetId === id) && !this.engine.edges.has(edgeId)) {
              // Ensure both endpoints exist before reconnecting the cable
              if (this.engine.nodes.has(desiredEdge.sourceId) && this.engine.nodes.has(desiredEdge.targetId)) {
                 const newEdge = new Edge(desiredEdge.id, desiredEdge.sourceId, desiredEdge.targetId, desiredEdge.config);
                 this.engine.addEdge(newEdge);
              }
            }
          }
        });
      } else {
         this.timers.delete(`missing-${id}`);
      }
    }
  }

  processTimer(key, deltaMs, threshold, action) {
    let current = this.timers.get(key) || 0;
    current += deltaMs;
    if (current >= threshold) {
      action();
      this.timers.delete(key);
    } else {
      this.timers.set(key, current);
    }
  }
}

module.exports = K8sController;