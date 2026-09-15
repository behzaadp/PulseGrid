import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import useEngineStore from '../../store/useEngineStore';

const DatabaseNode = ({ id, data, selected }) => {
  const liveNode = useEngineStore((state) => state.nodes[id]);
  const status = liveNode?.status || data.status || 'HEALTHY';
  const metrics = liveNode?.metrics || data.metrics || { cpu: 22, latency: 45, queueDepth: 0 };
  const label = liveNode?.label || data.label || 'Database';

  const statusColors = {
    HEALTHY: { ring: 'ring-emerald-400/30 border-emerald-400', glow: '#10B981', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    DEGRADED: { ring: 'ring-amber-400/40 border-amber-400 animate-pulse', glow: '#F59E0B', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    DEAD: { ring: 'ring-rose-500/40 border-rose-400 opacity-80', glow: '#EF4444', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
    RECOVERING: { ring: 'ring-sky-400/40 border-sky-400 animate-pulse', glow: '#0EA5E9', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  }[status] || { ring: 'border-slate-300', glow: '#64748B', badge: 'bg-slate-100 text-slate-700' };

  return (
    <div className={`relative group w-44 rounded-2xl bg-white/85 backdrop-blur-md p-3.5 border transition-all duration-300 shadow-md hover:shadow-xl ${statusColors.ring} ${selected ? 'ring-2 ring-indigo-500 shadow-indigo-100' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-white" />

      <div className="w-full h-24 flex items-center justify-center">
        <svg viewBox="0 0 120 100" className="w-28 h-24 overflow-visible drop-shadow-sm">
          {/* Bottom Platter */}
          <path d="M 30,58 C 30,70 90,70 90,58 L 90,70 C 90,82 30,82 30,70 Z" fill="#94A3B8" />
          <ellipse cx="60" cy="58" rx="30" ry="12" fill="#E2E8F0" stroke="#CBD5E1" />

          {/* Middle Platter */}
          <path d="M 30,42 C 30,54 90,54 90,42 L 90,52 C 90,64 30,64 30,52 Z" fill="#64748B" />
          <ellipse cx="60" cy="42" rx="30" ry="12" fill="#F1F5F9" stroke="#CBD5E1" />

          {/* Top Platter */}
          <path d="M 30,26 C 30,38 90,38 90,26 L 90,36 C 90,48 30,48 30,36 Z" fill="#94A3B8" />
          <ellipse cx="60" cy="26" rx="30" ry="12" fill="#FFFFFF" stroke="#E2E8F0" strokeWidth="1.5" />

          {/* Core Spindle Hub */}
          <ellipse cx="60" cy="26" rx="12" ry="5" fill="#E2E8F0" />
          <circle cx="60" cy="26" r="3" fill={statusColors.glow} />

          {/* Read/Write Activity Beacons */}
          <circle cx="82" cy="30" r="2" fill={statusColors.glow} className="animate-ping" />
          <circle cx="82" cy="46" r="2" fill={statusColors.glow} />
          <circle cx="82" cy="62" r="2" fill={statusColors.glow} />
        </svg>
      </div>

      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 tracking-tight truncate">{label}</span>
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${statusColors.badge}`}>
          {status}
        </span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-slate-600 font-mono">
        <div className="bg-slate-50/80 rounded px-1 py-0.5 border border-slate-100 text-center">
          <span className="text-[8px] text-slate-400 block">CPU</span>
          {metrics.cpu}%
        </div>
        <div className="bg-slate-50/80 rounded px-1 py-0.5 border border-slate-100 text-center">
          <span className="text-[8px] text-slate-400 block">LAT</span>
          {metrics.latency}ms
        </div>
        <div className="bg-slate-50/80 rounded px-1 py-0.5 border border-slate-100 text-center">
          <span className="text-[8px] text-slate-400 block">QUEUE</span>
          {metrics.queueDepth}
        </div>
      </div>
    </div>
  );
};

export default memo(DatabaseNode);