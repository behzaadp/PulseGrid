import React from 'react';
import useEngineStore from '../../store/useEngineStore';

const TelemetryDashboard = () => {
  // Grab the raw object first to prevent Zustand infinite rendering loops
  const nodesMap = useEngineStore((state) => state.nodes);
  const nodes = Object.values(nodesMap);
  const isConnected = useEngineStore((state) => state.isConnected);

  const totalNodes = nodes.length;
  const degradedCount = nodes.filter((n) => n.status === 'DEGRADED').length;
  const deadCount = nodes.filter((n) => n.status === 'DEAD').length;
  const activeIncidents = degradedCount + deadCount;
  
  const avgApdex = totalNodes > 0 
    ? (nodes.reduce((sum, n) => sum + (n.metrics?.apdex || 1), 0) / totalNodes).toFixed(2)
    : '1.00';

  const totalReqs = nodes.reduce((sum, n) => sum + (n.metrics?.requestsTotal || 0), 0);

  return (
    <div className="absolute top-4 left-4 w-72 bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl p-5 z-10">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider">System HUD</h2>
        <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${isConnected ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
          {isConnected ? 'LIVE' : 'OFFLINE'}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Global Apdex</span>
          <span className={`text-2xl font-black ${avgApdex < 0.7 ? 'text-rose-600' : avgApdex < 0.9 ? 'text-amber-500' : 'text-emerald-500'}`}>
            {avgApdex}
          </span>
        </div>
        <div className="bg-slate-50/50 border border-slate-100 rounded-xl p-3">
          <span className="text-[10px] text-slate-400 font-semibold uppercase block mb-1">Incidents</span>
          <span className={`text-2xl font-black ${activeIncidents > 0 ? 'text-rose-600 animate-pulse' : 'text-slate-700'}`}>
            {activeIncidents}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-medium text-slate-600">
          <span>Active Nodes</span>
          <span className="font-mono text-slate-800">{totalNodes}</span>
        </div>
        <div className="flex justify-between items-center text-xs font-medium text-slate-600">
          <span>Total Requests</span>
          <span className="font-mono text-slate-800">{totalReqs.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
};

export default TelemetryDashboard;