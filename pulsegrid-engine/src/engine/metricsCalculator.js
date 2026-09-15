class MetricsCalculator {
  static getGlobalMetrics(engine) {
    const nodes = Array.from(engine.nodes.values());
    const edges = Array.from(engine.edges.values());
    let totalRequests = 0, totalFailed = 0, totalMemory = 0, totalCpu = 0, maxLatency = 0, sumApdex = 0;
    let degradedNodes = 0, deadNodes = 0, severedEdges = 0;

    nodes.forEach(node => {
      totalRequests += node.metrics.requestsTotal;
      totalFailed += node.metrics.requestsFailed;
      totalMemory += node.metrics.memory;
      totalCpu += node.metrics.cpu;
      sumApdex += node.metrics.apdex;
      if (node.metrics.latency > maxLatency) maxLatency = node.metrics.latency;
      if (node.status === 'DEGRADED') degradedNodes++;
      if (node.status === 'DEAD') deadNodes++;
    });

    edges.forEach(edge => { if (edge.status === 'SEVERED') severedEdges++; });

    const nodeCount = nodes.length || 1;
    const globalErrorRate = totalRequests > 0 ? parseFloat(((totalFailed / totalRequests) * 100).toFixed(2)) : 0;

    return {
      systemApdex: parseFloat((sumApdex / nodeCount).toFixed(2)),
      avgCpu: parseFloat((totalCpu / nodeCount).toFixed(1)),
      avgMemory: parseFloat((totalMemory / nodeCount).toFixed(1)),
      globalErrorRate,
      maxLatency,
      totalRequests,
      activeIncidents: degradedNodes + deadNodes + severedEdges,
    };
  }
}

module.exports = MetricsCalculator;