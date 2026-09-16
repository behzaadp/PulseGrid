import React from 'react';
import useEngineStore from '../../store/useEngineStore';
import useUiStore from '../../store/useUiStore';
import websocketClient from '../../services/websocketClient';

const EdgeInspector = () => {
  const selectedEdgeId = useUiStore((state) => state.selectedEdgeId);
  const clearSelection = useUiStore((state) => state.clearSelection);
  const edge = useEngineStore((state) => state.edges[selectedEdgeId]);

  if (!selectedEdgeId || !edge) return null;

  const isSevered = edge.status === 'SEVERED';
  const cbState = edge.cbState || 'CLOSED';

  const toggleSever = () => websocketClient.sendCommand('TOGGLE_EDGE', { id: edge.id });
  const deleteEdge = () => {
    websocketClient.sendCommand('REMOVE_EDGE', { id: edge.id });
    clearSelection();
  };

  return (
    <div className="absolute top-0 right-0 h-full w-[320px] bg-white/95 backdrop-blur-2xl border-l border-slate-200 shadow-2xl z-20 flex flex-col transition-transform duration-300">
      
      <div className="p-5 border-b border-slate-200 bg-slate-50/50">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h2 className="text-lg font-black text-slate-800">Network Link</h2>
            <span className="text-[10px] font-mono text-slate-500">{edge.id}</span>
          </div>
          <button onClick={clearSelection} className="text-slate-400 hover:text-slate-800 text-xl font-bold px-2 py-1 active:scale-90 transition-transform">×</button>
        </div>
        <span className={`inline-block text-[10px] font-bold px-2 py-1 rounded-full border ${isSevered ? 'bg-rose-50 text-rose-700 border-rose-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}>
          {isSevered ? 'SEVERED' : 'CONNECTED'}
        </span>
      </div>

      <div className="flex-grow p-5 space-y-6">
        <div>
          <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Link Telemetry</h3>
          <div className="grid grid-cols-2 gap-3 font-mono text-sm">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase mb-1">In Transit</span>
              <span className="text-lg text-slate-800 font-bold">{edge.inTransitCount || 0}</span>
            </div>
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 shadow-sm">
              <span className="text-[10px] text-slate-400 block font-sans font-bold uppercase mb-1">Dropped</span>
              <span className={`text-lg font-bold ${edge.metrics?.packetsDropped > 0 ? 'text-amber-600' : 'text-slate-800'}`}>{edge.metrics?.packetsDropped || 0}</span>
            </div>
          </div>
        </div>

        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-sm">
           <span className="text-xs font-bold text-slate-500 uppercase block mb-1">Circuit Breaker</span>
           <span className={`text-sm font-bold ${cbState === 'OPEN' ? 'text-rose-600' : cbState === 'HALF_OPEN' ? 'text-amber-500' : 'text-emerald-500'}`}>
             STATE: {cbState}
           </span>
           <p className="text-[10px] text-slate-500 mt-1 leading-tight">If downstream nodes fail, the breaker opens to prevent cascading failure.</p>
        </div>

        <div className="pt-4 border-t border-slate-200">
           <h3 className="text-xs font-bold text-slate-400 uppercase mb-3">Network Partition</h3>
           <button 
             onClick={toggleSever} 
             className={`w-full text-xs font-bold py-2.5 rounded-lg border shadow-sm active:scale-95 transition-all ${isSevered ? 'bg-emerald-500 text-white border-emerald-600 hover:bg-emerald-600' : 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'}`}
           >
             {isSevered ? 'Restore Connection' : '✂️ Sever Network Link'}
           </button>
        </div>
      </div>

      <div className="p-5 border-t border-slate-200 bg-slate-50/50">
        <button onClick={deleteEdge} className="w-full bg-white text-rose-600 text-xs font-bold py-2.5 rounded-lg border border-rose-200 shadow-sm hover:bg-rose-50 active:scale-95 transition-all">
          Delete Edge
        </button>
      </div>
    </div>
  );
};

export default EdgeInspector;