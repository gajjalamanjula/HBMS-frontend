import { useEffect, useRef, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Bell,
  Building2,
  ChevronDown,
  LayoutDashboard,
  LogOut,
  Menu,
  UserCircle,
  X,
} from 'lucide-react';

import { useAuthSession, useCurrentUser, useLogout } from '../../features/auth/hooks/useAuth';
import { useUnreadNotificationCount } from '../../features/communication/hooks/useCommunication';
import { clearLastPublicBooking } from '../../features/public/utils/publicBookingSession';
import { getRoleHomePath, normalizeRole, ROLES } from '../../utils/constants/roles';

const navItems = [
  { label: 'Home', to: '/' },
  { label: 'Hostels', to: '/branches' },
  { label: 'Pricing', to: '/pricing' },
  { label: 'About', to: '/about' },
  { label: 'Contact', to: '/contact' },
];

const navLinkClass = ({ isActive }) =>
  [
    'relative inline-flex h-16 items-center text-[14px] font-bold transition',
    'after:absolute after:bottom-[14px] after:left-0 after:h-[2px] after:rounded-full after:bg-[#F97316] after:transition-all',
    isActive
      ? 'text-[#F97316] after:w-full'
      : 'text-[#0F172A] after:w-0 hover:text-[#F97316] hover:after:w-full',
  ].join(' ');

const primaryLinkClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#F97316] px-5 text-sm font-bold text-white shadow-md transition hover:bg-[#EA580C] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]';

const outlineLinkClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#0F172A] bg-white px-5 text-sm font-bold text-[#0F172A] transition hover:border-[#F97316] hover:bg-[#FFF7ED] hover:text-[#F97316] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316]';

const ghostButtonClass =
  'inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-4 text-sm font-bold text-[#0F172A] transition hover:border-[#FDBA74] hover:bg-[#FFF7ED] hover:text-[#F97316] disabled:cursor-not-allowed disabled:opacity-60';

