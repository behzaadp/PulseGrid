import React from 'react';
import useEngineStore from '../../store/useEngineStore';
import useUiStore from '../../store/useUiStore';
import websocketClient from '../../services/websocketClient';

const ChaosDrawer = () => {
  const selectedNodeId = useUiStore((state) => state.selectedNodeId);
  const setSelectedNode = useUiStore((state) => state.setSelectedNode);
  const node = useEngineStore((state) => state.nodes[selectedNodeId]);

  const triggerFault = (faultType) => {
    if (!node) return;
    websocketClient.sendCommand('INJECT_FAULT', { id: node.id, faultType });
  };

  const clearFault = (faultType) => {
    if (!node) return;
    websocketClient.sendCommand('CLEAR_FAULT', { id: node.id, faultType });
  };

  const triggerScenario = (scenarioId) => {
    websocketClient.sendCommand('EXECUTE_SCENARIO', { scenarioId });
  };

  const deleteNode = () => {
    if (!node) return;
    websocketClient.sendCommand('REMOVE_NODE', { id: node.id });
    setSelectedNode(null);
  };

  const isOpen = !!selectedNodeId;

  return (
    <div className={`absolute top-0 right-0 h-full w-80 bg-white/90 backdrop-blur-xl border-l border-slate-200 shadow-2xl transform transition-transform duration-300 z-20 flex flex-col ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
      
      <div className="p-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
        <div>
          <h2 className="text-lg font-black text-slate-800">{node?.label || 'Node'}</h2>
          <span className="text-xs font-mono text-slate-500">{node?.id}</span>
        </div>
        <button onClick={() => setSelectedNode(null)} className="text-slate-400 hover:text-slate-800 text-xl font-bold p-2 transition-transform active:scale-90">×</button>
      </div>

      <div className="p-5 border-b border-slate-200">
        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Live Telemetry</h3>
        <div className="grid grid-cols-2 gap-3 font-mono text-sm">
          <div className="bg-slate-100 p-2 rounded border border-slate-200 shadow-inner">
            <span className="text-[10px] text-slate-500 block">CPU</span>
            <span className={node?.metrics?.cpu > 80 ? 'text-rose-600 font-bold' : 'text-slate-800'}>{node?.metrics?.cpu || 0}%</span>
          </div>
          <div className="bg-slate-100 p-2 rounded border border-slate-200 shadow-inner">
            <span className="text-[10px] text-slate-500 block">MEMORY</span>
            <span className={node?.metrics?.memory > 80 ? 'text-rose-600 font-bold' : 'text-slate-800'}>{node?.metrics?.memory || 0}%</span>
          </div>
        </div>
      </div>

      <div className="p-5 flex-grow overflow-y-auto">
        <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Targeted Injection</h3>
        <div className="space-y-3">
          
          <div className="p-3 border border-amber-200 bg-amber-50 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-amber-900">CPU Spike</span>
              {node?.faults?.hasCpuSpike ? (
                <button onClick={() => clearFault('cpu_spike')} className="text-xs font-bold bg-amber-200 text-amber-800 px-3 py-1.5 rounded shadow-sm hover:bg-amber-300 active:scale-95 active:shadow-inner transition-all">Clear</button>
              ) : (
                <button onClick={() => triggerFault('cpu_spike')} className="text-xs font-bold bg-amber-500 text-white px-3 py-1.5 rounded shadow-sm hover:bg-amber-600 active:scale-95 active:shadow-inner transition-all">Inject</button>
              )}
            </div>
            <p className="text-[10px] text-amber-700 leading-tight">Simulates a noisy neighbor maximizing CPU limits.</p>
          </div>

          <div className="p-3 border border-rose-200 bg-rose-50 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-1">
              <span className="text-sm font-bold text-rose-900">Memory Leak</span>
              {node?.faults?.hasMemoryLeak ? (
                <button onClick={() => clearFault('memory_leak')} className="text-xs font-bold bg-rose-200 text-rose-800 px-3 py-1.5 rounded shadow-sm hover:bg-rose-300 active:scale-95 active:shadow-inner transition-all">Clear</button>
              ) : (
                <button onClick={() => triggerFault('memory_leak')} className="text-xs font-bold bg-rose-500 text-white px-3 py-1.5 rounded shadow-sm hover:bg-rose-600 active:scale-95 active:shadow-inner transition-all">Inject</button>
              )}
            </div>
            <p className="text-[10px] text-rose-700 leading-tight">Degrades memory until an OOM crash occurs.</p>
          </div>
        </div>

        <h3 className="text-xs font-bold text-rose-400 uppercase mt-8 mb-3">System-Wide Catastrophe</h3>
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => triggerScenario('thanos_snap')} className="bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg shadow-md hover:bg-slate-700 border border-slate-900 active:scale-95 active:shadow-inner transition-all">
            Thanos Snap
          </button>
          <button onClick={() => triggerScenario('split_brain')} className="bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg shadow-md hover:bg-slate-700 border border-slate-900 active:scale-95 active:shadow-inner transition-all">
            Split Brain
          </button>
        </div>

        <div className="mt-8 pt-4 border-t border-slate-200">
          <button 
            onClick={deleteNode} 
            className="w-full bg-rose-50 text-rose-600 text-xs font-bold py-2.5 rounded-lg border border-rose-200 shadow-sm hover:bg-rose-100 hover:text-rose-700 transition-all active:scale-95 active:shadow-inner flex items-center justify-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            Delete Node
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChaosDrawer;