const EventEmitter = require('events');

const NodeStatus = {
  HEALTHY: 'HEALTHY',
  DEGRADED: 'DEGRADED',
  DEAD: 'DEAD',
  RECOVERING: 'RECOVERING',
};

class BaseNode extends EventEmitter {
  /**
   * @param {string} id - Unique identifier (e.g., 'srv-auth-1')
   * @param {string} label - Display name in the UI
   * @param {string} type - 'gateway' | 'auth' | 'db' | 'broker' | 'worker' | 'service'
   * @param {object} config - Tunable parameters
   */
  constructor(id, label, type = 'service', config = {}) {
    super();
    this.id = id;
    this.label = label || id;
    this.type = type;

    // Operational configuration
    this.config = {
      baseLatency: config.baseLatency || 20,       // Inherent processing time in ms
      concurrencyLimit: config.concurrencyLimit || 8,// Simultaneous in-flight requests
      maxQueueSize: config.maxQueueSize || 40,      // Max backlog before rejecting (HTTP 503)
      recoveryTimeMs: config.recoveryTimeMs || 4000,// Time taken to reboot from DEAD state
      baseCpu: config.baseCpu || 8,                 // Idle baseline CPU %
      baseMemory: config.baseMemory || 20,          // Baseline Memory %
      ...config,
    };

    // State machine
    this.status = NodeStatus.HEALTHY;
    this.recoveryRemainingMs = 0;

    // Active queues
    this.inboundQueue = []; // Awaiting execution
    this.inFlight = [];     // Currently processing: { packet, remainingMs, durationMs }

    // Telemetry & metrics
    this.metrics = {
      cpu: this.config.baseCpu,
      memory: this.config.baseMemory,
      latency: this.config.baseLatency,
      queueDepth: 0,
      requestsTotal: 0,
      requestsSuccess: 0,
      requestsFailed: 0,
      errorRate: 0,          // Rolling error percentage (0.0 to 100.0)
      apdex: 1.0,            // Satisfaction score (0.0 to 1.0)
    };

    // Chaos & Fault state
    this.faults = {
      memoryLeak: null,      // { ratePerSec: number }
      cpuSpike: null,        // { targetCpu: number }
      latencySpikeMs: 0,     // Artificial delay added to processing
      errorRateOverride: 0,  // Injected 500 error probability (0.0 to 1.0)
      isPartitioned: false,  // If true, drops inter-cluster traffic
    };

    // Rolling latency history for Apdex calculation (Target T = 100ms)
    this.latencyHistory = [];
    this.maxLatencyHistory = 50;
  }

  /**
   * Called every physics tick (~20ms / 50Hz) by the simulation loop
   * @param {number} deltaMs - Milliseconds elapsed since last tick
   */
  tick(deltaMs) {
    // 1. Handle Dead & Reboot states
    if (this.status === NodeStatus.DEAD) {
      this.metrics.cpu = 0;
      this.metrics.queueDepth = 0;
      this.inboundQueue = [];
      this.inFlight = [];
      return;
    }

    if (this.status === NodeStatus.RECOVERING) {
      this.recoveryRemainingMs -= deltaMs;
      this.metrics.cpu = Math.min(80, this.config.baseCpu + 30); // Warmup CPU spike

      if (this.recoveryRemainingMs <= 0) {
        this.status = NodeStatus.HEALTHY;
        this.recoveryRemainingMs = 0;
        this.emit('state:recovered', { nodeId: this.id });
      }
      return;
    }

    // 2. Apply active chaos faults
    this.applyFaultPhysics(deltaMs);

    // 3. Progress currently executing in-flight packets
    this.progressInFlight(deltaMs);

    // 4. Ingest new packets from queue up to concurrency limit
    this.drainQueueToInFlight();

    // 5. Recalculate dynamic load and health state
    this.updateMetrics();
  }

