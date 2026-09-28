import { useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';

import RouteOutletBoundary from '../../../components/error/RouteOutletBoundary';
import { useCurrentUser, useLogout } from '../../auth/hooks/useAuth';
import ManagerSidebar from './ManagerSidebar';
import ManagerTopbar from './ManagerTopbar';

const pageMeta = {
  '/manager/dashboard': {
    title: 'Manager Workspace',
    subtitle: 'Daily branch operations overview.',
  },
  '/manager/bookings': {
    title: 'Bookings',
    subtitle: 'Review booking requests and update decisions.',
  },
  '/manager/tenants': {
    title: 'Tenants',
    subtitle: 'Tenant list, checkout, and branch stay status.',
  },
  '/manager/staff': {
    title: 'Staff',
    subtitle: 'Staff list, profile updates, and deactivation.',
  },
  '/manager/rooms': {
    title: 'Rooms & Beds',
    subtitle: 'Room creation, bed assignment, and bed status control.',
  },
  '/manager/complaints': {
    title: 'Complaints',
    subtitle: 'Assign and track tenant complaints.',
  },
  '/manager/create-user': {
    title: 'Create User',
    subtitle: 'Create staff or tenant account and confirm the verification code.',
  },
  '/manager/food-menu': {
    title: 'Food Menu',
    subtitle: 'Upload, view, and delete weekly food menu files.',
  },
  '/manager/payments': {
    title: 'Payments',
    subtitle: 'Cash collection, dues, summary, and invoice access.',
  },
};

export default function ManagerDashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const location = useLocation();
  const currentUserQuery = useCurrentUser();
  const logoutMutation = useLogout();

  const currentMeta = useMemo(
    () => pageMeta[location.pathname] || pageMeta['/manager/dashboard'],
    [location.pathname]
  );

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // logout hook clears local session and shows controlled toast
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <ManagerSidebar
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        onLogout={handleLogout}
        isLoggingOut={logoutMutation.isPending}
      />

      <div className="min-h-screen min-w-0 flex-1 overflow-x-hidden md:pl-64">
        <ManagerTopbar
          title={currentMeta.title}
          subtitle={currentMeta.subtitle}
          me={currentUserQuery.data}
          setMobileSidebarOpen={setMobileSidebarOpen}
          onLogout={handleLogout}
          isLoggingOut={logoutMutation.isPending}
        />

        <main className="dashboard-page-shell">
          <RouteOutletBoundary
            name="Manager dashboard page"
            loaderLabel="Loading manager page..."
          />
        </main>
      </div>
    </div>
  );
}
