const { BaseNode } = require('./BaseNode');

class GenericNode extends BaseNode {
  constructor(id, label, config = {}) {
    super(id, label, 'service', {
      baseLatency: 25,
      concurrencyLimit: 8,
      maxQueueSize: 40,
      ...config,
    });
  }
}

module.exports = GenericNode;