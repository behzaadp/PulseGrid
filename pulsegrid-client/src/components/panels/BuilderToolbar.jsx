import React from 'react';
import websocketClient from '../../services/websocketClient';

const BuilderToolbar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const loadBlueprint = (templateName) => {
    websocketClient.sendCommand('LOAD_BLUEPRINT', { templateName });
  };

  const toggleTraffic = (active) => {
    websocketClient.sendCommand('SET_TRAFFIC', { active, rate: 35 });
  };

  const nodeTypes = [
    { type: 'gateway', label: 'Gateway', color: 'bg-indigo-100 text-indigo-700 border-indigo-200' },
    { type: 'auth', label: 'Auth', color: 'bg-violet-100 text-violet-700 border-violet-200' },
    { type: 'service', label: 'Service', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    { type: 'worker', label: 'Worker', color: 'bg-cyan-100 text-cyan-700 border-cyan-200' },
    { type: 'broker', label: 'Broker', color: 'bg-fuchsia-100 text-fuchsia-700 border-fuchsia-200' },
    { type: 'db', label: 'Database', color: 'bg-teal-100 text-teal-700 border-teal-200' },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-slate-200 shadow-lg rounded-2xl px-6 py-3 z-10 flex items-center gap-6">
      
      {/* Drag & Drop Nodes */}
      <div className="flex items-center gap-2 border-r border-slate-200 pr-6">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            onDragStart={(e) => onDragStart(e, node.type)}
            draggable
            className={`px-3 py-1.5 text-xs font-bold rounded-lg border shadow-sm cursor-grab active:cursor-grabbing hover:scale-105 transition-transform ${node.color}`}
          >
            + {node.label}
          </div>
        ))}
      </div>

      {/* Traffic & Blueprints */}
      <div className="flex items-center gap-2">
        <select 
          onChange={(e) => loadBlueprint(e.target.value)}
          defaultValue=""
          className="text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 rounded-lg px-3 py-1.5 outline-none cursor-pointer hover:bg-slate-200"
        >
          <option value="" disabled>Load Blueprint...</option>
          <option value="ecommerce">E-Commerce</option>
          <option value="social_media">Social Media</option>
        </select>

        <button 
          onClick={() => toggleTraffic(true)}
          className="text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-lg hover:bg-emerald-200"
        >
          ▶ Start Traffic
        </button>
        <button 
          onClick={() => toggleTraffic(false)}
          className="text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-200"
        >
          ⏸ Stop
        </button>
      </div>

    </div>
  );
};

export default BuilderToolbar;