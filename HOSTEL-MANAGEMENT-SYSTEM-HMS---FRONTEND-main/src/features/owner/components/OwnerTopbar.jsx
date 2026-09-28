import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, ChevronDown, ChevronUp, LogOut, Menu } from 'lucide-react';

import { useUnreadNotificationCount } from '../../communication/hooks/useCommunication';
import { OWNER_TOPBAR_UNREAD_QUERY_OPTIONS } from './ownerTopbarOptions';

export default function OwnerTopbar({ me, setMobileSidebarOpen, onLogout, isLoggingOut = false }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  const ownerName = me?.name || me?.email || 'Owner';
  const ownerInitial = ownerName?.charAt(0)?.toUpperCase() || 'O';
  const userId = me?.id || me?.userId || '';

  const unreadQuery = useUnreadNotificationCount(userId, {
    enabled: Boolean(userId),
    ...OWNER_TOPBAR_UNREAD_QUERY_OPTIONS,
  });

  const unreadCount = Number(unreadQuery.data || 0);

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    return () => document.removeEventListener('pointerdown', handlePointerDown);
  }, []);

  const handleLogout = async () => {
    setMenuOpen(false);
    await onLogout?.();
  };

  return (
    <header className="sticky top-0 z-30 border-b border-[#eadfd6] bg-[#fffdf8]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-[1280px] items-center gap-3 px-3 sm:px-4 md:px-5 lg:px-6">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] border border-[#eadfd6] bg-white text-[#45331b] shadow-sm transition hover:bg-[#fff8ed] md:hidden"
          aria-label="Open owner navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <p className="truncate text-[13px] font-semibold text-[#8a8178]">Owner Workspace</p>
        </div>

        <Link
          to="/owner/notifications"
          className="relative inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-[13px] border border-[#eadfd6] bg-white text-[#9a6b1f] shadow-sm transition hover:border-[#cfbfae] hover:bg-[#fff8ed]"
          aria-label={unreadCount > 0 ? `Open notifications, ${unreadCount} unread` : 'Open notifications'}
        >
          <Bell className="h-4 w-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-[#dc2626] px-1 text-[10px] font-black leading-none text-white ring-2 ring-[#fffdf8]">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </Link>

        <div ref={menuRef} className="relative">
          <button
            type="button"
            onClick={() => setMenuOpen((value) => !value)}
            className="flex min-w-0 items-center gap-2 rounded-[14px] border border-[#eadfd6] bg-white px-2.5 py-1.5 shadow-sm transition hover:border-[#cfbfae] hover:bg-[#fff8ed]"
            aria-expanded={menuOpen}
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#e7f3df] text-[13px] font-bold text-[#2f7439]">
              {ownerInitial}
            </div>
            <div className="hidden min-w-0 text-left sm:block">
              <p className="max-w-[150px] truncate text-[13px] font-bold text-[#2d2111]">{ownerName}</p>
              <p className="truncate text-[10px] font-semibold uppercase tracking-[0.08em] text-[#9c9389]">Owner</p>
            </div>

            {menuOpen ? (
              <ChevronUp className="hidden h-4 w-4 text-[#9c9389] sm:block" />
            ) : (
              <ChevronDown className="hidden h-4 w-4 text-[#9c9389] sm:block" />
            )}
          </button>

          {menuOpen ? (
            <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-[16px] border border-[#eadfd6] bg-white shadow-[0_18px_44px_rgba(38,27,14,0.16)]">
              <div className="border-b border-[#f0e7dc] px-4 py-3">
                <p className="truncate text-[13px] font-bold text-[#2d2111]">{ownerName}</p>
                <p className="mt-0.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9c9389]">Owner</p>
              </div>

              <Link
                to="/owner/notifications"
                onClick={() => setMenuOpen(false)}
                className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-[13px] font-semibold text-[#2d2111] transition hover:bg-[#fff8ed]"
              >
                <span className="inline-flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  Notifications
                </span>
                {unreadCount > 0 ? (
                  <span className="rounded-full bg-[#dc2626] px-2 py-0.5 text-[10px] font-black text-white">
                    {unreadCount}
                  </span>
                ) : null}
              </Link>

              <button
                type="button"
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex w-full items-center gap-2 border-t border-[#f0e7dc] px-4 py-3 text-left text-[13px] font-semibold text-[#b45c2b] transition hover:bg-[#fff8ed] disabled:cursor-not-allowed disabled:opacity-60"
              >
                <LogOut className="h-4 w-4" />
                {isLoggingOut ? 'Signing out...' : 'Logout'}
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
