import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import useEngineStore from '../../store/useEngineStore';

const AuthNode = ({ id, data, selected }) => {
  const liveNode = useEngineStore((state) => state.nodes[id]);
  const status = liveNode?.status || data.status || 'HEALTHY';
  const metrics = liveNode?.metrics || data.metrics || { cpu: 15, latency: 28, queueDepth: 0 };
  const label = liveNode?.label || data.label || 'Auth Service';

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
          {/* Base Octagonal Platform */}
          <polygon points="60,82 92,66 92,58 60,74 28,58 28,66" fill="#94A3B8" />
          <polygon points="60,74 92,58 60,42 28,58" fill="#E2E8F0" stroke="#CBD5E1" strokeWidth="1" />

          {/* Central Security Vault Monolith */}
          <path d="M 44,52 L 60,60 L 60,26 L 44,18 Z" fill="#F8FAFC" stroke="#E2E8F0" />
          <path d="M 60,60 L 76,52 L 76,18 L 60,26 Z" fill="#CBD5E1" />
          <path d="M 44,18 L 60,26 L 76,18 L 60,10 Z" fill="#FFFFFF" stroke="#CBD5E1" />

          {/* Embedded Cryptographic Key Crest */}
          <circle cx="60" cy="38" r="8" fill={statusColors.glow} fillOpacity="0.2" />
          <path d="M 57,36 A 3,3 0 1,1 63,36 C 63,38 61,40 61,43 L 59,43 C 59,40 57,38 57,36 Z" fill={statusColors.glow} />
          
          {/* Floating Verification Shield Ring */}
          <ellipse cx="60" cy="38" rx="20" ry="9" fill="none" stroke={statusColors.glow} strokeWidth="1.5" strokeDasharray="4 2" className="animate-spin" style={{ transformOrigin: '60px 38px', animationDuration: '8s' }} />
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

export default memo(AuthNode);