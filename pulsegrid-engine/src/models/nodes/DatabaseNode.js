const { BaseNode } = require('./BaseNode');

class DatabaseNode extends BaseNode {
  constructor(id, label, config = {}) {
    super(id, label, 'db', {
      baseLatency: 45,        // Disk I/O baseline
      concurrencyLimit: 4,     // Strict connection pool
      maxQueueSize: 25,
      baseMemory: 35,          // In-memory cache footprint
      ...config,
    });
    this.queryCache = new Map();
  }
}

module.exports = DatabaseNode;