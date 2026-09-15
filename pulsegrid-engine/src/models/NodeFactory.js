const GatewayNode = require('./nodes/GatewayNode');
const AuthNode = require('./nodes/AuthNode');
const DatabaseNode = require('./nodes/DatabaseNode');
const BrokerNode = require('./nodes/BrokerNode');
const WorkerNode = require('./nodes/WorkerNode');
const GenericNode = require('./nodes/GenericNode');

class NodeFactory {
  /**
   * Dynamically instantiates the correct node subclass
   * @param {string} id - Unique identifier
   * @param {string} label - UI Display name
   * @param {string} type - Node classification
   * @param {object} config - Custom configuration overrides
   */
  static createNode(id, label, type, config = {}) {
    switch (type) {
      case 'gateway':
        return new GatewayNode(id, label, config);
      case 'auth':
        return new AuthNode(id, label, config);
      case 'db':
      case 'database':
        return new DatabaseNode(id, label, config);
      case 'broker':
      case 'queue':
        return new BrokerNode(id, label, config);
      case 'worker':
        return new WorkerNode(id, label, config);
      case 'service':
      default:
        // Generic Microservice acts as the fallback for custom user nodes
        return new GenericNode(id, label, config);
    }
  }
}

module.exports = NodeFactory;