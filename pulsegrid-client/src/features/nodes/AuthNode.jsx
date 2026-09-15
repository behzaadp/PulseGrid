import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import useEngineStore from '../../store/useEngineStore';
import { getStatusColors } from '../../utils/constants';

// Import your raw SVG file directly
import AuthIcon from '../../assets/icons/auth.svg';

const AuthNode = ({ id, data, selected }) => {
  const liveNode = useEngineStore((state) => state.nodes[id]);
  const status = liveNode?.status || data.status || 'HEALTHY';
  const metrics = liveNode?.metrics || data.metrics || { cpu: 0, latency: 0, queueDepth: 0 };
  const label = liveNode?.label || data.label || 'Authentication Service';
  const colors = getStatusColors(status);

  return (
    <div className={`relative group w-36 rounded-2xl bg-white backdrop-blur-md p-3 border shadow-sm transition-all duration-300 ${colors.ring} ${colors.bg} ${selected ? 'ring-2 ring-indigo-500 shadow-xl scale-105' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-indigo-500 !border-2 !border-white" />

      {/* Image Container with Dynamic Status Glow */}
      <div className="w-full h-20 flex items-center justify-center relative">
        <div 
          className="absolute w-16 h-16 rounded-full blur-xl opacity-30 transition-colors duration-500" 
          style={{ backgroundColor: colors.glow }}
        />
        <img src={AuthIcon} alt="Authentication" className="w-16 h-16 drop-shadow-md relative z-10" />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 tracking-tight truncate pr-2">{label}</span>
        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${colors.badge}`}>{status}</span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1 text-[9px] text-slate-600 font-mono">
        <div className="bg-white/80 rounded px-1 py-1 border border-slate-200 text-center shadow-sm"><span className="text-[7px] font-bold text-slate-400 block uppercase">CPU</span>{metrics.cpu}%</div>
        <div className="bg-white/80 rounded px-1 py-1 border border-slate-200 text-center shadow-sm"><span className="text-[7px] font-bold text-slate-400 block uppercase">Lat</span>{metrics.latency}ms</div>
        <div className="bg-white/80 rounded px-1 py-1 border border-slate-200 text-center shadow-sm"><span className="text-[7px] font-bold text-slate-400 block uppercase">Queue</span>{metrics.queueDepth}</div>
      </div>
    </div>
  );
};

export default memo(AuthNode);