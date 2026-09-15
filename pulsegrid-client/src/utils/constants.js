export const getStatusColors = (status) => {
  switch(status) {
    case 'HEALTHY':
      return { top: '#34D399', left: '#10B981', right: '#059669', dark: '#047857', glow: '#D1FAE5', badge: 'bg-emerald-50 text-emerald-700 border-emerald-200', ring: 'ring-emerald-400/30 border-emerald-400' };
    case 'DEGRADED':
      return { top: '#FCD34D', left: '#F59E0B', right: '#D97706', dark: '#B45309', glow: '#FEF3C7', badge: 'bg-amber-50 text-amber-700 border-amber-200', ring: 'ring-amber-400/40 border-amber-400 animate-pulse' };
    case 'DEAD':
      return { top: '#FDA4AF', left: '#F43F5E', right: '#E11D48', dark: '#BE123C', glow: '#FFE4E6', badge: 'bg-rose-50 text-rose-700 border-rose-200', ring: 'ring-rose-500/40 border-rose-400 opacity-80' };
    case 'RECOVERING':
      return { top: '#7DD3FC', left: '#0EA5E9', right: '#0284C7', dark: '#0369A1', glow: '#E0F2FE', badge: 'bg-sky-50 text-sky-700 border-sky-200', ring: 'ring-sky-400/40 border-sky-400 animate-pulse' };
    case 'ICON':
      // The default pastel Indigo used in the Toolbar
      return { top: '#818CF8', left: '#6366F1', right: '#4F46E5', dark: '#3730A3', glow: '#E0E7FF', badge: '', ring: '' };
    default:
      return { top: '#94A3B8', left: '#64748B', right: '#475569', dark: '#334155', glow: '#F1F5F9', badge: 'bg-slate-100 text-slate-700 border-slate-200', ring: 'border-slate-300' };
  }
};