  /**
   * Enqueues a packet arriving from a network edge
   * @param {object} packet - The transmission unit
   * @returns {boolean} Accepted or Dropped
   */
  receivePacket(packet) {
    if (this.status === NodeStatus.DEAD || this.status === NodeStatus.RECOVERING) {
      this.recordFailure(packet, 'SERVICE_UNAVAILABLE');
      return false;
    }

    if (this.inboundQueue.length >= this.config.maxQueueSize) {
      this.recordFailure(packet, 'QUEUE_OVERFLOW');
      this.emit('packet:dropped', { nodeId: this.id, packet, reason: 'OVERFLOW' });
      return false;
    }

    packet.history = packet.history || [];
    packet.history.push({ nodeId: this.id, arrivedAt: Date.now() });
    this.inboundQueue.push(packet);
    return true;
  }

  /**
   * Moves packets from waiting queue into active compute execution
   */
  drainQueueToInFlight() {
    while (
      this.inFlight.length < this.config.concurrencyLimit &&
      this.inboundQueue.length > 0
    ) {
      const packet = this.inboundQueue.shift();

      // Determine latency: Base + Faults + Jitter (±10%) + Backlog pressure
      const jitter = (Math.random() * 0.2 - 0.1) * this.config.baseLatency;
      const queuePenalty = this.inboundQueue.length * 1.5;
      const totalDuration = Math.max(
        5,
        this.config.baseLatency +
          this.faults.latencySpikeMs +
          jitter +
          queuePenalty
      );

      this.inFlight.push({
        packet,
        remainingMs: totalDuration,
        durationMs: totalDuration,
      });
    }
  }

  /**
   * Increments processing time for active packets
   */
  progressInFlight(deltaMs) {
    const finishedIndices = [];

    for (let i = 0; i < this.inFlight.length; i++) {
      const task = this.inFlight[i];
      task.remainingMs -= deltaMs;

      if (task.remainingMs <= 0) {
        finishedIndices.push(i);
        this.completeExecution(task);
      }
    }

    // Remove completed tasks (reverse order to preserve indexing)
    for (let i = finishedIndices.length - 1; i >= 0; i--) {
      this.inFlight.splice(finishedIndices[i], 1);
    }
  }

  /**
   * Evaluates success/failure criteria when a packet finishes processing
   */
  completeExecution(task) {
    const { packet, durationMs } = task;
    this.metrics.requestsTotal++;
    this.recordLatency(durationMs);

    // Evaluate injected error rate or natural degradation failure
    const roll = Math.random();
    const isError =
      roll < this.faults.errorRateOverride ||
      (this.status === NodeStatus.DEGRADED && roll < 0.2);

    if (isError) {
      this.recordFailure(packet, 'EXECUTION_ERROR');
    } else {
      this.metrics.requestsSuccess++;
      this.emit('packet:processed', {
        nodeId: this.id,
        packet,
        durationMs,
        success: true,
      });
    }
  }

  recordFailure(packet, code) {
    this.metrics.requestsFailed++;
    this.emit('packet:failed', {
      nodeId: this.id,
      packet,
      reason: code,
      success: false,
    });
  }

  recordLatency(ms) {
    this.latencyHistory.push(ms);
    if (this.latencyHistory.length > this.maxLatencyHistory) {
      this.latencyHistory.shift();
    }
  }

  /**
   * Fault simulations: Memory Leaks and CPU Spikes
   */
  applyFaultPhysics(deltaMs) {
    // Memory leak increment
    if (this.faults.memoryLeak) {
      const leakRate = this.faults.memoryLeak.ratePerSec || 3;
      this.metrics.memory += leakRate * (deltaMs / 1000);

      // OOM Crash condition
      if (this.metrics.memory >= 100) {
        this.kill('OUT_OF_MEMORY');
        return;
      }
    }

    // CPU spike override
    if (this.faults.cpuSpike) {
      this.metrics.cpu = Math.min(
        100,
        Math.max(this.metrics.cpu, this.faults.cpuSpike.targetCpu)
      );
    }
  }

