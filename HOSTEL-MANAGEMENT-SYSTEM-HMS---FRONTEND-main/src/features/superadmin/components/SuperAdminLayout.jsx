import SuperAdminHeader from './SuperAdminHeader';
import SuperAdminSidebar from './SuperAdminSidebar';
import { SuperAdminShellProvider } from '../context/SuperAdminShellContext';
import { useSuperAdminShell } from '../context/useSuperAdminShell';
import RouteOutletBoundary from '../../../components/error/RouteOutletBoundary';

function SuperAdminLayoutInner() {
  const { openSidebar } = useSuperAdminShell();

  return (
    <div className="h-screen overflow-hidden bg-[#f7f9fc] text-slate-900">
      <div className="flex h-full min-w-0 overflow-hidden">
        <SuperAdminSidebar />
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
          <SuperAdminHeader onMenuClick={openSidebar} />
          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            <div className="dashboard-page-shell">
              <RouteOutletBoundary name="Super Admin page" loaderLabel="Loading super admin page..." />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}

export default function SuperAdminLayout() {
  return (
    <SuperAdminShellProvider>
      <SuperAdminLayoutInner />
    </SuperAdminShellProvider>
  );
}
