import React, { useCallback, useEffect, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';

// Import our stores and websocket
import useEngineStore from '../../store/useEngineStore';
import useUiStore from '../../store/useUiStore';
import websocketClient from '../../services/websocketClient';

// Import the custom 3D isometric nodes and edges
import GatewayNode from '../nodes/GatewayNode';
import AuthNode from '../nodes/AuthNode';
import DatabaseNode from '../nodes/DatabaseNode';
import BrokerNode from '../nodes/BrokerNode';
import WorkerNode from '../nodes/WorkerNode';
import GenericNode from '../nodes/GenericNode';
import TrafficEdge from '../edges/TrafficEdge';

// Register the custom components with React Flow
const nodeTypes = {
  gateway: GatewayNode,
  auth: AuthNode,
  db: DatabaseNode,
  broker: BrokerNode,
  worker: WorkerNode,
  service: GenericNode,
};

const edgeTypes = {
  traffic: TrafficEdge,
};

const PulseCanvas = () => {
  const reactFlowWrapper = useRef(null);
  
  // React Flow local spatial state (handles dragging, panning, zooming)
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Zustand Engine state (source of truth from the backend)
  const engineNodes = useEngineStore((state) => state.nodes);
  const engineEdges = useEngineStore((state) => state.edges);
  
  const setSelectedNode = useUiStore((state) => state.setSelectedNode);

  // --- Synchronization: Backend -> React Flow ---
  
  // Sync Nodes: Add new nodes that appear in the backend, remove deleted ones
  useEffect(() => {
    setNodes((currentNodes) => {
      // 1. Keep nodes that still exist in the engine
      let updatedNodes = currentNodes.filter((n) => engineNodes[n.id]);

      // 2. Add new nodes from the engine
      Object.keys(engineNodes).forEach((id, index) => {
        if (!currentNodes.find((n) => n.id === id)) {
          const engineNode = engineNodes[id];
          
          // Generate a fallback grid layout if coordinates are not provided
          const fallBackX = 250 + (index % 4) * 250;
          const fallBackY = 150 + Math.floor(index / 4) * 200;

          updatedNodes.push({
            id: engineNode.id,
            type: engineNode.type,
            position: { x: fallBackX, y: fallBackY },
            data: { label: engineNode.label },
          });
        }
      });
      return updatedNodes;
    });
  }, [engineNodes, setNodes]);

  // Sync Edges: Add new network links from the backend
  useEffect(() => {
    setEdges((currentEdges) => {
      let updatedEdges = currentEdges.filter((e) => engineEdges[e.id]);

      Object.keys(engineEdges).forEach((id) => {
        if (!currentEdges.find((e) => e.id === id)) {
          const engineEdge = engineEdges[id];
          updatedEdges.push({
            id: engineEdge.id,
            source: engineEdge.source,
            target: engineEdge.target,
            type: 'traffic',
            animated: true,
            markerEnd: {
              type: MarkerType.ArrowClosed,
              width: 15,
              height: 15,
              color: '#94A3B8', // Slate-400
            },
          });
        }
      });
      return updatedEdges;
    });
  }, [engineEdges, setEdges]);

  // --- User Interactions ---

  // Handle drawing a new connection line between nodes
  const onConnect = useCallback((params) => {
    const edgeId = `edge-${params.source}-to-${params.target}`;
    
    // Send the creation command to the Node.js backend
    websocketClient.sendCommand('ADD_EDGE', {
      id: edgeId,
      sourceId: params.source,
      targetId: params.target,
      config: { latencyMs: 15 } // Default base latency
    });
  }, []);

  // Update the UI Store when a user clicks a node (opens the Chaos Drawer)
  const onSelectionChange = useCallback(({ nodes }) => {
    if (nodes.length > 0) {
      setSelectedNode(nodes[0].id);
    } else {
      setSelectedNode(null);
    }
  }, [setSelectedNode]);

  // --- Drag & Drop from Builder Toolbar (Setup for Step 4) ---
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    // We generate a unique ID based on timestamp
    const newNodeId = `${type}-${Date.now().toString().slice(-4)}`;
    
    // Send the command to the backend to officially create the node
    websocketClient.sendCommand('ADD_NODE', {
      id: newNodeId,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      nodeType: type,
      config: {}
    });
    
    // (Note: In a production app, we would translate event.clientX/Y to React Flow coordinates
    // and store them in the backend. For now, the sync effect will use the fallback grid).
  }, []);

  return (
    <div className="w-full h-screen bg-slate-50" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onDragOver={onDragOver}
        onDrop={onDrop}
        proOptions={{ hideAttribution: true }}
        fitView
        className="touch-none" // Prevents browser pull-to-refresh on mobile
      >
        {/* Light Glassmorphism Canvas Settings */}
        <Background 
          color="#94A3B8" 
          gap={24} 
          size={2} 
          variant="dots" 
          className="opacity-60" 
        />
        <Controls className="bg-white/80 backdrop-blur border border-slate-200 shadow-sm rounded-lg overflow-hidden fill-slate-600" />
        <MiniMap 
          nodeColor={(n) => {
            const status = engineNodes[n.id]?.status;
            if (status === 'DEAD') return '#EF4444'; // Rose
            if (status === 'DEGRADED') return '#F59E0B'; // Amber
            return '#10B981'; // Emerald
          }}
          maskColor="rgba(248, 250, 252, 0.7)"
          className="bg-white/80 backdrop-blur border border-slate-200 shadow-sm rounded-lg"
        />
      </ReactFlow>
    </div>
  );
};

export default PulseCanvas;