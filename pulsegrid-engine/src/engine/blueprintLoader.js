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
          { id: 'mq-events', label: 'Event Broker', type: 'broker' },
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
      },
      iot_pipeline: {
        name: 'IoT Telemetry Pipeline',
        nodes: [
          { id: 'gw-iot', label: 'IoT Edge Gateway', type: 'gateway' },
          { id: 'mq-mqtt', label: 'MQTT Broker', type: 'broker', config: { maxQueueSize: 200 } },
          { id: 'wrk-stream-1', label: 'Stream Processor A', type: 'worker' },
          { id: 'wrk-stream-2', label: 'Stream Processor B', type: 'worker' },
          { id: 'db-time', label: 'Time-Series DB', type: 'db' }
        ],
        edges: [
          { id: 'iot1', source: 'gw-iot', target: 'mq-mqtt' },
          { id: 'iot2', source: 'mq-mqtt', target: 'wrk-stream-1' },
          { id: 'iot3', source: 'mq-mqtt', target: 'wrk-stream-2' },
          { id: 'iot4', source: 'wrk-stream-1', target: 'db-time' },
          { id: 'iot5', source: 'wrk-stream-2', target: 'db-time' }
        ]
      },
      ride_sharing: {
        name: 'Ride-Sharing Matchmaker',
        nodes: [
          { id: 'gw-app', label: 'Mobile Gateway', type: 'gateway' },
          { id: 'auth-jwt', label: 'Token Service', type: 'auth' },
          { id: 'svc-loc', label: 'Location Service', type: 'service' },
          { id: 'svc-match', label: 'Matching Engine', type: 'service', config: { baseLatency: 35 } },
          { id: 'svc-price', label: 'Surge Pricing', type: 'service' },
          { id: 'db-geo', label: 'Spatial DB', type: 'db' }
        ],
        edges: [
          { id: 'rs1', source: 'gw-app', target: 'auth-jwt' },
          { id: 'rs2', source: 'gw-app', target: 'svc-loc' },
          { id: 'rs3', source: 'gw-app', target: 'svc-match' },
          { id: 'rs4', source: 'gw-app', target: 'svc-price' },
          { id: 'rs5', source: 'svc-loc', target: 'db-geo' },
          { id: 'rs6', source: 'svc-match', target: 'db-geo' }
        ]
      },
      trading_engine: {
        name: 'Financial Trading Engine',
        nodes: [
          { id: 'gw-fix', label: 'FIX Gateway', type: 'gateway', config: { baseLatency: 2 } },
          { id: 'auth-mfa', label: 'Strict Auth', type: 'auth' },
          { id: 'svc-book', label: 'Order Book', type: 'service', config: { concurrencyLimit: 30 } },
          { id: 'mq-audit', label: 'Audit Trail Queue', type: 'broker' },
          { id: 'wrk-settle', label: 'Settlement Worker', type: 'worker' },
          { id: 'db-ledger', label: 'Immutable Ledger', type: 'db' }
        ],
        edges: [
          { id: 'tr1', source: 'gw-fix', target: 'auth-mfa' },
          { id: 'tr2', source: 'gw-fix', target: 'svc-book' },
          { id: 'tr3', source: 'svc-book', target: 'mq-audit' },
          { id: 'tr4', source: 'mq-audit', target: 'wrk-settle' },
          { id: 'tr5', source: 'wrk-settle', target: 'db-ledger' }
        ]
      },
      distributed_logging: {
        name: 'Distributed Logging (SIEM)',
        nodes: [
          { id: 'gw-ingest', label: 'Log Ingest', type: 'gateway' },
          { id: 'mq-kafka', label: 'Kafka Event Bus', type: 'broker', config: { maxQueueSize: 500 } },
          { id: 'wrk-log-1', label: 'Logstash Indexer 1', type: 'worker' },
          { id: 'wrk-log-2', label: 'Logstash Indexer 2', type: 'worker' },
          { id: 'db-elastic', label: 'Elastic Search DB', type: 'db' }
        ],
        edges: [
          { id: 'dl1', source: 'gw-ingest', target: 'mq-kafka' },
          { id: 'dl2', source: 'mq-kafka', target: 'wrk-log-1' },
          { id: 'dl3', source: 'mq-kafka', target: 'wrk-log-2' },
          { id: 'dl4', source: 'wrk-log-1', target: 'db-elastic' },
          { id: 'dl5', source: 'wrk-log-2', target: 'db-elastic' }
        ]
      },
      raft_cluster: {
        name: 'Raft Consensus Cluster',
        nodes: [
          { id: 'gw-raft', label: 'Client Gateway', type: 'gateway' },
          { id: 'raft-leader', label: 'Raft Leader', type: 'db', config: { baseLatency: 10 } },
          { id: 'raft-node-1', label: 'Follower Node A', type: 'db' },
          { id: 'raft-node-2', label: 'Follower Node B', type: 'db' },
          { id: 'raft-node-3', label: 'Follower Node C', type: 'db' }
        ],
        edges: [
          { id: 'raft1', source: 'gw-raft', target: 'raft-leader' },
          // Leader replicates to followers
          { id: 'raft2', source: 'raft-leader', target: 'raft-node-1' },
          { id: 'raft3', source: 'raft-leader', target: 'raft-node-2' },
          { id: 'raft4', source: 'raft-leader', target: 'raft-node-3' },
          // Internal cluster heartbeats (forming a ring for visual layout)
          { id: 'raft5', source: 'raft-node-1', target: 'raft-node-2', config: { latencyMs: 5 } },
          { id: 'raft6', source: 'raft-node-2', target: 'raft-node-3', config: { latencyMs: 5 } },
          { id: 'raft7', source: 'raft-node-3', target: 'raft-node-1', config: { latencyMs: 5 } }
        ]
      }
    };

    return templates[templateName] || null;
  }
}

module.exports = BlueprintLoader;