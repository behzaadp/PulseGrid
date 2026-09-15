import React from 'react';
import websocketClient from '../../services/websocketClient';
import { getStatusColors } from '../../utils/constants';
import { GatewayGraphic, AuthGraphic, ServiceGraphic, WorkerGraphic, BrokerGraphic, DatabaseGraphic } from '../shared/NodeGraphics';

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

  // We map the 3D graphics directly to the toolbar buttons
  const nodeTypes = [
    { type: 'gateway', label: 'Gateway', Graphic: GatewayGraphic },
    { type: 'auth', label: 'Auth', Graphic: AuthGraphic },
    { type: 'service', label: 'Service', Graphic: ServiceGraphic },
    { type: 'worker', label: 'Worker', Graphic: WorkerGraphic },
    { type: 'broker', label: 'Broker', Graphic: BrokerGraphic },
    { type: 'db', label: 'Database', Graphic: DatabaseGraphic },
  ];

  // We use the default Indigo/Blue pastel theme for the toolbar icons
  const iconColors = getStatusColors('ICON');

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-md border border-slate-200 shadow-xl rounded-2xl px-6 py-3 z-10 flex items-center gap-8">
      
      {/* 3D Drag & Drop Node Drawer */}
      <div className="flex items-center gap-5 border-r border-slate-200 pr-8">
        {nodeTypes.map((node) => (
          <div
            key={node.type}
            onDragStart={(e) => onDragStart(e, node.type)}
            draggable
            className="flex flex-col items-center gap-1 cursor-grab active:cursor-grabbing hover:scale-110 transition-transform duration-200"
          >
            <node.Graphic colors={iconColors} className="w-10 h-10 drop-shadow-sm" />
            <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">{node.label}</span>
          </div>
        ))}
      </div>

      {/* Tactile Controls */}
      <div className="flex items-center gap-3">
        <select 
          onChange={(e) => loadBlueprint(e.target.value)}
          defaultValue=""
          className="text-xs font-bold bg-slate-50 text-slate-700 border border-slate-200 rounded-lg px-3 py-2 outline-none cursor-pointer hover:bg-slate-100 shadow-sm transition-all"
        >
          <option value="" disabled>Load Blueprint...</option>
          <option value="ecommerce">E-Commerce</option>
          <option value="social_media">Social Media</option>
        </select>

        <button 
          onClick={() => toggleTraffic(true)}
          className="text-xs font-bold bg-emerald-100 text-emerald-700 border border-emerald-200 px-4 py-2 rounded-lg shadow-sm hover:bg-emerald-200 hover:shadow active:scale-95 active:shadow-inner transition-all flex items-center gap-1"
        >
          ▶ <span className="mt-0.5">Start Traffic</span>
        </button>

        <button 
          onClick={() => toggleTraffic(false)}
          className="text-xs font-bold bg-slate-100 text-slate-600 border border-slate-200 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-200 hover:shadow active:scale-95 active:shadow-inner transition-all flex items-center gap-1"
        >
          ⏸ <span className="mt-0.5">Stop</span>
        </button>
      </div>

    </div>
  );
};

export default BuilderToolbar;