  /**
   * Recalculates utilization, Apdex satisfaction, and state degradation
   */
  updateMetrics() {
    this.metrics.queueDepth = this.inboundQueue.length;

    // Dynamic CPU calculation based on concurrency utilization
    if (!this.faults.cpuSpike) {
      const loadFactor = this.inFlight.length / this.config.concurrencyLimit;
      const targetCpu = this.config.baseCpu + loadFactor * (90 - this.config.baseCpu);
      // Smooth interpolation toward target CPU
      this.metrics.cpu += (targetCpu - this.metrics.cpu) * 0.15;
    }

    // Dynamic Memory calculation (fluctuates lightly with queue depth)
    if (!this.faults.memoryLeak) {
      const queueMemoryImpact = (this.inboundQueue.length / this.config.maxQueueSize) * 25;
      const targetMem = this.config.baseMemory + queueMemoryImpact;
      this.metrics.memory += (targetMem - this.metrics.memory) * 0.1;
    }

    // Rolling Error Rate
    if (this.metrics.requestsTotal > 0) {
      this.metrics.errorRate = parseFloat(
        ((this.metrics.requestsFailed / this.metrics.requestsTotal) * 100).toFixed(1)
      );
    }

    // Apdex Calculation: Satisfied (< 100ms), Tolerating (100-400ms), Frustrated (> 400ms)
    if (this.latencyHistory.length > 0) {
      let satisfied = 0;
      let tolerating = 0;
      const T = 100; // Target satisfaction threshold

      this.latencyHistory.forEach((lat) => {
        if (lat <= T) satisfied++;
        else if (lat <= 4 * T) tolerating++;
      });

      this.metrics.apdex = parseFloat(
        ((satisfied + tolerating / 2) / this.latencyHistory.length).toFixed(2)
      );

      const avgLat =
        this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
      this.metrics.latency = Math.round(avgLat);
    }

    // Automated state transitions
    if (this.status !== NodeStatus.DEAD && this.status !== NodeStatus.RECOVERING) {
      if (
        this.metrics.cpu > 85 ||
        this.metrics.memory > 88 ||
        this.metrics.errorRate > 25.0
      ) {
        this.status = NodeStatus.DEGRADED;
      } else {
        this.status = NodeStatus.HEALTHY;
      }
    }
  }

  // --- Chaos Operations ---

  kill(reason = 'MANUAL_CHAOS') {
    this.status = NodeStatus.DEAD;
    this.inboundQueue = [];
    this.inFlight = [];
    this.metrics.cpu = 0;
    this.emit('state:killed', { nodeId: this.id, reason });
  }

  restart() {
    this.status = NodeStatus.RECOVERING;
    this.recoveryRemainingMs = this.config.recoveryTimeMs;
    this.metrics.memory = this.config.baseMemory;
    this.faults.memoryLeak = null; // Clear active leak on reboot
    this.emit('state:restarting', { nodeId: this.id, duration: this.recoveryRemainingMs });
  }

  injectFault(type, params = {}) {
    switch (type) {
      case 'memory_leak':
        this.faults.memoryLeak = { ratePerSec: params.ratePerSec || 4 };
        break;
      case 'cpu_spike':
        this.faults.cpuSpike = { targetCpu: params.targetCpu || 95 };
        break;
      case 'latency':
        this.faults.latencySpikeMs = params.latencyMs || 250;
        break;
      case 'error_rate':
        this.faults.errorRateOverride = params.rate || 0.5; // 50% 500 errors
        break;
    }
    this.emit('fault:injected', { nodeId: this.id, type, params });
  }

  clearFault(type) {
    if (type === 'memory_leak') this.faults.memoryLeak = null;
    if (type === 'cpu_spike') this.faults.cpuSpike = null;
    if (type === 'latency') this.faults.latencySpikeMs = 0;
    if (type === 'error_rate') this.faults.errorRateOverride = 0;
    this.emit('fault:cleared', { nodeId: this.id, type });
  }

  /**
   * Serializes the node for client broadcasting
   */
  getSnapshot() {
    return {
      id: this.id,
      label: this.label,
      type: this.type,
      status: this.status,
      metrics: {
        cpu: Math.round(this.metrics.cpu),
        memory: Math.round(this.metrics.memory),
        latency: this.metrics.latency,
        queueDepth: this.metrics.queueDepth,
        errorRate: this.metrics.errorRate,
        apdex: this.metrics.apdex,
        requestsTotal: this.metrics.requestsTotal,
      },
      faults: {
        hasMemoryLeak: Boolean(this.faults.memoryLeak),
        hasCpuSpike: Boolean(this.faults.cpuSpike),
        hasLatencySpike: this.faults.latencySpikeMs > 0,
        hasErrorOverride: this.faults.errorRateOverride > 0,
      },
    };
  }
}

module.exports = { BaseNode, NodeStatus };