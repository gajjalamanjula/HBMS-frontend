import {
  BedDouble,
  Bell,
  Building2,
  ChartColumnBig,
  ChefHat,
  ChevronsLeft,
  ChevronsRight,
  LayoutDashboard,
  LogOut,
  Megaphone,
  MessageSquareText,
  Shield,
  UserCog,
  UserPlus,
  X,
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { cn } from '../../../lib/utils/cn';

const overviewItems = [
  { to: '/owner/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/owner/branches', label: 'Branches', icon: Building2 },
  { to: '/owner/revenue', label: 'Revenue', icon: ChartColumnBig },
];

const managementItems = [
  { to: '/owner/beds', label: 'Beds Summary', icon: BedDouble },
  { to: '/owner/complaints', label: 'Complaints', icon: MessageSquareText },
  { to: '/owner/managers', label: 'Managers', icon: UserCog },
];

const operationItems = [
  { to: '/owner/create-user', label: 'Create User', icon: UserPlus },
  { to: '/owner/food-menu', label: 'Food Menu', icon: ChefHat },
  { to: '/owner/announcements', label: 'Announcements', icon: Megaphone },
  { to: '/owner/notifications', label: 'Notifications', icon: Bell },
];

function SidebarLink({ item, onClick, collapsed }) {
  const Icon = item.icon;

  return (
    <NavLink
      to={item.to}
      onClick={onClick}
      title={collapsed ? item.label : undefined}
      className={({ isActive }) =>
        cn(
          'group relative flex h-11 items-center rounded-[13px] text-[13px] font-semibold transition-all duration-200',
          'gap-3 px-3.5',
          collapsed && 'md:justify-center md:gap-0 md:px-0',
          isActive
            ? 'bg-[#2f7439] text-white shadow-[0_14px_28px_rgba(24,80,35,0.22)]'
            : 'text-[#d3d8dc] hover:bg-white/8 hover:text-white'
        )
      }
    >
      {({ isActive }) => (
        <>
          <Icon
            className={cn(
              'h-4.5 w-4.5 shrink-0 transition-colors',
              isActive ? 'text-white' : 'text-[#b8c1c8] group-hover:text-white'
            )}
          />
          <span className={cn('min-w-0 flex-1 truncate', collapsed && 'md:hidden')}>{item.label}</span>
          {item.chip ? (
            <span className={cn('inline-flex h-6 items-center justify-center rounded-full bg-[#a8c99b] px-2 text-[11px] font-bold text-[#264e25]', collapsed && 'md:hidden')}>
              {item.chip}
            </span>
          ) : null}
        </>
      )}
    </NavLink>
  );
}

function NavSection({ title, items, onClick, collapsed }) {
  return (
    <div className="mt-6">
      <p className={cn('px-2 text-[10px] font-bold uppercase tracking-[0.18em] text-[#8d99a3]', collapsed && 'md:hidden')}>
        {title}
      </p>
      {collapsed ? <div className="mx-auto hidden h-px w-7 bg-white/10 md:block" /> : null}
      <nav className="mt-2 space-y-1.5">
        {items.map((item) => (
          <SidebarLink
            key={item.label}
            item={item}
            onClick={onClick}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </div>
  );
}

export default function OwnerSidebar({
  me,
  mobileSidebarOpen,
  setMobileSidebarOpen,
  collapsed,
  setCollapsed,
  onLogout,
  isLoggingOut = false,
}) {
  const ownerName = me?.name || me?.email || 'Owner';
  const initials = ownerName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('') || 'O';

  const closeMobile = () => setMobileSidebarOpen(false);

  return (
    <>
      {mobileSidebarOpen ? (
        <button
          type="button"
          aria-label="Close sidebar overlay"
          className="fixed inset-0 z-40 bg-slate-950/45 backdrop-blur-[2px] md:hidden"
          onClick={closeMobile}
        />
      ) : null}

      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 overflow-hidden border-r border-slate-900/10 bg-[#202a33] text-white shadow-[14px_0_34px_rgba(15,23,32,0.22)] transition-all duration-300',
          'flex flex-col',
          collapsed ? 'md:w-[72px]' : 'md:w-[236px]',
          'w-[260px]',
          mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        <div className={cn('flex h-20 items-center border-b border-white/8 px-4', collapsed ? 'md:justify-center md:px-0' : 'justify-between')}>
          <div className={cn('flex items-center gap-3', collapsed && 'md:justify-center')}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-[15px] bg-[#2f7439] shadow-[inset_0_0_0_1px_rgba(255,255,255,0.12)]">
              <Shield className="h-5 w-5 text-[#e7f3df]" />
            </div>
            <div className={cn(collapsed && 'md:hidden')}>
              <p className="font-display text-[19px] font-semibold leading-none tracking-[-0.02em] text-white">
              Hostel Stay
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setCollapsed((value) => !value)}
              className="hidden h-8 w-8 items-center justify-center rounded-[10px] text-[#cfd6dc] transition hover:bg-white/10 hover:text-white md:inline-flex"
              aria-label={collapsed ? 'Expand owner sidebar' : 'Collapse owner sidebar'}
            >
              {collapsed ? <ChevronsRight className="h-4 w-4" /> : <ChevronsLeft className="h-4 w-4" />}
            </button>
            <button
              type="button"
              onClick={closeMobile}
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-[#cfd6dc] hover:bg-white/10 md:hidden"
              aria-label="Close owner navigation"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className={cn('border-b border-white/8 py-5', collapsed ? 'md:px-0' : 'px-4')}>
          <div className={cn('flex items-center gap-3', collapsed && 'md:justify-center')}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#e7f3df] text-[13px] font-bold text-[#2f7439] ring-2 ring-white/12">
              {initials}
            </div>
            <div className={cn('min-w-0', collapsed && 'md:hidden')}>
              <p className="truncate text-[14px] font-bold text-white">{ownerName}</p>
              <p className="mt-1 truncate text-[12px] text-[#aeb7be]">Owner • Branches</p>
            </div>
          </div>
        </div>

        <div className={cn('flex-1 overflow-y-auto py-4', collapsed ? 'px-2' : 'px-4')}>
          <NavSection title="Overview" items={overviewItems} onClick={closeMobile} collapsed={collapsed} />
          <NavSection title="Management" items={managementItems} onClick={closeMobile} collapsed={collapsed} />
          <NavSection title="Operations" items={operationItems} onClick={closeMobile} collapsed={collapsed} />
        </div>

        <div className={cn('border-t border-white/8 p-4', collapsed && 'md:px-2')}>
          <button
            type="button"
            onClick={onLogout}
            disabled={isLoggingOut}
            title={collapsed ? 'Sign Out' : undefined}
            className={cn(
              'flex h-11 w-full items-center rounded-[13px] text-left text-[13px] font-semibold text-[#d3d8dc] transition-all duration-200 hover:bg-white/8 hover:text-white disabled:cursor-not-allowed disabled:opacity-60',
              'gap-3 px-3.5',
              collapsed && 'md:justify-center md:gap-0 md:px-0'
            )}
          >
            <LogOut className="h-4.5 w-4.5" />
            <span className={cn(collapsed && 'md:hidden')}>{isLoggingOut ? 'Signing out...' : 'Sign Out'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}
