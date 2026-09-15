const simulationLoop = require('../engine/simulationLoop');
const { EdgeStatus } = require('../models/Edge');
const eventBus = require('../engine/eventBus');

/**
 * System-wide catastrophic events that affect the entire topology.
 */
const Scenarios = {
  thanos_snap: {
    id: 'thanos_snap',
    name: 'Thanos Snap',
    description: 'Randomly and instantly kills 50% of all healthy nodes in the system.',
    execute: () => {
      const activeNodes = Array.from(simulationLoop.nodes.values()).filter(n => n.status !== 'DEAD');
      
      // Shuffle the array
      for (let i = activeNodes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeNodes[i], activeNodes[j]] = [activeNodes[j], activeNodes[i]];
      }

      // Kill half
      const half = Math.ceil(activeNodes.length / 2);
      const doomedNodes = activeNodes.slice(0, half);
      
      doomedNodes.forEach(node => {
        node.kill('THANOS_SNAP');
      });

      eventBus.emit('system:notification', { message: `Thanos Snap executed: ${half} nodes wiped out.` });
    }
  },

  split_brain: {
    id: 'split_brain',
    name: 'Network Partition (Split Brain)',
    description: 'Slices the network in half, severing all edges between Group A and Group B.',
    execute: () => {
      const allNodes = Array.from(simulationLoop.nodes.keys());
      if (allNodes.length < 2) return;

      // Randomly split nodes into two groups
      const groupA = new Set();
      const groupB = new Set();
      
      allNodes.forEach(id => {
        Math.random() > 0.5 ? groupA.add(id) : groupB.add(id);
      });

      // Find and sever edges crossing the partition boundary
      let severedCount = 0;
      for (const edge of simulationLoop.edges.values()) {
        const crossesBoundary = 
          (groupA.has(edge.sourceId) && groupB.has(edge.targetId)) ||
          (groupB.has(edge.sourceId) && groupA.has(edge.targetId));
        
        if (crossesBoundary) {
          edge.status = EdgeStatus.SEVERED;
          severedCount++;
        }
      }

      eventBus.emit('system:notification', { message: `Network Partition: ${severedCount} links severed.` });
    }
  },

  thundering_herd: {
    id: 'thundering_herd',
    name: 'Thundering Herd',
    description: 'Spikes ingress user traffic astronomically for 10 seconds to simulate a viral event.',
    execute: () => {
      const originalRate = simulationLoop.trafficRatePerSec;
      const originalActive = simulationLoop.isTrafficActive;
      
      // Spike to 500 packets per second
      simulationLoop.setTraffic(true, 500);
      eventBus.emit('system:notification', { message: 'Thundering Herd incoming! Traffic spiked to 500 req/sec.' });

      // Auto-resolve after 10 seconds
      setTimeout(() => {
        simulationLoop.setTraffic(originalActive, originalRate);
        eventBus.emit('system:notification', { message: 'Traffic spike resolved. Returning to baseline.' });
      }, 10000);
    }
  }
};

module.exports = Scenarios;