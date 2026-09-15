import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import useEngineStore from '../../store/useEngineStore';
import { getStatusColors } from '../../utils/constants';
import { ServiceGraphic } from '../../components/shared/NodeGraphics';

const ServiceNode = ({ id, data, selected }) => {
  const liveNode = useEngineStore((state) => state.nodes[id]);
  const status = liveNode?.status || data.status || 'HEALTHY';
  const metrics = liveNode?.metrics || data.metrics || { cpu: 0, latency: 0, queueDepth: 0 };
  const label = liveNode?.label || data.label || 'Generic Node';
  const colors = getStatusColors(status);

  return (
    <div className={`relative group w-40 rounded-2xl bg-white/85 backdrop-blur-md p-3 border transition-all duration-300 shadow-md hover:shadow-xl ${colors.ring} ${selected ? 'ring-2 ring-indigo-500 shadow-indigo-100' : ''}`}>
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="target" position={Position.Left} className="!w-2 !h-2 !bg-indigo-500 !border-2 !border-white" />
      <Handle type="source" position={Position.Right} className="!w-2 !h-2 !bg-indigo-500 !border-2 !border-white" />

      <div className="w-full h-24 flex items-center justify-center">
        <ServiceGraphic colors={colors} className="w-28 h-28 drop-shadow-md transition-colors duration-500" />
      </div>

      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs font-bold text-slate-800 tracking-tight truncate">{label}</span>
        <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border ${colors.badge}`}>{status}</span>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-1 text-[10px] text-slate-600 font-mono">
        <div className="bg-slate-50/80 rounded px-1 py-0.5 border border-slate-100 text-center"><span className="text-[8px] text-slate-400 block">CPU</span>{metrics.cpu}%</div>
        <div className="bg-slate-50/80 rounded px-1 py-0.5 border border-slate-100 text-center"><span className="text-[8px] text-slate-400 block">LAT</span>{metrics.latency}ms</div>
        <div className="bg-slate-50/80 rounded px-1 py-0.5 border border-slate-100 text-center"><span className="text-[8px] text-slate-400 block">QUEUE</span>{metrics.queueDepth}</div>
      </div>
    </div>
  );
};
export default memo(ServiceNode);