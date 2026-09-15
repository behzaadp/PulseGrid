/**
 * Node-specific faults that target individual microservices or databases.
 */
const Faults = {
  memory_leak: {
    id: 'memory_leak',
    name: 'Memory Leak',
    description: 'Slowly degrades available memory over time until an OOM crash occurs.',
    defaultParams: { ratePerSec: 4 },
    execute: (node, params = {}) => {
      node.injectFault('memory_leak', { ...Faults.memory_leak.defaultParams, ...params });
    },
    clear: (node) => node.clearFault('memory_leak')
  },
  
  cpu_spike: {
    id: 'cpu_spike',
    name: 'Noisy Neighbor (CPU Spike)',
    description: 'Immediately maxes out CPU utilization, causing heavy latency and degradation.',
    defaultParams: { targetCpu: 95 },
    execute: (node, params = {}) => {
      node.injectFault('cpu_spike', { ...Faults.cpu_spike.defaultParams, ...params });
    },
    clear: (node) => node.clearFault('cpu_spike')
  },
  
  latency: {
    id: 'latency',
    name: 'Network Latency',
    description: 'Adds severe artificial processing delay to simulate I/O blocking.',
    defaultParams: { latencyMs: 300 },
    execute: (node, params = {}) => {
      node.injectFault('latency', { ...Faults.latency.defaultParams, ...params });
    },
    clear: (node) => node.clearFault('latency')
  },
  
  error_rate: {
    id: 'error_rate',
    name: 'Deploy Bad Version',
    description: 'Forces the node to return HTTP 500 errors for a percentage of requests.',
    defaultParams: { rate: 0.5 }, // 50% error rate
    execute: (node, params = {}) => {
      node.injectFault('error_rate', { ...Faults.error_rate.defaultParams, ...params });
    },
    clear: (node) => node.clearFault('error_rate')
  }
};

module.exports = Faults;