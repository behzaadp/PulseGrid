import React, { useCallback, useEffect, useRef } from 'react';
import ReactFlow, { Background, Controls, MiniMap, useNodesState, useEdgesState, MarkerType } from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';

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

const nodeTypes = { gateway: GatewayNode, auth: AuthNode, db: DatabaseNode, broker: BrokerNode, worker: WorkerNode, service: GenericNode };
const edgeTypes = { traffic: TrafficEdge };

// Dagre Layout Generator
const getLayoutedElements = (engineNodes, engineEdges) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  // rankdir LR = Left to Right flowchart. ranksep/nodesep controls the spacing.
  dagreGraph.setGraph({ rankdir: 'LR', ranksep: 180, nodesep: 120 });

  const rfNodes = Object.values(engineNodes).map((en) => ({
    id: en.id,
    type: en.type,
    position: { x: 0, y: 0 },
    data: { label: en.label },
  }));

  rfNodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: 160, height: 120 });
  });

  Object.values(engineEdges).forEach((ee) => {
    dagreGraph.setEdge(ee.source, ee.target);
  });

  dagre.layout(dagreGraph);

  rfNodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.position = {
      x: nodeWithPosition.x - 160 / 2,
      y: nodeWithPosition.y - 120 / 2,
    };
  });

  return rfNodes;
};

const PulseCanvas = () => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  const engineNodes = useEngineStore((state) => state.nodes);
  const engineEdges = useEngineStore((state) => state.edges);
  const setSelectedNode = useUiStore((state) => state.setSelectedNode);

  // Sync and Auto-Layout Nodes
  useEffect(() => {
    setNodes((currentNodes) => {
      let hasChanges = false;
      
      // Detect if we are loading a massive new blueprint onto an empty canvas
      const isBlueprintLoad = currentNodes.length === 0 && Object.keys(engineNodes).length > 2;

      let updatedNodes = currentNodes.filter((n) => {
        const keep = !!engineNodes[n.id];
        if (!keep) hasChanges = true; 
        return keep;
      });

      if (isBlueprintLoad) {
        // Run Dagre math to form the beautiful flowchart
        return getLayoutedElements(engineNodes, engineEdges);
      }

      // Standard one-by-one addition (Drag & Drop)
      Object.keys(engineNodes).forEach((id, index) => {
        if (!currentNodes.find((n) => n.id === id)) {
          hasChanges = true;
          const engineNode = engineNodes[id];
          updatedNodes.push({
            id: engineNode.id,
            type: engineNode.type,
            position: { x: 250 + (index % 4) * 200, y: 150 + Math.floor(index / 4) * 150 },
            data: { label: engineNode.label },
          });
        }
      });
      
      return hasChanges ? updatedNodes : currentNodes;
    });
  }, [engineNodes, engineEdges, setNodes]);

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
            markerEnd: { type: MarkerType.ArrowClosed, width: 15, height: 15, color: '#94A3B8' },
          });
        }
      });
      return hasChanges ? updatedEdges : currentEdges;
    });
  }, [engineEdges, setEdges]);

  const onConnect = useCallback((params) => {
    websocketClient.sendCommand('ADD_EDGE', {
      id: `edge-${params.source}-to-${params.target}`,
      sourceId: params.source,
      targetId: params.target,
      config: { latencyMs: 15 }
    });
  }, []);

  const onSelectionChange = useCallback(({ nodes }) => setSelectedNode(nodes.length > 0 ? nodes[0].id : null), [setSelectedNode]);

  const onNodesDelete = useCallback((deletedNodes) => {
    deletedNodes.forEach((node) => {
      websocketClient.sendCommand('REMOVE_NODE', { id: node.id });
      if (node.id === useUiStore.getState().selectedNodeId) setSelectedNode(null);
    });
  }, [setSelectedNode]);

  const onEdgesDelete = useCallback((deletedEdges) => {
    deletedEdges.forEach((edge) => websocketClient.sendCommand('REMOVE_EDGE', { id: edge.id }));
  }, []);

  const onDragOver = useCallback((event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }, []);
  const onDrop = useCallback((event) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/reactflow');
    if (!type) return;
    websocketClient.sendCommand('ADD_NODE', {
      id: `${type}-${Date.now().toString().slice(-4)}`,
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
        onNodesDelete={onNodesDelete}
        onEdgesDelete={onEdgesDelete}
        deleteKeyCode={['Backspace', 'Delete']}
        onConnect={onConnect}
        onSelectionChange={onSelectionChange}
        onDragOver={onDragOver}
        onDrop={onDrop}
        proOptions={{ hideAttribution: true }}
        fitView
        className="touch-none" 
      >
        <Background color="#94A3B8" gap={24} size={2} variant="dots" className="opacity-60" />
        <Controls className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-lg overflow-hidden fill-slate-600" />
        <MiniMap maskColor="rgba(248, 250, 252, 0.7)" className="bg-white/90 backdrop-blur border border-slate-200 shadow-sm rounded-lg" />
      </ReactFlow>
    </div>
  );
};

export default PulseCanvas;