export default function PublicHeader() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const session = useAuthSession();
  const currentUserQuery = useCurrentUser({ enabled: session.hasSession });
  const currentUser = currentUserQuery.data || session.user;

  const role = normalizeRole(currentUser?.role);
  const userId = currentUser?.id || currentUser?.userId || '';
  const isPublicUser = session.hasSession && role === ROLES.PUBLIC_USER;
  const isDashboardUser = session.hasSession && role && role !== ROLES.PUBLIC_USER;

  const unreadCountQuery = useUnreadNotificationCount(userId, { enabled: isPublicUser });
  const logoutHome = useLogout({ redirectTo: '/' });
  const logoutPending = logoutHome.isPending;

  const unreadCount = Number(unreadCountQuery.data || 0);
  const dashboardPath = isDashboardUser ? getRoleHomePath(role) : '/branches';
  const displayName = currentUser?.name || currentUser?.email || 'Account';
  const displayEmail = currentUser?.email || '';
  const initial = displayName.charAt(0).toUpperCase() || 'U';

  useEffect(() => {
    const handlePointerDown = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMobileOpen(false);
        setIsProfileOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const closeMobile = () => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
  };

  const handleLogout = () => {
    closeMobile();
    clearLastPublicBooking();
    logoutHome.mutate();
  };

  const renderGuestActions = (mobile = false) => (
    <div className={mobile ? 'mt-3 grid gap-2' : 'hidden shrink-0 items-center gap-2 lg:flex'}>
      <Link to="/login" onClick={closeMobile} className={`${outlineLinkClass} ${mobile ? 'w-full' : ''}`}>
        Login
      </Link>

      <Link to="/branches" onClick={closeMobile} className={`${primaryLinkClass} ${mobile ? 'w-full' : ''}`}>
        Book Now
      </Link>
    </div>
  );

  const renderAccountLinks = (mobile = false) => (
    <div className={mobile ? 'mt-3 grid gap-2' : 'py-1'}>
      <div className={mobile ? 'rounded-xl border border-[#E2E8F0] bg-white px-4 py-3' : 'border-b border-[#E2E8F0] px-4 py-3'}>
        <p className="truncate text-sm font-bold text-[#0F172A]">{displayName}</p>
        {displayEmail ? <p className="truncate text-xs text-[#64748B]">{displayEmail}</p> : null}
      </div>

      {isPublicUser ? (
        <Link
          to="/notifications"
          onClick={closeMobile}
          className={`${mobile ? ghostButtonClass : 'flex min-h-11 w-full items-center justify-between gap-2 px-4 text-sm font-bold text-[#0F172A] transition hover:bg-[#FFF7ED] hover:text-[#F97316]'}`}
        >
          <span className="inline-flex items-center gap-2">
            <Bell className="h-4 w-4" />
            Notifications
          </span>

          {unreadCount > 0 ? (
            <span className="inline-flex min-w-5 items-center justify-center rounded-full bg-[#F97316] px-1.5 text-[11px] leading-5 text-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          ) : null}
        </Link>
      ) : null}

      {isDashboardUser ? (
        <Link
          to={dashboardPath}
          onClick={closeMobile}
          className={`${mobile ? ghostButtonClass : 'flex min-h-11 w-full items-center gap-2 px-4 text-sm font-bold text-[#0F172A] transition hover:bg-[#FFF7ED] hover:text-[#F97316]'}`}
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </Link>
      ) : null}

      <button
        type="button"
        onClick={handleLogout}
        disabled={logoutPending}
        className={`${mobile ? ghostButtonClass : 'flex min-h-11 w-full items-center gap-2 px-4 text-left text-sm font-bold text-[#DC2626] transition hover:bg-[#FEF2F2] disabled:cursor-not-allowed disabled:opacity-60'}`}
      >
        <LogOut className="h-4 w-4" />
        {logoutPending ? 'Logging out...' : 'Logout'}
      </button>
    </div>
  );

  const renderProfileButton = () => {
    if (!session.hasSession) return null;

    return (
      <div ref={profileRef} className="relative hidden shrink-0 lg:block">
        <button
          type="button"
          onClick={() => setIsProfileOpen((value) => !value)}
          className="inline-flex h-11 items-center gap-2 rounded-xl border border-[#E2E8F0] bg-white px-2.5 text-[#0F172A] shadow-sm transition hover:border-[#FDBA74] hover:bg-[#FFF7ED]"
          aria-expanded={isProfileOpen}
          aria-controls="public-account-menu"
          aria-label="Open account menu"
        >
          <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF7ED] text-sm font-black text-[#F97316]">
            {initial}
          </span>
          <UserCircle className="h-4 w-4 text-[#0F172A]" />
          <ChevronDown className="h-4 w-4 text-[#64748B]" />
        </button>

        {isProfileOpen ? (
          <div
            id="public-account-menu"
            className="absolute right-0 mt-2 w-64 overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white shadow-xl"
          >
            {renderAccountLinks(false)}
          </div>
        ) : null}
      </div>
    );
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[#E2E8F0] bg-white/95 shadow-sm backdrop-blur-xl">
      <div className="hbms-container flex h-[72px] items-center justify-between gap-4">
        <Link
          to="/"
          onClick={closeMobile}
          className="flex min-w-0 shrink-0 items-center gap-3 rounded-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F97316]"
          aria-label="Hostel Management System home"
        >
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F97316] text-white shadow-md">
            <Building2 className="h-5 w-5" />
          </span>

          <span className="truncate font-display text-[24px] font-bold tracking-tight text-[#0F172A] sm:text-[28px]">
            Hostel<span className="text-[#F97316]">Stay</span>
          </span>
        </Link>

        <nav className="hidden items-center justify-center gap-5 lg:flex" aria-label="Public navigation">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.to === '/'} className={navLinkClass}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        {!session.hasSession ? renderGuestActions(false) : renderProfileButton()}

        <button
          type="button"
          aria-label="Toggle public navigation"
          aria-expanded={isMobileOpen}
          aria-controls="public-mobile-menu"
          onClick={() => setIsMobileOpen((prev) => !prev)}
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#E2E8F0] bg-white text-[#0F172A] shadow-sm transition hover:bg-[#FFF7ED] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F97316] lg:hidden"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {isMobileOpen ? (
        <div
          id="public-mobile-menu"
          className="border-t border-[#E2E8F0] bg-white/95 px-4 py-4 shadow-xl backdrop-blur-xl lg:hidden"
        >
          <div className="mx-auto flex max-w-md flex-col gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                onClick={closeMobile}
                className={({ isActive }) =>
                  [
                    'min-h-11 rounded-xl px-4 py-3 text-sm font-bold transition',
                    isActive
                      ? 'bg-[#FFF7ED] text-[#F97316]'
                      : 'text-[#0F172A] hover:bg-[#FFF7ED] hover:text-[#F97316]',
                  ].join(' ')
                }
              >
                {item.label}
              </NavLink>
            ))}

            {!session.hasSession ? renderGuestActions(true) : renderAccountLinks(true)}
          </div>
        </div>
      ) : null}
    </header>
  );
}