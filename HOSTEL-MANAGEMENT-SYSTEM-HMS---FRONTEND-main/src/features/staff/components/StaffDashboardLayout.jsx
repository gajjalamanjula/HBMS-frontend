import {
  Bell,
  Building2,
  ChevronDown,
  ClipboardCheck,
  FileText,
  Grid2X2,
  KeyRound,
  LogOut,
  Megaphone,
  Menu,
  ShieldCheck,
  UserRound,
  Utensils,
  X,
} from 'lucide-react';
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import RouteOutletBoundary from '../../../components/error/RouteOutletBoundary';
import { useUnreadNotificationCount } from '../../communication/hooks/useCommunication';
import { useLogout } from '../../auth/hooks/useAuth';
import { getStaffInitials } from '../mappers/staffMappers';
import { useStaffProfile } from '../hooks/useStaffProfile';

const navItems = [
  { label: 'Dashboard', path: '/staff/dashboard', icon: Grid2X2 },
  { label: 'Assigned Complaints', path: '/staff/complaints', icon: ClipboardCheck },
  { label: 'Food Menu', path: '/staff/food-menu', icon: Utensils },
  { label: 'KYC Documents', path: '/staff/kyc', icon: ShieldCheck },
  { label: 'My Profile', path: '/staff/profile', icon: UserRound },
  { label: 'Announcements', path: '/staff/announcements', icon: Megaphone },
  { label: 'Notifications', path: '/staff/notifications', icon: Bell },
  { label: 'Settings', path: '/staff/settings', icon: KeyRound },
];

function StaffSidebar({ onClose, onLogout, isLoggingOut = false }) {
  return (
    <aside className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-3 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-sm">
          <Building2 className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-semibold leading-5 text-slate-950">Staff Portal</h1>
          <p className="text-xs text-slate-500">Staff</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 p-3">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={onClose}
              className={({ isActive }) =>
                [
                  'flex min-h-11 items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-950',
                ].join(' ')
              }
            >
              <Icon className="h-4 w-4 shrink-0" />
              <span className="truncate">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-3">
        <button
          type="button"
          onClick={onLogout}
          disabled={isLoggingOut}
          className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </aside>
  );
}

export default function StaffDashboardLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const logoutMutation = useLogout();
  const staffQuery = useStaffProfile();
  const user = staffQuery.data || {};
  const initials = getStaffInitials(user.name);
  const userSub = user.email || user.branchName || 'Staff';
  const userId = user.id || user.userId || '';
  const unreadQuery = useUnreadNotificationCount(userId, {
    enabled: Boolean(userId),
    refetchOnWindowFocus: true,
  });
  const unreadCount = Number(unreadQuery.data || 0);

  const handleLogout = async () => {
    setProfileOpen(false);
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // Logout hook already performs local cleanup and shows controlled feedback.
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-950">
      <div className="fixed inset-y-0 left-0 z-40 hidden lg:block">
        <StaffSidebar onLogout={handleLogout} isLoggingOut={logoutMutation.isPending} />
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/50"
            aria-label="Close sidebar"
            onClick={() => setMobileOpen(false)}
          />

          <div className="relative h-full w-64">
            <StaffSidebar
              onClose={() => setMobileOpen(false)}
              onLogout={handleLogout}
              isLoggingOut={logoutMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg bg-white text-slate-700 shadow"
              aria-label="Close menu"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : null}

      <div className="min-h-screen min-w-0 overflow-x-hidden lg:pl-64">
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white/90 px-4 backdrop-blur md:px-6">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 shadow-sm transition hover:bg-slate-50 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="min-w-0">
              <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">
                Staff Portal
              </p>
              <p className="truncate text-sm font-semibold text-slate-950">
                Daily tasks, updates and documents
              </p>
            </div>
          </div>

          <NavLink
            to="/staff/notifications"
            className="relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-xl border border-slate-200 bg-white text-sky-700 shadow-sm transition hover:bg-sky-50"
            aria-label={unreadCount > 0 ? `Open notifications, ${unreadCount} unread` : 'Open notifications'}
          >
            <Bell className="h-4 w-4" />
            {unreadCount > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-black leading-none text-white ring-2 ring-white">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            ) : null}
          </NavLink>

          <div className="relative">
            <button
              type="button"
              onClick={() => setProfileOpen((value) => !value)}
              className="flex min-w-0 cursor-pointer items-center gap-3 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 shadow-sm transition hover:bg-slate-50"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-sky-600 text-sm font-semibold text-white">
                {initials}
              </div>
              <div className="hidden min-w-0 text-left sm:block">
                <p className="truncate text-sm font-medium leading-5 text-slate-950">
                  {user.name || 'Staff'}
                </p>
                <p className="max-w-48 truncate text-xs text-slate-500">{userSub}</p>
              </div>
              <ChevronDown className="hidden h-4 w-4 text-slate-500 sm:block" />
            </button>

            {profileOpen ? (
              <div className="absolute right-0 top-12 w-56 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl">
                <div className="border-b border-slate-100 px-4 py-3">
                  <p className="truncate text-sm font-semibold text-slate-950">{user.name || 'Staff'}</p>
                  <p className="truncate text-xs text-slate-500">{user.email || '-'}</p>
                </div>
                <NavLink
                  to="/staff/profile"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <FileText className="h-4 w-4" />
                  Profile
                </NavLink>
                <NavLink
                  to="/staff/settings"
                  onClick={() => setProfileOpen(false)}
                  className="flex items-center gap-2 px-4 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </NavLink>
                <button
                  type="button"
                  onClick={handleLogout}
                  disabled={logoutMutation.isPending}
                  className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-medium text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <LogOut className="h-4 w-4" />
                  {logoutMutation.isPending ? 'Signing out...' : 'Logout'}
                </button>
              </div>
            ) : null}
          </div>
        </header>

        <main className="dashboard-page-shell">
          <RouteOutletBoundary name="Staff portal page" loaderLabel="Loading staff page..." />
        </main>
      </div>
    </div>
  );
}
