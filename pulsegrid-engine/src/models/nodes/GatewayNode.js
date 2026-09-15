const { BaseNode } = require('./BaseNode');

class GatewayNode extends BaseNode {
  constructor(id, label, config = {}) {
    super(id, label, 'gateway', {
      baseLatency: 8,          // Fast reverse proxy overhead
      concurrencyLimit: 25,    // High ingress bandwidth
      maxQueueSize: 100,
      ...config,
    });
  }
}

module.exports = GatewayNode;