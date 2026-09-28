import { useState } from 'react';

import RouteOutletBoundary from '../../../components/error/RouteOutletBoundary';
import { useCurrentUser, useLogout } from '../../auth/hooks/useAuth';
import OwnerDashboardShell from './OwnerDashboardShell';
import OwnerSidebar from './OwnerSidebar';
import OwnerTopbar from './OwnerTopbar';

export default function OwnerDashboardLayout() {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const currentUserQuery = useCurrentUser();
  const logoutMutation = useLogout();

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
    } catch {
      // useLogout already clears the local session and shows a controlled toast when needed.
    }
  };

  return (
    <OwnerDashboardShell>
      <OwnerSidebar
        me={currentUserQuery.data}
        mobileSidebarOpen={mobileSidebarOpen}
        setMobileSidebarOpen={setMobileSidebarOpen}
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
        onLogout={handleLogout}
        isLoggingOut={logoutMutation.isPending}
      />

      <div className={sidebarCollapsed ? 'min-h-screen min-w-0 overflow-x-hidden transition-all duration-300 md:pl-[72px]' : 'min-h-screen min-w-0 overflow-x-hidden transition-all duration-300 md:pl-[236px]'}>
        <OwnerTopbar
          me={currentUserQuery.data}
          setMobileSidebarOpen={setMobileSidebarOpen}
          onLogout={handleLogout}
          isLoggingOut={logoutMutation.isPending}
        />

        <main className="dashboard-page-shell">
          <RouteOutletBoundary
            name="Owner dashboard page"
            loaderLabel="Loading owner page..."
          />
        </main>
      </div>
    </OwnerDashboardShell>
  );
}
