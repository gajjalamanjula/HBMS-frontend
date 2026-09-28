import { Inbox } from 'lucide-react';

export default function EmptyState({
  title = 'No data found',
  message = 'There is nothing to show right now.',
  description,
  action,
  icon: Icon = Inbox,
  className = '',
}) {
  const body = description || message;

  return (
    <div className={`rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm ${className}`}>
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
      {body ? <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">{body}</p> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
