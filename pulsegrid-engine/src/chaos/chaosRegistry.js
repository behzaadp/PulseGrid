const Faults = require('./faults');
const Scenarios = require('./scenarios');
const simulationLoop = require('../engine/simulationLoop');
const eventBus = require('../engine/eventBus');

class ChaosRegistry {
  constructor() {
    this.faults = new Map(Object.entries(Faults));
    this.scenarios = new Map(Object.entries(Scenarios));
  }

  /**
   * Triggers a specific node fault.
   * @param {string} faultId - The ID of the fault (e.g., 'memory_leak')
   * @param {string} targetNodeId - The ID of the node to attack
   * @param {object} params - Optional parameters to override defaults
   */
  executeFault(faultId, targetNodeId, params = {}) {
    const fault = this.faults.get(faultId);
    const node = simulationLoop.nodes.get(targetNodeId);

    if (!fault) {
      console.warn(`[ChaosRegistry] Unknown fault type: ${faultId}`);
      return;
    }
    if (!node) {
      console.warn(`[ChaosRegistry] Target node not found: ${targetNodeId}`);
      return;
    }

    fault.execute(node, params);
    eventBus.emit('system:notification', { message: `Injected ${fault.name} into ${node.label}.` });
  }

  /**
   * Clears a specific fault from a node.
   */
  clearFault(faultId, targetNodeId) {
    const fault = this.faults.get(faultId);
    const node = simulationLoop.nodes.get(targetNodeId);

    if (fault && node) {
      fault.clear(node);
      eventBus.emit('system:notification', { message: `Cleared ${fault.name} from ${node.label}.` });
    }
  }

  /**
   * Executes a system-wide catastrophic scenario.
   * @param {string} scenarioId - The ID of the scenario (e.g., 'thanos_snap')
   */
  executeScenario(scenarioId) {
    const scenario = this.scenarios.get(scenarioId);
    
    if (!scenario) {
      console.warn(`[ChaosRegistry] Unknown scenario: ${scenarioId}`);
      return;
    }

    scenario.execute();
  }

  /**
   * Returns a JSON-friendly catalog of all available chaos capabilities.
   * Useful for dynamically populating the UI Chaos Panel.
   */
  getCatalog() {
    const faultCatalog = Array.from(this.faults.values()).map(f => ({
      id: f.id,
      name: f.name,
      description: f.description
    }));

    const scenarioCatalog = Array.from(this.scenarios.values()).map(s => ({
      id: s.id,
      name: s.name,
      description: s.description
    }));

    return {
      faults: faultCatalog,
      scenarios: scenarioCatalog
    };
  }
}

// Export as Singleton
module.exports = new ChaosRegistry();