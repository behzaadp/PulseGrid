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

import useEngineStore from '../../store/useEngineStore';
import useUiStore from '../../store/useUiStore';
import websocketClient from '../../services/websocketClient';

import GatewayNode from '../nodes/GatewayNode';
import AuthNode from '../nodes/AuthNode';
import DatabaseNode from '../nodes/DatabaseNode';
import BrokerNode from '../nodes/BrokerNode';
import WorkerNode from '../nodes/WorkerNode';
import GenericNode from '../nodes/GenericNode';
import TrafficEdge from '../edges/TrafficEdge';

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
  
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const engineNodes = useEngineStore((state) => state.nodes);
  const engineEdges = useEngineStore((state) => state.edges);
  
  const setSelectedNode = useUiStore((state) => state.setSelectedNode);

  // Sync Nodes
  useEffect(() => {
    setNodes((currentNodes) => {
      let hasChanges = false;
      
      let updatedNodes = currentNodes.filter((n) => {
        const keep = !!engineNodes[n.id];
        if (!keep) hasChanges = true; 
        return keep;
      });

      Object.keys(engineNodes).forEach((id, index) => {
        if (!currentNodes.find((n) => n.id === id)) {
          hasChanges = true;
          const engineNode = engineNodes[id];
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
      
      return hasChanges ? updatedNodes : currentNodes;
    });
  }, [engineNodes, setNodes]);

  // Sync Edges
  useEffect(() => {
    setEdges((currentEdges) => {
      let hasChanges = false;
      
      let updatedEdges = currentEdges.filter((e) => {
        const keep = !!engineEdges[e.id];
        if (!keep) hasChanges = true;
        return keep;
      });

      Object.keys(engineEdges).forEach((id) => {
        if (!currentEdges.find((e) => e.id === id)) {
          hasChanges = true;
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
              color: '#94A3B8',
            },
          });
        }
      });
      
      return hasChanges ? updatedEdges : currentEdges;
    });
  }, [engineEdges, setEdges]);

  const onConnect = useCallback((params) => {
    const edgeId = `edge-${params.source}-to-${params.target}`;
    websocketClient.sendCommand('ADD_EDGE', {
      id: edgeId,
      sourceId: params.source,
      targetId: params.target,
      config: { latencyMs: 15 }
    });
  }, []);

  const onSelectionChange = useCallback(({ nodes }) => {
    if (nodes.length > 0) {
      setSelectedNode(nodes[0].id);
    } else {
      setSelectedNode(null);
    }
  }, [setSelectedNode]);

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;

    const newNodeId = `${type}-${Date.now().toString().slice(-4)}`;
    
    websocketClient.sendCommand('ADD_NODE', {
      id: newNodeId,
      label: `New ${type.charAt(0).toUpperCase() + type.slice(1)}`,
      nodeType: type,
      config: {}
    });
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
        className="touch-none" 
      >
        <Background color="#94A3B8" gap={24} size={2} variant="dots" className="opacity-60" />
        <Controls className="bg-white/80 backdrop-blur border border-slate-200 shadow-sm rounded-lg overflow-hidden fill-slate-600" />
        <MiniMap 
          nodeColor={(n) => {
            const status = engineNodes[n.id]?.status;
            if (status === 'DEAD') return '#EF4444';
            if (status === 'DEGRADED') return '#F59E0B';
            return '#10B981';
          }}
          maskColor="rgba(248, 250, 252, 0.7)"
          className="bg-white/80 backdrop-blur border border-slate-200 shadow-sm rounded-lg"
        />
      </ReactFlow>
    </div>
  );
};

export default PulseCanvas;