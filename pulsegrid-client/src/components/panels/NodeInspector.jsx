import React, { useState, useEffect } from 'react';
import useEngineStore from '../../store/useEngineStore';
import useUiStore from '../../store/useUiStore';
import websocketClient from '../../services/websocketClient';
import { getStatusColors } from '../../utils/constants';

const NodeInspector = () => {
  const selectedNodeId = useUiStore((state) => state.selectedNodeId);
  const setSelectedNode = useUiStore((state) => state.setSelectedNode);
  const node = useEngineStore((state) => state.nodes[selectedNodeId]);

  const [activeTab, setActiveTab] = useState('telemetry'); // 'telemetry' | 'chaos'
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');

  // Sync edit name when a new node is selected
  useEffect(() => {
    if (node) setEditName(node.label);
    setIsEditing(false);
  }, [node?.id]);

  if (!selectedNodeId || !node) return null;

  const colors = getStatusColors(node.status);
  
  // Datadog-style Anomaly Score Calculation
  const anomalyScore = Math.min(100, Math.max(0, ((1 - (node.metrics?.apdex || 1)) * 50) + ((node.metrics?.errorRate || 0) * 0.5))).toFixed(1);

  const saveName = () => {
    if (editName.trim() !== node.label) {
      websocketClient.sendCommand('UPDATE_NODE_LABEL', { id: node.id, label: editName.trim() });
    }
    setIsEditing(false);
  };

  const triggerFault = (faultType) => websocketClient.sendCommand('INJECT_FAULT', { id: node.id, faultType });
  const clearFault = (faultType) => websocketClient.sendCommand('CLEAR_FAULT', { id: node.id, faultType });
  const triggerScenario = (scenarioId) => websocketClient.sendCommand('EXECUTE_SCENARIO', { scenarioId });
  const deleteNode = () => {
    websocketClient.sendCommand('REMOVE_NODE', { id: node.id });
    setSelectedNode(null);
  };

  return (
    <div className={`absolute top-0 right-0 h-full w-[360px] bg-white/95 backdrop-blur-2xl border-l border-slate-200 shadow-2xl z-20 flex flex-col transition-transform duration-300`}>
      
      {/* Header & Rename Functionality */}
      <div className="p-5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex justify-between items-start mb-2">
          <div className="flex-grow">
            {isEditing ? (
              <input 
                autoFocus
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === 'Enter' && saveName()}
                className="w-full text-lg font-black text-slate-800 bg-white border border-indigo-300 rounded px-2 py-0.5 outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ) : (
              <div className="group flex items-center gap-2 cursor-pointer" onClick={() => setIsEditing(true)}>
                <h2 className="text-lg font-black text-slate-800">{node.label}</h2>
                <svg className="w-3.5 h-3.5 text-slate-300 group-hover:text-indigo-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
              </div>
            )}
            <span className="text-[10px] font-mono text-slate-500">{node.id}</span>
          </div>
          <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-800 text-xl font-bold px-2 py-1 active:scale-90 transition-transform">×</button>
        </div>
        <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-full border ${colors.badge}`}>{node.status}</span>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-slate-50/50 px-5 gap-4">
        <button onClick={() => setActiveTab('telemetry')} className={`pb-3 pt-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'telemetry' ? 'border-indigo-500 text-indigo-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Telemetry</button>
        <button onClick={() => setActiveTab('chaos')} className={`pb-3 pt-2 text-xs font-bold uppercase tracking-wider border-b-2 transition-colors ${activeTab === 'chaos' ? 'border-rose-500 text-rose-600' : 'border-transparent text-slate-400 hover:text-slate-600'}`}>Chaos Injection</button>
      </div>

      {/* Tab Content */}
      <div className="flex-grow overflow-y-auto p-5">
        
        {/* TELEMETRY TAB */}
        {activeTab === 'telemetry' && (
          <div className="space-y-6">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-500 uppercase">CPU Utilization</span><span className={node.metrics?.cpu > 80 ? 'text-rose-600' : 'text-slate-800'}>{Math.round(node.metrics?.cpu || 0)}%</span></div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className={`h-full transition-all duration-300 ${node.metrics?.cpu > 80 ? 'bg-rose-500' : node.metrics?.cpu > 50 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${node.metrics?.cpu || 0}%` }} />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1"><span className="text-slate-500 uppercase">Memory Footprint</span><span className={node.metrics?.memory > 80 ? 'text-rose-600' : 'text-slate-800'}>{Math.round(node.metrics?.memory || 0)}%</span></div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden border border-slate-200">
                <div className={`h-full transition-all duration-300 ${node.metrics?.memory > 80 ? 'bg-rose-500' : node.metrics?.memory > 50 ? 'bg-amber-400' : 'bg-emerald-500'}`} style={{ width: `${node.metrics?.memory || 0}%` }} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 font-mono">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase mb-1">Total Requests</span>
                <span className="text-lg text-slate-800 font-bold">{node.metrics?.requestsTotal?.toLocaleString() || 0}</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase mb-1">Avg Latency</span>
                <span className={`text-lg font-bold ${node.metrics?.latency > 200 ? 'text-rose-600' : 'text-slate-800'}`}>{node.metrics?.latency || 0}ms</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase mb-1">Error Rate</span>
                <span className={`text-lg font-bold ${node.metrics?.errorRate > 10 ? 'text-rose-600' : 'text-slate-800'}`}>{node.metrics?.errorRate || 0}%</span>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
                <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase mb-1">Anomaly Score</span>
                <span className={`text-lg font-bold ${anomalyScore > 30 ? 'text-amber-500' : 'text-emerald-500'}`}>{anomalyScore}</span>
              </div>
            </div>
          </div>
        )}

        {/* CHAOS TAB */}
        {activeTab === 'chaos' && (
          <div className="space-y-3">
            <div className="p-4 border border-amber-200 bg-amber-50 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-amber-900">CPU Spike</span>
                {node.faults?.hasCpuSpike ? (
                  <button onClick={() => clearFault('cpu_spike')} className="text-xs font-bold bg-amber-200 text-amber-800 px-3 py-1.5 rounded shadow-sm hover:bg-amber-300 active:scale-95 transition-all">Clear</button>
                ) : (
                  <button onClick={() => triggerFault('cpu_spike')} className="text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded shadow-sm hover:bg-amber-600 active:scale-95 transition-all">Inject</button>
                )}
              </div>
              <p className="text-[10px] text-amber-700 leading-tight">Simulates a noisy neighbor maximizing CPU limits.</p>
            </div>

            <div className="p-4 border border-rose-200 bg-rose-50 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-rose-900">Memory Leak</span>
                {node.faults?.hasMemoryLeak ? (
                  <button onClick={() => clearFault('memory_leak')} className="text-xs font-bold bg-rose-200 text-rose-800 px-3 py-1.5 rounded shadow-sm hover:bg-rose-300 active:scale-95 transition-all">Clear</button>
                ) : (
                  <button onClick={() => triggerFault('memory_leak')} className="text-xs font-bold bg-rose-500 text-white px-3 py-1.5 rounded shadow-sm hover:bg-rose-600 active:scale-95 transition-all">Inject</button>
                )}
              </div>
              <p className="text-[10px] text-rose-700 leading-tight">Degrades memory until an OOM crash occurs.</p>
            </div>

            {/* Network Latency */}
            <div className="p-4 border border-violet-200 bg-violet-50 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-violet-900">I/O Latency</span>
                {node.faults?.hasLatencySpike ? (
                  <button onClick={() => clearFault('latency')} className="text-xs font-bold bg-violet-200 text-violet-800 px-3 py-1.5 rounded shadow-sm hover:bg-violet-300 active:scale-95 transition-all">Clear</button>
                ) : (
                  <button onClick={() => triggerFault('latency')} className="text-xs font-bold bg-violet-500 text-white px-3 py-1.5 rounded shadow-sm hover:bg-violet-600 active:scale-95 transition-all">Inject</button>
                )}
              </div>
              <p className="text-[10px] text-violet-700 leading-tight">Simulates network/disk blocking, increasing queue backpressure.</p>
            </div>

            {/* Bad Release */}
            <div className="p-4 border border-fuchsia-200 bg-fuchsia-50 rounded-xl shadow-sm">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-bold text-fuchsia-900">Bad Release</span>
                {node.faults?.hasErrorOverride ? (
                  <button onClick={() => clearFault('error_rate')} className="text-xs font-bold bg-fuchsia-200 text-fuchsia-800 px-3 py-1.5 rounded shadow-sm hover:bg-fuchsia-300 active:scale-95 transition-all">Clear</button>
                ) : (
                  <button onClick={() => triggerFault('error_rate')} className="text-xs font-bold bg-fuchsia-500 text-white px-3 py-1.5 rounded shadow-sm hover:bg-fuchsia-600 active:scale-95 transition-all">Inject</button>
                )}
              </div>
              <p className="text-[10px] text-fuchsia-700 leading-tight">Forces a 50% HTTP 500 error rate to test circuit breakers.</p>
            </div>

            <h3 className="text-xs font-bold text-rose-400 uppercase mt-8 mb-3">System-Wide Catastrophe</h3>
            <div className="grid grid-cols-2 gap-2">
              <button onClick={() => triggerScenario('thanos_snap')} className="bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg shadow-md hover:bg-slate-700 active:scale-95 transition-all">Thanos Snap</button>
              <button onClick={() => triggerScenario('split_brain')} className="bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg shadow-md hover:bg-slate-700 active:scale-95 transition-all">Split Brain</button>
            </div>
          </div>
        )}
      </div>

      {/* Persistent Delete Button */}
      <div className="p-5 border-t border-slate-200 bg-slate-50/50">
        <button onClick={deleteNode} className="w-full bg-white text-rose-600 text-xs font-bold py-2.5 rounded-lg border border-rose-200 shadow-sm hover:bg-rose-50 active:scale-95 transition-all flex items-center justify-center gap-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          Delete Node
        </button>
      </div>
    </div>
  );
};

export default NodeInspector;