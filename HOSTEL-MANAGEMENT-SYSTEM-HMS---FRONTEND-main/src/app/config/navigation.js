import {
  Activity,
  Building2,
  CalendarCheck2,
  CreditCard,
  Home,
  LayoutDashboard,
  MessageSquareWarning,
  UserPlus,
  UserRound,
  Users,
  ShieldCheck,
  ScrollText,
  Star,
  Utensils,
} from 'lucide-react';

export const publicNavItems = [
  { label: 'Home', to: '/', icon: Home },
  { label: 'Branches', to: '/branches', icon: Building2 },
  { label: 'Payment', to: '/payments', icon: CreditCard },
];

export const quickActionItems = [
  { label: 'Login', to: '/login' },
  { label: 'Register', to: '/register' },
];

export const dashboardNavByRole = {
  SUPER_ADMIN: [
    { label: 'Dashboard', to: '/superadmin/dashboard', icon: LayoutDashboard },
    { label: 'Owners', to: '/superadmin/owners', icon: Users },
    { label: 'Users', to: '/superadmin/users', icon: UserRound },
    { label: 'Branches', to: '/superadmin/branches', icon: Building2 },
    { label: 'Audit Logs', to: '/superadmin/audit-logs', icon: ScrollText },
    { label: 'System Health', to: '/superadmin/system-health', icon: Activity },
  ],
  OWNER: [
    { label: 'Dashboard', to: '/owner/dashboard', icon: LayoutDashboard },
    { label: 'Branches', to: '/owner/branches', icon: Building2 },
    { label: 'Managers', to: '/owner/managers', icon: UserPlus },
    { label: 'Complaints', to: '/owner/complaints', icon: ScrollText },
  ],
  MANAGER: [
    { label: 'Dashboard', to: '/manager/dashboard', icon: LayoutDashboard },
    { label: 'Tenants', to: '/manager/tenants', icon: UserPlus },
    { label: 'Staff', to: '/manager/staff', icon: Users },
    { label: 'Rooms', to: '/manager/rooms', icon: Building2 },
    { label: 'Complaints', to: '/manager/complaints', icon: ScrollText },
    { label: 'Bookings', to: '/manager/bookings', icon: CalendarCheck2 },
  ],
  STAFF: [
    { label: 'Dashboard', to: '/staff/dashboard', icon: LayoutDashboard },
    { label: 'Complaints', to: '/staff/complaints', icon: ScrollText },
    { label: 'Food Menu', to: '/staff/food-menu', icon: Utensils },
    { label: 'KYC', to: '/staff/kyc', icon: ShieldCheck },
    { label: 'Profile', to: '/staff/profile', icon: UserRound },
  ],
  TENANT: [
    { label: 'Dashboard', to: '/tenant/dashboard', icon: LayoutDashboard },
    { label: 'Payments', to: '/tenant/payments', icon: CreditCard },
    { label: 'Complaints', to: '/tenant/complaints', icon: MessageSquareWarning },
    { label: 'Reviews', to: '/tenant/reviews', icon: Star },
    { label: 'KYC', to: '/tenant/kyc', icon: ShieldCheck },
    { label: 'Food Menu', to: '/tenant/food-menu', icon: Utensils },
    { label: 'Profile', to: '/tenant/profile', icon: UserRound },
  ],
};
