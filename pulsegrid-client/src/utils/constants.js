export const getStatusColors = (status) => {
  switch(status) {
    case 'HEALTHY':
      return { bg: 'bg-emerald-500/10', glow: '#10B981', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', ring: 'ring-emerald-400/60 border-emerald-400' };
    case 'DEGRADED':
      return { bg: 'bg-amber-500/10', glow: '#F59E0B', badge: 'bg-amber-50 text-amber-700 border-amber-200', ring: 'ring-amber-400/60 border-amber-400 animate-pulse' };
    case 'DEAD':
      return { bg: 'bg-rose-500/10', glow: '#EF4444', badge: 'bg-rose-50 text-rose-700 border-rose-200', ring: 'ring-rose-500/60 border-rose-400 opacity-80' };
    case 'RECOVERING':
      return { bg: 'bg-sky-500/10', glow: '#0EA5E9', badge: 'bg-sky-50 text-sky-700 border-sky-200', ring: 'ring-sky-400/60 border-sky-400 animate-pulse' };
    default:
      return { bg: 'bg-slate-500/5', glow: '#64748B', badge: 'bg-slate-100 text-slate-700 border-slate-200', ring: 'border-slate-300' };
  }
};