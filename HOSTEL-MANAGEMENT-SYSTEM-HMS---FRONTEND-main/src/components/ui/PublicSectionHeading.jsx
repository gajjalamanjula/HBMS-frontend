import { Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils/cn';

export default function PublicSectionHeading({
  badge = 'Section',
  title,
  description,
  align = 'left',
  className,
}) {
  return (
    <div
      className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center', className)}
    >
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-700 shadow-sm',
          align === 'center' && 'justify-center'
        )}
      >
        <Sparkles className="h-4 w-4" />
        {badge}
      </div>

      <h2 className="mt-5 text-3xl font-black tracking-tight text-slate-950 sm:text-4xl lg:text-5xl">
        {title}
      </h2>

      {description ? (
        <p className="mt-4 text-sm leading-8 text-slate-600 sm:text-base">
          {description}
        </p>
      ) : null}
    </div>
  );
}
