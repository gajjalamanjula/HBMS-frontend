import { cn } from '../../lib/utils/cn';

export function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <div className={cn('flex flex-col gap-4 md:flex-row md:items-end md:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow ? <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-600">{eyebrow}</p> : null}
        <h1 className="mt-1 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50 sm:text-3xl">{title}</h1>
        {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-500 dark:text-slate-400">{description}</p> : null}
      </div>
      {actions ? <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div> : null}
    </div>
  );
}

export default PageHeader;
