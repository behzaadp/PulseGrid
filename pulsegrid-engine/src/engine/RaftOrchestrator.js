const { Edge } = require('../models/Edge');

class RaftOrchestrator {
  constructor(engine) {
    this.engine = engine;
    this.electionInProgress = false;
    this.electionTimer = 0;
  }

  tick(deltaMs) {
    // 1. Find all nodes belonging to the Raft cluster
    const raftNodes = Array.from(this.engine.nodes.values()).filter(n => n.id.startsWith('raft-'));
    
    // If we don't have at least 2 Raft nodes, the cluster doesn't exist or is destroyed
    if (raftNodes.length < 2) {
      this.electionInProgress = false;
      return;
    }

    // 2. Check if a healthy leader exists
    const activeLeader = raftNodes.find(n => n.label === 'Raft Leader' && n.status !== 'DEAD');

    // 3. Trigger Election if the leader dies
    if (!activeLeader && !this.electionInProgress) {
      this.electionInProgress = true;
      this.electionTimer = 2000; // 2-second timeout to simulate follower voting
      this.engine.emit('system:notification', { message: 'Leader heartbeat lost! Followers initiating election...' });
    }

    // 4. Progress the election countdown
    if (this.electionInProgress) {
      this.electionTimer -= deltaMs;
      if (this.electionTimer <= 0) {
        this.executeElection(raftNodes);
      }
    }
  }

  executeElection(raftNodes) {
    this.electionInProgress = false;
    
    // Find healthy followers eligible to become the new leader
    const healthyFollowers = raftNodes.filter(n => n.status !== 'DEAD' && n.label !== 'Raft Leader');

    if (healthyFollowers.length === 0) {
      this.engine.emit('system:notification', { message: 'Cluster Quorum Lost: No nodes available for election.' });
      return;
    }

    // Raft selects a leader based on randomized timeouts. We simulate this by picking a random follower.
    const newLeader = healthyFollowers[Math.floor(Math.random() * healthyFollowers.length)];

    // 1. Rename the old leader to visually indicate it has been demoted/offline
    const oldLeader = raftNodes.find(n => n.label === 'Raft Leader');
    if (oldLeader) oldLeader.label = 'Offline Node';

    // 2. Promote the new leader
    newLeader.label = 'Raft Leader';

    // 3. Re-wire the Ingress Gateway to point to the new leader
    const gatewayEdge = Array.from(this.engine.edges.values()).find(e => e.sourceId === 'gw-raft');
    if (gatewayEdge) {
      gatewayEdge.targetId = newLeader.id;
    }

    // 4. Clean up old replication edges originating from the old leader
    if (oldLeader) {
      for (const [edgeId, edge] of this.engine.edges.entries()) {
        if (edge.sourceId === oldLeader.id && edge.targetId.startsWith('raft-')) {
          this.engine.edges.delete(edgeId);
        }
      }
    }

    // 5. Create new replication edges from the new leader to the remaining followers
    healthyFollowers.forEach(follower => {
      if (follower.id !== newLeader.id) {
        const newEdgeId = `rep-${newLeader.id}-to-${follower.id}`;
        // Add the new edge directly to the engine
        if (!this.engine.edges.has(newEdgeId)) {
          this.engine.addEdge(new Edge(newEdgeId, newLeader.id, follower.id, { latencyMs: 5 }));
        }
      }
    });

    // Force a full topology broadcast so the frontend physically redraws the snapped lines
    this.engine.emit('topology:changed');
    this.engine.emit('system:notification', { message: `Consensus Reached: ${newLeader.id} elected as new Leader!` });
  }
}

module.exports = RaftOrchestrator;