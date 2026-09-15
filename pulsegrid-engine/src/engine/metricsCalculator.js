const simulationLoop = require('./simulationLoop');

class MetricsCalculator {
  /**
   * Aggregates metrics from all nodes and edges to provide a system-wide health snapshot.
   */
  static getGlobalMetrics() {
    const nodes = Array.from(simulationLoop.nodes.values());
    const edges = Array.from(simulationLoop.edges.values());

    let totalRequests = 0;
    let totalFailed = 0;
    let totalMemory = 0;
    let totalCpu = 0;
    let maxLatency = 0;
    let sumApdex = 0;
    
    let degradedNodes = 0;
    let deadNodes = 0;
    let severedEdges = 0;

    // Compute Node Metrics
    nodes.forEach(node => {
      totalRequests += node.metrics.requestsTotal;
      totalFailed += node.metrics.requestsFailed;
      totalMemory += node.metrics.memory;
      totalCpu += node.metrics.cpu;
      sumApdex += node.metrics.apdex;
      
      if (node.metrics.latency > maxLatency) {
        maxLatency = node.metrics.latency;
      }

      if (node.status === 'DEGRADED') degradedNodes++;
      if (node.status === 'DEAD') deadNodes++;
    });

    // Compute Edge Metrics (Network Partitions)
    edges.forEach(edge => {
      if (edge.status === 'SEVERED') severedEdges++;
    });

    const nodeCount = nodes.length || 1; // Prevent division by zero
    
    const globalErrorRate = totalRequests > 0 
      ? parseFloat(((totalFailed / totalRequests) * 100).toFixed(2)) 
      : 0;

    return {
      systemApdex: parseFloat((sumApdex / nodeCount).toFixed(2)),
      avgCpu: parseFloat((totalCpu / nodeCount).toFixed(1)),
      avgMemory: parseFloat((totalMemory / nodeCount).toFixed(1)),
      globalErrorRate,
      maxLatency,
      totalRequests,
      activeIncidents: degradedNodes + deadNodes + severedEdges,
      healthOverview: {
        totalNodes: nodes.length,
        healthy: nodes.length - degradedNodes - deadNodes,
        degraded: degradedNodes,
        dead: deadNodes
      }
    };
  }
}

module.exports = MetricsCalculator;