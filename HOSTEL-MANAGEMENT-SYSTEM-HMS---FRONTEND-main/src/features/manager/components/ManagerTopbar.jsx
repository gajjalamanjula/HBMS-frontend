import { Bell, ChevronDown, ChevronUp, LogOut, Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

import { useCurrentUser } from '../../auth/hooks/useAuth';
import { useUnreadNotificationCount } from '../../communication/hooks/useCommunication';

export default function ManagerTopbar({
  title = 'Manager Workspace',
  subtitle = '',
  me,
  setMobileSidebarOpen,
  onLogout,
  isLoggingOut = false,
}) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);
  const currentUserQuery = useCurrentUser({ enabled: !(me?.id || me?.userId) });
  const currentUser = me || currentUserQuery.data || {};
  const managerName = currentUser?.name || currentUser?.email || 'Manager';
  const managerInitial = managerName?.charAt(0)?.toUpperCase() || 'M';
  const userId = currentUser?.id || currentUser?.userId || '';

  const unreadQuery = useUnreadNotificationCount(userId, {
    enabled: Boolean(userId),
    refetchOnWindowFocus: true,
    staleTime: 60 * 1000,
  });
  const unreadCount = Number(unreadQuery.data || 0);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleLogout = async () => {
    setOpen(false);
    await onLogout?.();
  };

  return (
    <header className="sticky top-0 z-30 min-h-16 border-b border-slate-200 bg-white/95 shadow-[0_8px_24px_rgba(15,23,42,0.04)] backdrop-blur">
      <div className="flex min-h-16 items-center gap-3 px-4 md:px-6 lg:px-8">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[12px] border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
          aria-label="Open manager navigation"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] font-bold text-slate-950 md:text-[16px]">
            {title}
          </h1>
          {subtitle ? (
            <p className="truncate text-[12px] text-slate-500">{subtitle}</p>
          ) : null}
        </div>

        <Link
          to="/manager/notifications"
          className="relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-[14px] border border-slate-200 bg-white text-sky-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50 hover:shadow-md"
          aria-label={unreadCount > 0 ? `Open notifications, ${unreadCount} unread` : 'Open notifications'}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black leading-none text-white ring-2 ring-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </Link>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="flex min-w-0 cursor-pointer items-center gap-2 rounded-[18px] border border-slate-200 bg-white px-2 py-1.5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-100 text-sm font-bold text-sky-800">
              {managerInitial}
            </div>
            <div className="hidden min-w-0 text-left sm:block">
              <p className="truncate text-[13px] font-bold text-slate-950">{managerName}</p>
              <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500">
                Manager
              </p>
            </div>
            {open ? (
              <ChevronUp className="h-4 w-4 text-slate-400" />
            ) : (
              <ChevronDown className="h-4 w-4 text-slate-400" />
            )}
          </button>

          {open ? (
            <div className="absolute right-0 mt-2 w-56 overflow-hidden rounded-[16px] border border-slate-200 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.14)]">
              <Link
                to="/manager/notifications"
                onClick={() => setOpen(false)}
                className="flex items-center justify-between gap-2 px-4 py-3 text-[13px] font-bold text-slate-700 transition hover:bg-slate-50"
              >
                <span className="inline-flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </span>
                {unreadCount > 0 ? (
                  <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-black text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex h-10 w-full cursor-pointer items-center gap-2 border-t border-slate-100 px-4 text-[13px] font-bold text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Logging out...' : 'Logout'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
