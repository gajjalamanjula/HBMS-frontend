import { useEffect, useMemo, useRef, useState } from 'react';
import {
  Bell,
  ChevronDown,
  ChevronUp,
  LogOut,
  Menu,
  ShieldCheck,
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';

import { useLogout } from '../../auth/hooks/useAuth';
import { useUnreadNotificationCount } from '../../communication/hooks/useCommunication';
import useCurrentSuperAdmin from '../hooks/useCurrentSuperAdmin';

const titles = {
  '/superadmin/dashboard': 'Dashboard',
  '/superadmin/owners': 'Owners',
  '/superadmin/users': 'Users',
  '/superadmin/branches': 'Branches',
  '/superadmin/audit-logs': 'Audit Logs',
  '/superadmin/system-health': 'System Health',
  '/superadmin/notifications': 'Notifications',
};

function getInitials(name = '', email = '') {
  const source = String(name || '').trim() || String(email || '').trim();

  if (!source) return 'SA';

  return source
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() || '')
    .join('');
}

export default function SuperAdminHeader({ onMenuClick }) {
  const [profileOpen, setProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();

  const { data } = useCurrentSuperAdmin();
  const logoutMutation = useLogout();

  const userId = data?.id || data?.userId || '';
  const unreadQuery = useUnreadNotificationCount(userId, {
    enabled: Boolean(userId),
  });

  const unreadCount = Number(unreadQuery.data || 0);
  const pageTitle = titles[location.pathname] || 'Dashboard';

  const profile = useMemo(() => {
    const name = data?.name || data?.fullName || 'Super Admin';
    const email = data?.email || '';

    return {
      name,
      email,
      initials: getInitials(name, email),
    };
  }, [data]);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!profileRef.current) return;

      if (!profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setProfileOpen(false);
      }
    }

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  const handleLogout = async () => {
    setProfileOpen(false);

    try {
      await logoutMutation.mutateAsync();
    } catch {
      // useLogout handles local cleanup and toast.
    }
  };

  const openNotifications = () => {
    setProfileOpen(false);
    navigate('/superadmin/notifications');
  };

  return (
    <header className="sticky top-0 z-30 h-16 shrink-0 border-b border-slate-200 bg-white/95 shadow-[0_8px_30px_rgba(15,23,42,0.04)] backdrop-blur">
      <div className="flex h-full min-w-0 items-center justify-between gap-3 px-4 sm:px-5 md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <button
            type="button"
            onClick={onMenuClick}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 md:hidden"
            aria-label="Open Super Admin menu"
          >
            <Menu className="h-5 w-5" />
          </button>

          <div className="min-w-0">
            <div className="truncate text-sm font-bold text-slate-900">
              Super Admin Workspace
            </div>
            <div className="truncate text-xs text-slate-500">{pageTitle}</div>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <button
            type="button"
            onClick={openNotifications}
            className="relative inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:text-indigo-700 hover:shadow-md"
            aria-label="Open notifications"
          >
            <Bell className="h-5 w-5" />

            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </button>

          <div ref={profileRef} className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex h-11 min-w-0 items-center gap-3 rounded-2xl border border-slate-200 bg-white px-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              aria-expanded={profileOpen}
              aria-controls="superadmin-profile-menu"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-50 text-xs font-black text-indigo-700">
                {profile.initials}
              </div>

              <div className="hidden min-w-0 text-left sm:block">
                <div className="max-w-[180px] truncate text-sm font-bold text-slate-900">
                  {profile.name}
                </div>
                <div className="max-w-[180px] truncate text-[11px] font-bold uppercase tracking-[0.12em] text-slate-400">
                  SUPER ADMIN
                </div>
              </div>

              {profileOpen ? (
                <ChevronUp className="h-4 w-4 text-slate-400" />
              ) : (
                <ChevronDown className="h-4 w-4 text-slate-400" />
              )}
            </button>

            {profileOpen ? (
              <div id="superadmin-profile-menu" className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-[0_24px_70px_rgba(15,23,42,0.16)]">
                <div className="border-b border-slate-100 p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-50 text-sm font-black text-indigo-700">
                      {profile.initials}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-slate-900">
                        {profile.name}
                      </p>
                      <p className="truncate text-xs text-slate-500">
                        {profile.email || 'Profile email not available'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-2">
                  <button
                    type="button"
                    onClick={openNotifications}
                    className="flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
                  >
                    <Bell className="h-4 w-4" />
                    Notifications {unreadCount > 0 ? `(${unreadCount})` : ''}
                  </button>

                  <div className="flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold text-emerald-700">
                    <ShieldCheck className="h-4 w-4" />
                    Protected SUPER_ADMIN session
                  </div>

                  <button
                    type="button"
                    onClick={handleLogout}
                    disabled={logoutMutation.isPending}
                    className="mt-1 flex h-10 w-full items-center gap-2 rounded-xl px-3 text-sm font-bold text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <LogOut className="h-4 w-4" />
                    {logoutMutation.isPending ? 'Signing out...' : 'Logout'}
                  </button>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
}
