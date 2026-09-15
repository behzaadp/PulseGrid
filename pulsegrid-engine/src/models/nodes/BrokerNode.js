const { BaseNode } = require('./BaseNode');

class BrokerNode extends BaseNode {
  constructor(id, label, config = {}) {
    super(id, label, 'broker', {
      baseLatency: 10,         // Fast network acknowledgment
      concurrencyLimit: 20,    // High throughput
      maxQueueSize: 150,       // Large backlog buffer
      baseCpu: 5,
      ...config,
    });
    this.bufferedMessages = [];
  }
}

module.exports = BrokerNode;