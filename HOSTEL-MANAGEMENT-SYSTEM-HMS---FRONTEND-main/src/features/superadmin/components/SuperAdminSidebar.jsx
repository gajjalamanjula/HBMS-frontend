import {
  Activity,
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  LogOut,
  ScrollText,
  Shield,
  UserRound,
  Users,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useLogout } from '../../auth/hooks/useAuth';
import { useSuperAdminShell } from '../context/useSuperAdminShell';

const navItems = [
  { label: 'Dashboard', to: '/superadmin/dashboard', icon: LayoutDashboard },
  { label: 'Owners', to: '/superadmin/owners', icon: Users },
  { label: 'Users', to: '/superadmin/users', icon: UserRound },
  { label: 'Branches', to: '/superadmin/branches', icon: Building2 },
  { label: 'Audit Logs', to: '/superadmin/audit-logs', icon: ScrollText },
  { label: 'System Health', to: '/superadmin/system-health', icon: Activity },
  { label: 'Notifications', to: '/superadmin/notifications', icon: Bell },
];

function SidebarContent({ mobile = false }) {
  const logoutMutation = useLogout();
  const { closeSidebar, sidebarCollapsed, toggleSidebarCollapsed } = useSuperAdminShell();
  const collapsed = !mobile && sidebarCollapsed;

  const handleLogout = async () => {
    closeSidebar();
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // useLogout handles local cleanup and user feedback.
    }
  };

  return (
    <div
      className={[
        'flex h-screen flex-col border-r border-slate-800 bg-[#121a27] text-slate-300 transition-all duration-200',
        collapsed ? 'w-[76px]' : 'w-[248px]',
      ].join(' ')}
    >
      <div className="flex h-20 shrink-0 items-center gap-3 border-b border-slate-800 px-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-indigo-600 text-white shadow-[0_14px_35px_rgba(79,70,229,0.35)]">
          <Shield className="h-6 w-6" />
        </div>
        {!collapsed ? (
          <div className="min-w-0">
            <div className="truncate text-xl font-black text-white">Hostel Stay</div>
            <div className="truncate text-xs font-semibold text-slate-500">Super Admin</div>
          </div>
        ) : null}
        {!mobile ? (
          <button
            type="button"
            onClick={toggleSidebarCollapsed}
            className="ml-auto hidden h-9 w-9 items-center justify-center rounded-xl text-slate-400 transition hover:bg-slate-800 hover:text-white md:inline-flex"
            aria-label="Toggle sidebar"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        ) : null}
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={mobile ? closeSidebar : undefined}
              className={({ isActive }) =>
                [
                  'flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-bold transition',
                  collapsed ? 'justify-center' : '',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-[0_12px_26px_rgba(79,70,229,0.25)]'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white',
                ].join(' ')
              }
              title={collapsed ? item.label : undefined}
            >
              <Icon className="h-5 w-5 shrink-0" />
              {!collapsed ? <span className="truncate">{item.label}</span> : null}
            </NavLink>
          );
        })}
      </nav>

      <div className="space-y-3 border-t border-slate-800 px-3 py-4">
        <button
          type="button"
          onClick={handleLogout}
          disabled={logoutMutation.isPending}
          className={[
            'flex h-12 w-full items-center gap-3 rounded-2xl px-3 text-sm font-bold text-slate-400 transition hover:bg-rose-500/10 hover:text-rose-300 disabled:cursor-not-allowed disabled:opacity-60',
            collapsed ? 'justify-center' : '',
          ].join(' ')}
        >
          <LogOut className="h-5 w-5 shrink-0" />
          {!collapsed ? <span className="truncate">{logoutMutation.isPending ? 'Signing out' : 'Logout'}</span> : null}
        </button>
      </div>
    </div>
  );
}

export default function SuperAdminSidebar() {
  const { sidebarOpen, closeSidebar, sidebarCollapsed } = useSuperAdminShell();

  return (
    <>
      <aside className={["hidden shrink-0 md:block", sidebarCollapsed ? 'w-[76px]' : 'w-[248px]'].join(' ')}>
        <SidebarContent />
      </aside>

      <button
        type="button"
        aria-label="Close menu"
        className={[
          'fixed inset-0 z-40 bg-slate-950/60 transition-opacity duration-200 md:hidden',
          sidebarOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={closeSidebar}
      />

      <aside
        className={[
          'fixed inset-y-0 left-0 z-50 transform-gpu transition-transform duration-200 ease-out md:hidden',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        ].join(' ')}
      >
        <SidebarContent mobile />
      </aside>
    </>
  );
}
