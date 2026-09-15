const Faults = require('./faults');
const Scenarios = require('./scenarios');

class ChaosRegistry {
  constructor() {
    this.faults = new Map(Object.entries(Faults));
    this.scenarios = new Map(Object.entries(Scenarios));
  }

  executeFault(engine, faultId, targetNodeId, params = {}) {
    const fault = this.faults.get(faultId);
    const node = engine.nodes.get(targetNodeId);

    if (fault && node) {
      fault.execute(node, params);
      engine.emit('system:notification', { message: `Injected ${fault.name} into ${node.label}.` });
    }
  }

  clearFault(engine, faultId, targetNodeId) {
    const fault = this.faults.get(faultId);
    const node = engine.nodes.get(targetNodeId);

    if (fault && node) {
      fault.clear(node);
      engine.emit('system:notification', { message: `Cleared ${fault.name} from ${node.label}.` });
    }
  }

  executeScenario(engine, scenarioId) {
    const scenario = this.scenarios.get(scenarioId);
    if (scenario) scenario.execute(engine);
  }
}

module.exports = new ChaosRegistry();