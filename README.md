PulseGrid ⚡
[PulseGrid](https://pulsegrid.me)
PulseGrid is a real-time, interactive sandbox for visualizing, building, and breaking distributed systems architectures.

Built with an event-driven WebSocket backend and a dynamic React Flow canvas, it allows engineers to simulate live network traffic, inject targeted chaos, and watch how modern infrastructure concepts—like Kubernetes auto-recovery and Raft consensus—react under pressure.

🎯 What It Aims to Achieve
The goal of PulseGrid is to make invisible infrastructure visible. Complex backend patterns like circuit breaking, network partitions, and split-brain scenarios are often difficult to conceptualize. PulseGrid transitions these abstract concepts into a tactile, interactive playground where you can break a system with a click and watch it heal itself in real-time.

✨ Features
Architectural Blueprints: Instantly load industry-standard topologies (E-Commerce, IoT Pipelines, Financial Trading Engines) orchestrated perfectly via Dagre.js auto-layout.

Chaos Engineering: Inject targeted CPU spikes, memory leaks, I/O latency, or trigger a system-wide Thanos Snap to wipe out half the cluster.

Self-Healing (K8s) Loop: Toggle a native reconciliation controller that actively monitors the desired ReplicaSet state and automatically respawns deleted or dead nodes.

Raft Consensus Simulation: Watch a live cluster perform leader elections and automatically re-route network ingress when the active leader fails.

Network Partitions: Manually sever individual edges to visualize packet drops and test circuit-breaker failovers.

Multi-Tenant Sandbox: Session-based architecture ensures every browser tab spins up its own isolated simulation loop.

🚀 Mini Tutorial: Breaking the Grid
Want to see PulseGrid in action? Here is a quick guide to running your first chaos experiment:

1. Load a Sandbox Environment

Open the top builder toolbar and select E-Commerce Architecture from the Blueprints dropdown.

Click ▶ Start Traffic to initialize the simulation and watch the packets flow across the network.

2. Test Auto-Recovery

Toggle the Auto-Recovery (K8s) switch to ON. This locks the current topology as the "Desired State."

Click on the Auth Service node, scroll to the bottom of the Node Inspector, and click Delete Node.

Wait exactly 3 seconds and watch the Kubernetes controller automatically respawn the missing pod and reconnect its network cables.

3. Trigger a Failover Event

Load the Raft Consensus Cluster blueprint.

Click on the node labeled Raft Leader and inject a Memory Leak.

As the memory hits 100%, the node will die. Watch as the followers detect the heartbeat loss, initiate an election, crown a new leader, and seamlessly re-route the gateway traffic.

🛠️ Tech Stack
Frontend: React.js, React Flow, Zustand (State Management), TailwindCSS.

Backend: Node.js, Native WebSockets (ws), Custom Physics & Event Engine.

Deployment: Hosted via Microsoft Azure App Services & Static Web Apps.

Designed & Engineered by Behzaad Pathan