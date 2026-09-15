const NodeFactory = require('../models/NodeFactory');
const { Edge } = require('../models/Edge');

class BlueprintLoader {
  static load(engine, templateName) {
    const blueprint = this.getTemplate(templateName);
    if (!blueprint) return;

    try {
      engine.setTraffic(false);
      engine.clearTopology();

      if (blueprint.nodes) {
        blueprint.nodes.forEach(data => {
          const node = NodeFactory.createNode(data.id, data.label, data.type, data.config || {});
          engine.addNode(node);
        });
      }

      if (blueprint.edges) {
        blueprint.edges.forEach(data => {
          const edge = new Edge(data.id, data.source, data.target, data.config || {});
          engine.addEdge(edge);
        });
      }

      engine.emit('system:notification', { message: `Successfully loaded blueprint: ${blueprint.name}` });
    } catch (error) {
      console.error('[BlueprintLoader] Failed to load blueprint:', error);
    }
  }

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