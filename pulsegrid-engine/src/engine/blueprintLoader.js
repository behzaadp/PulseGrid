const simulationLoop = require('./simulationLoop');
const NodeFactory = require('../models/NodeFactory');
const { Edge } = require('../models/Edge');
const eventBus = require('./eventBus');

class BlueprintLoader {
  /**
   * Loads a predefined JSON topology into the simulation engine.
   * @param {object} blueprint - The JSON template containing nodes and edges.
   */
  static load(blueprint) {
    try {
      // 1. Halt traffic and wipe the canvas clean
      simulationLoop.setTraffic(false);
      simulationLoop.clearTopology();

      // 2. Instantiate and add all nodes using the Factory Pattern
      if (blueprint.nodes && Array.isArray(blueprint.nodes)) {
        blueprint.nodes.forEach(nodeData => {
          const node = NodeFactory.createNode(
            nodeData.id,
            nodeData.label,
            nodeData.type,
            nodeData.config || {}
          );
          simulationLoop.addNode(node);
        });
      }

      // 3. Instantiate and wire up all network links
      if (blueprint.edges && Array.isArray(blueprint.edges)) {
        blueprint.edges.forEach(edgeData => {
          const edge = new Edge(
            edgeData.id,
            edgeData.source,
            edgeData.target,
            edgeData.config || {}
          );
          simulationLoop.addEdge(edge);
        });
      }

      eventBus.emit('system:notification', { message: `Successfully loaded blueprint: ${blueprint.name}` });
      console.log(`[BlueprintLoader] Loaded topology: ${blueprint.name}`);
      
    } catch (error) {
      console.error('[BlueprintLoader] Failed to load blueprint:', error);
      eventBus.emit('system:notification', { message: 'Failed to load architecture blueprint due to an error.' });
    }
  }

  /**
   * Central repository for pre-built topologies.
   */
  static getTemplate(templateName) {
    const templates = {
      ecommerce: {
        name: 'E-Commerce Microservices',
        nodes: [
          { id: 'gw-api', label: 'API Gateway', type: 'gateway' },
          { id: 'svc-auth', label: 'Auth Service', type: 'auth' },
          { id: 'svc-catalog', label: 'Product Catalog', type: 'service' },
          { id: 'svc-orders', label: 'Order Service', type: 'service' },
          { id: 'mq-events', label: 'RabbitMQ', type: 'broker' },
          { id: 'wrk-payment', label: 'Payment Worker', type: 'worker' },
          { id: 'db-orders', label: 'Orders DB', type: 'db' },
          { id: 'db-catalog', label: 'Products DB', type: 'db' }
        ],
        edges: [
          { id: 'e1', source: 'gw-api', target: 'svc-auth' },
          { id: 'e2', source: 'gw-api', target: 'svc-catalog' },
          { id: 'e3', source: 'gw-api', target: 'svc-orders' },
          { id: 'e4', source: 'svc-catalog', target: 'db-catalog' },
          { id: 'e5', source: 'svc-orders', target: 'mq-events' },
          { id: 'e6', source: 'mq-events', target: 'wrk-payment' },
          { id: 'e7', source: 'wrk-payment', target: 'db-orders' }
        ]
      },
      social_media: {
        name: 'Social Media Feed',
        nodes: [
          { id: 'gw-main', label: 'Ingress Gateway', type: 'gateway' },
          { id: 'svc-user', label: 'User Service', type: 'auth' },
          { id: 'svc-feed', label: 'Feed Generator', type: 'worker', config: { concurrencyLimit: 15 } },
          { id: 'db-graph', label: 'Graph Database', type: 'db' },
          { id: 'db-cache', label: 'Redis Cache', type: 'db', config: { baseLatency: 2 } }
        ],
        edges: [
          { id: 's1', source: 'gw-main', target: 'svc-user' },
          { id: 's2', source: 'gw-main', target: 'svc-feed' },
          { id: 's3', source: 'svc-feed', target: 'db-cache' },
          { id: 's4', source: 'svc-feed', target: 'db-graph' }
        ]
      }
    };

    return templates[templateName] || null;
  }
}

module.exports = BlueprintLoader;