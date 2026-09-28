import { cn } from '../../../lib/utils/cn';

export default function OwnerDashboardShell({ children }) {
  return (
    <div
      className={cn(
        'min-h-screen w-full bg-[#f8f1ec] text-[#2d2111]',
        'selection:bg-[#c8dcbc] selection:text-[#2d2111]'
      )}
    >
      {children}
    </div>
  );
}
