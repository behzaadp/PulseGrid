import React from 'react';
import websocketClient from '../../services/websocketClient';

// Import all raw SVGs
import GatewayIcon from '../../assets/icons/gateway.svg';
import AuthIcon from '../../assets/icons/auth.svg';
import DatabaseIcon from '../../assets/icons/database.svg';
import BrokerIcon from '../../assets/icons/broker.svg';
import WorkerIcon from '../../assets/icons/worker.svg';
import ServiceIcon from '../../assets/icons/service.svg';

const BuilderToolbar = () => {
  const onDragStart = (event, nodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Correctly placed inside the component
  const clearCanvas = () => {
    websocketClient.sendCommand('CLEAR_TOPOLOGY');
  };

  const nodeTypes = [
    { type: 'gateway', label: 'Gateway', icon: GatewayIcon },
    { type: 'auth', label: 'Auth', icon: AuthIcon },
    { type: 'service', label: 'Service', icon: ServiceIcon },
    { type: 'worker', label: 'Worker', icon: WorkerIcon },
    { type: 'broker', label: 'Broker', icon: BrokerIcon },
    { type: 'db', label: 'Database', icon: DatabaseIcon },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-xl border border-slate-200 shadow-xl rounded-2xl px-6 py-3 z-10 flex items-center gap-8">
      
      {/* Drag & Drop Node Icons */}
      <div className="flex items-center gap-5 border-r border-slate-200 pr-8">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            onDragStart={(e) => onDragStart(e, node.type)}
            draggable
            className="flex flex-col items-center gap-1.5 cursor-grab active:cursor-grabbing hover:-translate-y-1 transition-transform duration-200"
          >
            <img src={node.icon} alt={node.label} className="w-10 h-10 drop-shadow-sm" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{node.label}</span>
          </div>
        ))}
      </div>

      {/* Tactile Flow Controls */}
      <div className="flex items-center gap-3">
        <select 
          onChange={(e) => websocketClient.sendCommand('LOAD_BLUEPRINT', { templateName: e.target.value })}
          defaultValue=""
          className="text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-slate-100 shadow-sm transition-all focus:ring-2 focus:ring-indigo-500"
        >
          <option value="" disabled>Load Blueprint...</option>
          <option value="ecommerce">E-Commerce Architecture</option>
          <option value="social_media">Social Media Feed</option>
        </select>

        <button 
          onClick={() => websocketClient.sendCommand('SET_TRAFFIC', { active: true, rate: 35 })}
          className="text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-200 active:scale-95 active:shadow-inner transition-all flex items-center gap-1"
        >
          ▶ <span className="mt-0.5">Start Traffic</span>
        </button>

        <button 
          onClick={() => websocketClient.sendCommand('SET_TRAFFIC', { active: false, rate: 35 })}
          className="text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-200 active:scale-95 active:shadow-inner transition-all flex items-center gap-1"
        >
          ⏸ <span className="mt-0.5">Stop</span>
        </button>

        {/* Clear Canvas / Trash Button */}
        <button 
          onClick={clearCanvas}
          className="text-rose-600 border border-rose-200 bg-rose-50 px-2 py-2 rounded-lg shadow-sm hover:bg-rose-100 active:scale-95 active:shadow-inner transition-all flex items-center justify-center ml-2"
          title="Clear Canvas"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
        </button>
      </div>
    </div>
  );
};

export default BuilderToolbar;