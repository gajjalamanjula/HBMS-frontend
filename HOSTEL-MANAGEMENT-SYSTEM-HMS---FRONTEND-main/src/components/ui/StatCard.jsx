import { cn } from '../../lib/utils/cn';
import Card from './Card';

export function StatCard({ title, value, description, icon: Icon, trend, tone = 'emerald', className }) {
  const toneClass = {
    emerald: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300',
    sky: 'bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300',
    amber: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300',
    rose: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300',
    slate: 'bg-slate-100 text-slate-700 dark:bg-slate-900 dark:text-slate-300',
  }[tone] || 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300';

  return (
    <Card className={cn('p-5', className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="mt-2 text-2xl font-black tracking-tight text-slate-950 dark:text-slate-50">{value ?? 0}</p>
        </div>
        {Icon ? <div className={cn('flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl', toneClass)}><Icon className="h-5 w-5" /></div> : null}
      </div>
      {description || trend ? (
        <div className="mt-4 flex items-center justify-between gap-3 text-sm">
          {description ? <p className="text-slate-500 dark:text-slate-400">{description}</p> : <span />}
          {trend ? <span className="font-semibold text-emerald-600">{trend}</span> : null}
        </div>
      ) : null}
    </Card>
  );
}

export default StatCard;
