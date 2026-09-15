const simulationLoop = require('../engine/simulationLoop');
const NodeFactory = require('../models/NodeFactory');
const { Edge } = require('../models/Edge');

class MessageRouter {
  /**
   * Routes incoming JSON payloads from the WebSocket client
   * @param {string} rawMessage - Stringified JSON from the frontend
   * @param {WebSocket} ws - The client connection instance
   */
  static route(rawMessage, ws) {
    try {
      const message = JSON.parse(rawMessage);
      const { type, payload } = message;

      switch (type) {
        // --- Engine Controls ---
        case 'ENGINE_START':
          simulationLoop.start();
          break;
        case 'ENGINE_STOP':
          simulationLoop.stop();
          break;
        case 'SET_TRAFFIC':
          simulationLoop.setTraffic(payload.active, payload.rate);
          break;

        // --- Topology Building ---
        case 'ADD_NODE': {
          const { id, label, nodeType, config } = payload;
          const node = NodeFactory.createNode(id, label, nodeType, config);
          simulationLoop.addNode(node);
          break;
        }
        case 'REMOVE_NODE':
          simulationLoop.removeNode(payload.id);
          break;
        case 'ADD_EDGE': {
          const { id, sourceId, targetId, config } = payload;
          const edge = new Edge(id, sourceId, targetId, config);
          simulationLoop.addEdge(edge);
          break;
        }
        case 'REMOVE_EDGE':
          simulationLoop.removeEdge(payload.id);
          break;
        case 'CLEAR_TOPOLOGY':
          simulationLoop.clearTopology();
          break;

        // --- Chaos & Fault Injection ---
        case 'NODE_KILL': {
          const node = simulationLoop.nodes.get(payload.id);
          if (node) node.kill('USER_INITIATED');
          break;
        }
        case 'NODE_RESTART': {
          const node = simulationLoop.nodes.get(payload.id);
          if (node) node.restart();
          break;
        }
        case 'INJECT_FAULT': {
          // Payload expects { id: 'node_id', faultType: 'memory_leak', params: {} }
          const node = simulationLoop.nodes.get(payload.id);
          if (node) node.injectFault(payload.faultType, payload.params);
          break;
        }
        case 'CLEAR_FAULT': {
          const node = simulationLoop.nodes.get(payload.id);
          if (node) node.clearFault(payload.faultType);
          break;
        }

        default:
          console.warn(`[Router] Unknown message type received: ${type}`);
      }
    } catch (error) {
      console.error('[Router] Error parsing or routing message:', error);
    }
  }
}

module.exports = MessageRouter;