export const getStatusColors = (status) => {
  switch(status) {
    case 'HEALTHY':
      return { top: '#818cf8', left: '#6366f1', right: '#4f46e5', dark: '#3730a3', glow: '#34D399', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', ring: 'ring-emerald-400/30 border-emerald-400' };
    case 'DEGRADED':
      return { top: '#fcd34d', left: '#f59e0b', right: '#d97706', dark: '#92400e', glow: '#FEF3C7', badge: 'bg-amber-50 text-amber-700 border-amber-200', ring: 'ring-amber-400/40 border-amber-400 animate-pulse' };
    case 'DEAD':
      return { top: '#fda4af', left: '#f43f5e', right: '#e11d48', dark: '#9f1239', glow: '#FFE4E6', badge: 'bg-rose-50 text-rose-700 border-rose-200', ring: 'ring-rose-500/40 border-rose-400 opacity-80' };
    case 'RECOVERING':
      return { top: '#7dd3fc', left: '#0ea5e9', right: '#0284c7', dark: '#075985', glow: '#E0F2FE', badge: 'bg-sky-50 text-sky-700 border-sky-200', ring: 'ring-sky-400/40 border-sky-400 animate-pulse' };
    case 'ICON':
      return { top: '#818cf8', left: '#6366f1', right: '#4f46e5', dark: '#3730a3', glow: '#e0e7ff', badge: '', ring: '' };
    default:
      return { top: '#cbd5e1', left: '#94a3b8', right: '#64748b', dark: '#475569', glow: '#f1f5f9', badge: 'bg-slate-100 text-slate-700 border-slate-200', ring: 'border-slate-300' };
  }
};