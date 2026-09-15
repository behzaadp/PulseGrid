const NodeFactory = require('../models/NodeFactory');
const { Edge } = require('../models/Edge');
const ChaosRegistry = require('../chaos/chaosRegistry');
const BlueprintLoader = require('../engine/blueprintLoader');

class MessageRouter {
  static route(rawMessage, ws, engine) {
    try {
      const message = JSON.parse(rawMessage);
      const { type, payload } = message;

      switch (type) {
        case 'ENGINE_START': engine.start(); break;
        case 'ENGINE_STOP': engine.stop(); break;
        case 'SET_TRAFFIC': engine.setTraffic(payload.active, payload.rate); break;

        case 'ADD_NODE': {
          const node = NodeFactory.createNode(payload.id, payload.label, payload.nodeType, payload.config);
          engine.addNode(node);
          break;
        }
        case 'REMOVE_NODE': engine.removeNode(payload.id); break;
        case 'UPDATE_NODE_LABEL': engine.updateNodeLabel(payload.id, payload.label); break;

        case 'ADD_EDGE': {
          const edge = new Edge(payload.id, payload.sourceId, payload.targetId, payload.config);
          engine.addEdge(edge);
          break;
        }
        case 'REMOVE_EDGE': engine.removeEdge(payload.id); break;
        case 'CLEAR_TOPOLOGY': engine.clearTopology(); break;

        case 'NODE_KILL': {
          const node = engine.nodes.get(payload.id);
          if (node) node.kill('USER_INITIATED');
          break;
        }
        case 'NODE_RESTART': {
          const node = engine.nodes.get(payload.id);
          if (node) node.restart();
          break;
        }
        case 'INJECT_FAULT': ChaosRegistry.executeFault(engine, payload.faultType, payload.id, payload.params); break;
        case 'CLEAR_FAULT': ChaosRegistry.clearFault(engine, payload.faultType, payload.id); break;
        case 'EXECUTE_SCENARIO': ChaosRegistry.executeScenario(engine, payload.scenarioId); break;
        case 'LOAD_BLUEPRINT': BlueprintLoader.load(engine, payload.templateName); break;

        default:
          console.warn(`[Router] Unknown message type received: ${type}`);
      }
    } catch (error) {
      console.error('[Router] Error parsing or routing message:', error);
    }
  }
}

module.exports = MessageRouter;