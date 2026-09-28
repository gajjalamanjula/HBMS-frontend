import { cn } from '../utils/cn';

const baseInteractive =
  'transition-all duration-300 ease-out will-change-transform motion-reduce:transition-none motion-reduce:transform-none';

export const dashboardTheme = {
  shell(darkMode) {
    return cn(
      'min-h-screen',
      baseInteractive,
      darkMode
        ? 'bg-[radial-gradient(circle_at_top_left,_rgba(20,184,166,0.08),_transparent_24%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_22%),linear-gradient(180deg,_#020617_0%,_#0f172a_100%)] text-white'
        : 'bg-[radial-gradient(circle_at_top_left,_rgba(16,185,129,0.10),_transparent_20%),radial-gradient(circle_at_top_right,_rgba(59,130,246,0.08),_transparent_18%),radial-gradient(circle_at_bottom_right,_rgba(245,158,11,0.06),_transparent_16%),linear-gradient(180deg,_#f7fafc_0%,_#f8fafc_48%,_#fffdf9_100%)] text-slate-900'
    );
  },

  topbar(darkMode) {
    return cn(
      'sticky top-0 z-20 border-b backdrop-blur-xl',
      baseInteractive,
      darkMode ? 'border-white/10 bg-slate-950/78' : 'border-black/5 bg-white/78'
    );
  },

  sidebar(darkMode) {
    return cn(
      'border-r',
      baseInteractive,
      darkMode
        ? 'border-white/10 bg-[linear-gradient(180deg,_#020617_0%,_#071224_100%)]'
        : 'border-black/5 bg-[linear-gradient(180deg,_#f7faf8_0%,_#fbfcfa_100%)]'
    );
  },

  surface(darkMode, className = '') {
    return cn(
      'rounded-3xl border',
      baseInteractive,
      'shadow-[0_12px_34px_rgba(15,23,42,0.06)] hover:-translate-y-0.5 hover:shadow-[0_18px_44px_rgba(15,23,42,0.10)]',
      darkMode
        ? 'border-white/10 bg-slate-900/72 shadow-[0_16px_40px_rgba(2,6,23,0.36)] hover:shadow-[0_24px_56px_rgba(2,6,23,0.42)]'
        : 'border-slate-200/90 bg-white/90',
      className
    );
  },

  subtleSurface(darkMode, className = '') {
    return cn(
      'rounded-2xl border',
      baseInteractive,
      darkMode ? 'border-white/10 bg-white/[0.03]' : 'border-slate-200 bg-slate-50/80',
      className
    );
  },

  iconButton(darkMode, className = '') {
    return cn(
      'inline-flex items-center justify-center rounded-2xl',
      baseInteractive,
      'hover:-translate-y-0.5 active:translate-y-0 focus-visible:outline-none focus-visible:ring-4',
      darkMode
        ? 'border border-white/10 bg-white/[0.03] text-slate-200 hover:bg-white/[0.06] hover:shadow-[0_10px_28px_rgba(15,23,42,0.28)] focus-visible:ring-cyan-400/20'
        : 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] focus-visible:ring-cyan-200',
      className
    );
  },

  search(darkMode, className = '') {
    return cn(
      'group flex items-center gap-3 rounded-2xl border px-4',
      baseInteractive,
      'focus-within:-translate-y-0.5 focus-within:shadow-[0_14px_30px_rgba(15,23,42,0.08)]',
      darkMode
        ? 'border-white/10 bg-white/[0.03] hover:bg-white/[0.05] focus-within:border-cyan-400/20'
        : 'border-slate-200 bg-white hover:bg-white focus-within:border-cyan-200',
      className
    );
  },

  navItem(darkMode, isActive) {
    return cn(
      'group flex items-center rounded-2xl text-sm font-medium',
      baseInteractive,
      'hover:-translate-y-0.5',
      isActive
        ? darkMode
          ? 'bg-[linear-gradient(90deg,_rgba(20,184,166,0.18)_0%,_rgba(59,130,246,0.10)_100%)] text-cyan-100 ring-1 ring-cyan-400/15 shadow-[0_10px_30px_rgba(20,184,166,0.10)]'
          : 'bg-[linear-gradient(90deg,_#ecfdf5_0%,_#eff6ff_100%)] text-teal-800 ring-1 ring-emerald-200 shadow-[0_12px_28px_rgba(16,185,129,0.10)]'
        : darkMode
          ? 'text-slate-300 hover:bg-white/[0.04] hover:text-white hover:shadow-[0_8px_24px_rgba(15,23,42,0.22)]'
          : 'text-slate-700 hover:bg-white hover:text-slate-950 hover:shadow-[0_12px_24px_rgba(15,23,42,0.06)]'
    );
  },

  badge(darkMode, tone = 'slate') {
    const tones = {
      slate: darkMode ? 'bg-white/10 text-slate-200' : 'bg-slate-100 text-slate-700',
      cyan: darkMode ? 'bg-cyan-500/10 text-cyan-300' : 'bg-cyan-50 text-cyan-700',
      emerald: darkMode
        ? 'bg-emerald-500/10 text-emerald-300'
        : 'bg-emerald-50 text-emerald-700',
      amber: darkMode ? 'bg-amber-500/10 text-amber-300' : 'bg-amber-50 text-amber-700',
      rose: darkMode ? 'bg-rose-500/10 text-rose-300' : 'bg-rose-50 text-rose-700',
      violet: darkMode
        ? 'bg-violet-500/10 text-violet-300'
        : 'bg-violet-50 text-violet-700',
      sky: darkMode ? 'bg-sky-500/10 text-sky-300' : 'bg-sky-50 text-sky-700',
    };

    return cn(
      'inline-flex items-center rounded-2xl px-3 py-1 text-xs font-semibold',
      baseInteractive,
      tones[tone] || tones.slate
    );
  },

  input(darkMode, className = '') {
    return cn(
      'h-14 w-full rounded-2xl border px-4 text-base outline-none',
      baseInteractive,
      'focus-visible:ring-4',
      darkMode
        ? 'border-white/10 bg-white/[0.03] text-white placeholder:text-slate-500 focus-visible:border-cyan-400/20 focus-visible:ring-cyan-400/10'
        : 'border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus-visible:border-cyan-300 focus-visible:ring-cyan-100',
      className
    );
  },

  tableWrap(darkMode, className = '') {
    return cn(
      'overflow-hidden rounded-3xl border',
      baseInteractive,
      darkMode ? 'border-white/10 bg-slate-900/72' : 'border-slate-200 bg-white',
      className
    );
  },

  tableHead(darkMode) {
    return darkMode ? 'bg-slate-950/80 text-slate-300' : 'bg-slate-50 text-slate-500';
  },

  tableRow(darkMode) {
    return cn(
      'border-t',
      baseInteractive,
      darkMode
        ? 'border-white/10 hover:bg-white/[0.03]'
        : 'border-slate-100 hover:bg-slate-50/80'
    );
  },

  overlay: 'fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-[1px]',
};
