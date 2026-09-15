const { EdgeStatus } = require('../models/Edge');

const Scenarios = {
  thanos_snap: {
    id: 'thanos_snap',
    name: 'Thanos Snap',
    execute: (engine) => {
      const activeNodes = Array.from(engine.nodes.values()).filter(n => n.status !== 'DEAD');
      
      for (let i = activeNodes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [activeNodes[i], activeNodes[j]] = [activeNodes[j], activeNodes[i]];
      }

      const half = Math.ceil(activeNodes.length / 2);
      const doomedNodes = activeNodes.slice(0, half);
      
      doomedNodes.forEach(node => node.kill('THANOS_SNAP'));
      engine.emit('system:notification', { message: `Thanos Snap executed: ${half} nodes wiped out.` });
    }
  },

  split_brain: {
    id: 'split_brain',
    name: 'Network Partition (Split Brain)',
    execute: (engine) => {
      const allNodes = Array.from(engine.nodes.keys());
      if (allNodes.length < 2) return;

      const groupA = new Set();
      const groupB = new Set();
      allNodes.forEach(id => Math.random() > 0.5 ? groupA.add(id) : groupB.add(id));

      let severedCount = 0;
      for (const edge of engine.edges.values()) {
        const crossesBoundary = 
          (groupA.has(edge.sourceId) && groupB.has(edge.targetId)) ||
          (groupB.has(edge.sourceId) && groupA.has(edge.targetId));
        
        if (crossesBoundary) {
          edge.status = EdgeStatus.SEVERED;
          severedCount++;
        }
      }

      engine.emit('system:notification', { message: `Network Partition: ${severedCount} links severed.` });
    }
  },

  thundering_herd: {
    id: 'thundering_herd',
    name: 'Thundering Herd',
    execute: (engine) => {
      const originalRate = engine.trafficRatePerSec;
      const originalActive = engine.isTrafficActive;
      
      engine.setTraffic(true, 500);
      engine.emit('system:notification', { message: 'Thundering Herd incoming! Traffic spiked to 500 req/sec.' });

      setTimeout(() => {
        // Verify sandbox is still alive before resolving
        if (engine.isRunning) {
          engine.setTraffic(originalActive, originalRate);
          engine.emit('system:notification', { message: 'Traffic spike resolved. Returning to baseline.' });
        }
      }, 10000);
    }
  }
};

module.exports = Scenarios;