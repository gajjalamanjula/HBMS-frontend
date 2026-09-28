import {
  BedDouble,
  Bell,
  CalendarCheck2,
  ChefHat,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquareText,
  Shield,
  UserCog,
  UserPlus,
  Users,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';

import { cn } from '../../../lib/utils/cn';

const navGroups = [
  {
    label: 'Overview',
    items: [
      { to: '/manager/dashboard', label: 'Dashboard', icon: LayoutDashboard },
      { to: '/manager/bookings', label: 'Bookings', icon: CalendarCheck2 },
    ],
  },
  {
    label: 'Operations',
    items: [
      { to: '/manager/tenants', label: 'Tenants', icon: Users },
      { to: '/manager/staff', label: 'Staff', icon: UserCog },
      { to: '/manager/rooms', label: 'Rooms & Beds', icon: BedDouble },
      { to: '/manager/complaints', label: 'Complaints', icon: MessageSquareText },
    ],
  },
  {
    label: 'Actions',
    items: [
      { to: '/manager/create-user', label: 'Create User', icon: UserPlus },
      { to: '/manager/food-menu', label: 'Food Menu', icon: ChefHat },
      { to: '/manager/payments', label: 'Payments', icon: CreditCard },
      { to: '/manager/announcements', label: 'Announcements', icon: Megaphone },
      { to: '/manager/notifications', label: 'Notifications', icon: Bell },
    ],
  },
];

function SidebarLink({ item, onClick }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      className={({ isActive }) =>
        cn(
          'group relative flex h-11 cursor-pointer items-center gap-3 rounded-[14px] px-3 text-[13px] font-bold transition-all duration-200',
          isActive
            ? 'bg-white text-slate-950 shadow-[0_12px_26px_rgba(14,165,233,0.22)]'
            : 'text-slate-200 hover:bg-white/10 hover:text-white'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon className={cn('h-4 w-4 shrink-0', isActive ? 'text-sky-700' : 'text-slate-300')} />
          <span className={cn('truncate', isActive ? 'text-slate-950' : 'text-slate-200 group-hover:text-white')}>{item.label}</span>
        </>
      )}
    </NavLink>
  );
}

export default function ManagerSidebar({
  mobileSidebarOpen,
  setMobileSidebarOpen,
  onLogout,
  isLoggingOut = false,
}) {
  return (
    <>
      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-slate-950/35 md:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-64 border-r border-white/10 bg-[#0f1f2f] text-white transition-transform duration-300',
          'hidden md:flex md:flex-col md:translate-x-0',
          mobileSidebarOpen ? 'flex flex-col translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-sky-500/20 ring-1 ring-sky-300/20">
              <Shield className="h-5 w-5 text-sky-300" />
            </div>
            <div>
              <h2 className="font-display text-[18px] font-bold leading-none">Hostel Stay</h2>
              <p className="mt-1 text-[12px] text-slate-300">Manager Workspace</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg text-slate-300 hover:bg-white/10 md:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-3 py-5">
          {navGroups.map((group) => (
            <div key={group.label} className="mb-5">
              <p className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">
                {group.label}
              </p>
              <nav className="space-y-1.5">
                {group.items.map((item) => (
                  <SidebarLink
                    key={item.label}
                    item={item}
                    onClick={() => setMobileSidebarOpen(false)}
                  />
                ))}
              </nav>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 p-3">
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            className="flex h-11 w-full cursor-pointer items-center gap-3 rounded-[14px] px-3 text-left text-[13px] font-bold text-slate-200 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-60"
          >
            <LogOut className="h-4 w-4" />
            <span>{isLoggingOut ? 'Logging out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
