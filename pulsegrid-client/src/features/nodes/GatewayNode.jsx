import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import useEngineStore from '../../store/useEngineStore';

const GatewayNode = ({ id, data, selected }) => {
  const liveNode = useEngineStore((state) => state.nodes[id]);
  const status = liveNode?.status || data.status || 'HEALTHY';
  const metrics = liveNode?.metrics || data.metrics || { cpu: 8, latency: 12, queueDepth: 0 };
  const label = liveNode?.label || data.label || 'API Gateway';

  const statusColors = {
    HEALTHY: { ring: 'ring-emerald-400/30 border-emerald-400', glow: '#10B981', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
    DEGRADED: { ring: 'ring-amber-400/40 border-amber-400 animate-pulse', glow: '#F59E0B', badge: 'bg-amber-50 text-amber-700 border-amber-200' },
    DEAD: { ring: 'ring-rose-500/40 border-rose-400 opacity-80', glow: '#EF4444', badge: 'bg-rose-50 text-rose-700 border-rose-200' },
    RECOVERING: { ring: 'ring-sky-400/40 border-sky-400 animate-pulse', glow: '#0EA5E9', badge: 'bg-sky-50 text-sky-700 border-sky-200' },
  }[status] || { ring: 'border-slate-300', glow: '#64748B', badge: 'bg-slate-100 text-slate-700' };

  return (
    <div className={`relative group w-44 rounded-2xl bg-white/85 backdrop-blur-md p-3.5 border transition-all duration-300 shadow-md hover:shadow-xl ${statusColors.ring} ${selected ? 'ring-2 ring-indigo-500 shadow-indigo-100' : ''}`}>
      {/* React Flow Handles */}
      <Handle type="target" position={Position.Top} className="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} className="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-2.5 !h-2.5 !bg-indigo-500 !border-2 !border-white" />

      {/* 3D Isometric Gateway SVG */}
      <div className="w-full h-24 flex items-center justify-center">
        <svg viewBox="0 0 120 100" className="w-28 h-24 overflow-visible drop-shadow-sm">
          {/* Base Plinth */}
          <path d="M 60,82 L 100,62 L 60,42 L 20,62 Z" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />
          <path d="M 20,62 L 60,82 L 60,90 L 20,70 Z" fill="#94A3B8" />
          <path d="M 60,82 L 100,62 L 100,70 L 60,90 Z" fill="#64748B" />

          {/* Left Gateway Pylon */}
          <path d="M 32,56 L 44,50 L 44,22 L 32,28 Z" fill="#F8FAFC" stroke="#E2E8F0" />
          <path d="M 32,28 L 44,22 L 38,18 L 26,24 Z" fill="#FFFFFF" />
          <path d="M 44,22 L 44,50 L 48,48 L 48,20 Z" fill="#CBD5E1" />

          {/* Right Gateway Pylon */}
          <path d="M 76,34 L 88,28 L 88,56 L 76,62 Z" fill="#F8FAFC" stroke="#E2E8F0" />
          <path d="M 76,34 L 88,28 L 82,24 L 70,30 Z" fill="#FFFFFF" />
          <path d="M 88,28 L 88,56 L 92,54 L 92,26 Z" fill="#CBD5E1" />

          {/* Crossbar Header */}
          <path d="M 26,24 L 82,24 L 76,20 L 20,20 Z" fill="#FFFFFF" stroke="#CBD5E1" />
          <path d="M 20,20 L 76,20 L 76,23 L 20,23 Z" fill="#E2E8F0" />

          {/* Active Portal Wave / Energy Core */}
          <ellipse cx="60" cy="46" rx="14" ry="7" fill={statusColors.glow} fillOpacity="0.25" className="animate-pulse" />
          <polygon points="60,34 68,44 60,54 52,44" fill={statusColors.glow} fillOpacity="0.85" className="transition-colors duration-500" />
        </svg>
      </div>

      {/* Label and Status */}
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 tracking-tight truncate">{label}</span>
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${statusColors.badge}`}>
          {status}
        </span>
      </div>

      {/* Real-time Telemetry Pills */}
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

export default memo(GatewayNode);