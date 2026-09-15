const { BaseNode } = require('./BaseNode');

class WorkerNode extends BaseNode {
  constructor(id, label, config = {}) {
    super(id, label, 'worker', {
      baseLatency: 120,        // Long processing tasks
      concurrencyLimit: 3,     // Heavy resource consumption
      baseCpu: 25,
      baseMemory: 40,
      ...config,
    });
  }
}

module.exports = WorkerNode;