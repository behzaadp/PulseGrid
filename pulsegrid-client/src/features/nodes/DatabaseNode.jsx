import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import useEngineStore from '../../store/useEngineStore';
import { getStatusColors } from '../../utils/constants';
import { DatabaseGraphic } from '../../components/shared/NodeGraphics'; // <-- Change import per file

const DatabaseNode = ({ id, data, selected }) => {
  const liveNode = useEngineStore((state) => state.nodes[id]);
  const status = liveNode?.status || data.status || 'HEALTHY';
  const metrics = liveNode?.metrics || data.metrics || { cpu: 0, latency: 0, queueDepth: 0 };
  const label = liveNode?.label || data.label || 'Database';
  const colors = getStatusColors(status);

  return (
    <div className={`relative group w-36 rounded-2xl bg-white/85 backdrop-blur-md p-3 border shadow-sm transition-all duration-300 ${colors.ring} ${selected ? 'ring-2 ring-indigo-500 shadow-xl' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-indigo-500 !border-2 !border-white" />

      <div className="w-full h-24 flex items-center justify-center">
        {/* Change component name below for Database, Worker, etc. */}
        <DatabaseGraphic colors={colors} className="w-24 h-24 drop-shadow-md transition-colors duration-500" />
      </div>

      <div className="mt-2 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 tracking-tight truncate pr-2">{label}</span>
        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full border ${colors.badge}`}>{status}</span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1 text-[9px] text-slate-600 font-mono">
        <div className="bg-slate-50/80 rounded px-1 py-1 border border-slate-100 text-center"><span className="text-[7px] font-bold text-slate-400 block uppercase">CPU</span>{metrics.cpu}%</div>
        <div className="bg-slate-50/80 rounded px-1 py-1 border border-slate-100 text-center"><span className="text-[7px] font-bold text-slate-400 block uppercase">Lat</span>{metrics.latency}ms</div>
        <div className="bg-slate-50/80 rounded px-1 py-1 border border-slate-100 text-center"><span className="text-[7px] font-bold text-slate-400 block uppercase">Queue</span>{metrics.queueDepth}</div>
      </div>
    </div>
  );
};

export default memo(DatabaseNode);