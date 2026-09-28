import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import PageLoader from '../../components/feedback/PageLoader';

import GuestRoute from '../guards/GuestRoute';
import ProtectedRoute from '../guards/ProtectedRoute';
import RoleGuard from '../guards/RoleGuard';
import { ROLES } from '../../utils/constants/roles';

/* =========================
   LAZY LOADED LAYOUTS
========================= */
const PublicLayout = lazy(() => import('../../layouts/PublicLayout'));
const AuthLayout = lazy(() => import('../../layouts/AuthLayout'));
const DashboardLayout = lazy(() => import('../../layouts/DashboardLayout'));
const TenantDashboardLayout = lazy(
  () => import('../../features/tenants/components/TenantDashboardLayout')
);
const ManagerDashboardLayout = lazy(
  () => import('../../features/manager/components/ManagerDashboardLayout')
);
const StaffDashboardLayout = lazy(
  () => import('../../features/staff/components/StaffDashboardLayout')
);
const SuperAdminLayout = lazy(
  () => import('../../features/superadmin/components/SuperAdminLayout')
);
const OwnerDashboardLayout = lazy(
  () => import('../../features/owner/components/OwnerDashboardLayout')
);

/* =========================
   PUBLIC PAGES
========================= */
const HomePage = lazy(() => import('../../pages/public/HomePage'));
const BranchesPage = lazy(() => import('../../pages/public/BranchesPage'));
const BranchDetailPage = lazy(() => import('../../pages/public/BranchDetailPage'));
const PricingPage = lazy(() => import('../../pages/public/PricingPage'));
const AboutPage = lazy(() => import('../../pages/public/AboutPage'));
const ContactPage = lazy(() => import('../../pages/public/ContactPage'));

const PaymentsPage = lazy(() => import('../../pages/public/PaymentsPage'));
const PaymentPayPage = lazy(() => import('../../pages/public/PaymentPayPage'));
const PublicNotificationsPage = lazy(
  () => import('../../pages/public/PublicNotificationsPage')
);

const BackendApiUnavailablePage = lazy(
  () => import('../../pages/public/BackendApiUnavailablePage')
);
const BookingCreatePage = lazy(() => import('../../pages/public/BookingCreatePage'));

const ComplaintCreatePage = lazy(() => import('../../pages/public/ComplaintCreatePage'));

/* =========================
   AUTH PAGES
========================= */
const LoginPage = lazy(() => import('../../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../../pages/auth/RegisterPage'));
const ForgotPasswordPage = lazy(() => import('../../pages/auth/ForgotPasswordPage'));
const ResetPasswordPage = lazy(() => import('../../pages/auth/ResetPasswordPage'));
const VerifyOtpPage = lazy(() => import('../../pages/auth/VerifyOtpPage'));
const ChangePasswordPage = lazy(() => import('../../pages/auth/ChangePasswordPage'));

/* =========================
   SUPER ADMIN PAGES
========================= */
const SuperAdminDashboardPage = lazy(
  () => import('../../features/superadmin/pages/SuperAdminDashboardPage')
);
const SuperAdminOwnersPage = lazy(
  () => import('../../features/superadmin/pages/SuperAdminOwnersPage')
);
const SuperAdminBranchesPage = lazy(
  () => import('../../features/superadmin/pages/SuperAdminBranchesPage')
);
const SuperAdminAuditLogsPage = lazy(
  () => import('../../features/superadmin/pages/SuperAdminAuditLogsPage')
);
const SuperAdminSystemHealthPage = lazy(
  () => import('../../features/superadmin/pages/SuperAdminSystemHealthPage')
);
const SuperAdminUsersPage = lazy(
  () => import('../../features/superadmin/pages/SuperAdminUsersPage')
);

/* =========================
   OWNER PAGES
========================= */
const OwnerOverviewPage = lazy(
  () => import('../../pages/dashboards/owner/OwnerOverviewPage')
);
const OwnerBranchesPage = lazy(
  () => import('../../pages/dashboards/owner/OwnerBranchesPage')
);
const OwnerRevenuePage = lazy(
  () => import('../../pages/dashboards/owner/OwnerRevenuePage')
);
const OwnerBedsPage = lazy(
  () => import('../../pages/dashboards/owner/OwnerBedsPage')
);
const OwnerBranchStatsPage = lazy(
  () => import('../../pages/dashboards/owner/OwnerBranchStatsPage')
);
const OwnerManagersPage = lazy(
  () => import('../../pages/dashboards/owner/OwnerManagersPage')
);
const OwnerComplaintsPage = lazy(
  () => import('../../pages/dashboards/owner/OwnerComplaintsPage')
);
const OwnerCreateUserPage = lazy(
  () => import('../../pages/dashboards/owner/OwnerCreateUserPage')
);
const OwnerFoodMenuPage = lazy(
  () => import('../../pages/dashboards/owner/OwnerFoodMenuPage')
);

/* =========================
   MANAGER PAGES
========================= */
const ManagerDashboardPage = lazy(
  () => import('../../pages/dashboards/manager/ManagerDashboardPage')
);
const ManagerTenantsPage = lazy(
  () => import('../../pages/dashboards/manager/ManagerTenantsPage')
);
const ManagerRoomsPage = lazy(
  () => import('../../pages/dashboards/manager/ManagerRoomsPage')
);
const ManagerStaffPage = lazy(
  () => import('../../pages/dashboards/manager/ManagerStaffPage')
);
const ManagerComplaintsPage = lazy(
  () => import('../../pages/dashboards/manager/ManagerComplaintsPage')
);
const ManagerBookingsPage = lazy(
  () => import('../../pages/dashboards/manager/ManagerBookingsPage')
);
const ManagerCreateUserPage = lazy(
  () => import('../../pages/dashboards/manager/ManagerCreateUserPage')
);
const ManagerFoodMenuPage = lazy(
  () => import('../../pages/dashboards/manager/ManagerFoodMenuPage')
);
const ManagerPaymentsPage = lazy(
  () => import('../../pages/dashboards/manager/ManagerPaymentsPage')
);

/* =========================
   TENANT PAGES
========================= */
const TenantDashboardPage = lazy(
  () => import('../../pages/dashboards/tenant/TenantDashboardPage')
);
const TenantPaymentsPage = lazy(
  () => import('../../pages/dashboards/tenant/TenantPaymentsPage')
);
const TenantComplaintsPage = lazy(
  () => import('../../pages/dashboards/tenant/TenantComplaintsPage')
);
const TenantReviewsPage = lazy(
  () => import('../../pages/dashboards/tenant/TenantReviewsPage')
);
const TenantProfilePage = lazy(
  () => import('../../pages/dashboards/tenant/TenantProfilePage')
);

const TenantKycPage = lazy(() => import('../../pages/dashboards/tenant/TenantKycPage'));
const TenantFoodMenuPage = lazy(
  () => import('../../pages/dashboards/tenant/TenantFoodMenuPage')
);
const TenantSettingsPage = lazy(
  () => import('../../pages/dashboards/tenant/TenantSettingsPage')
);

/* =========================
   STAFF PAGES
========================= */
const StaffDashboardPage = lazy(
  () => import('../../pages/dashboards/staff/StaffDashboardPage')
);
const StaffComplaintsPage = lazy(
  () => import('../../pages/dashboards/staff/StaffComplaintsPage')
);
const StaffFoodMenuPage = lazy(
  () => import('../../pages/dashboards/staff/StaffFoodMenuPage')
);
const StaffKycPage = lazy(
  () => import('../../pages/dashboards/staff/StaffKycPage')
);
const StaffProfilePage = lazy(
  () => import('../../pages/dashboards/staff/StaffProfilePage')
);
const StaffSettingsPage = lazy(
  () => import('../../pages/dashboards/staff/StaffSettingsPage')
);

/* =========================
   SHARED COMMUNICATION PAGES
========================= */
const AnnouncementsPage = lazy(
  () => import('../../pages/dashboards/shared/AnnouncementsPage')
);
const NotificationsPage = lazy(
  () => import('../../pages/dashboards/shared/NotificationsPage')
);

/* =========================
   FALLBACK
========================= */
const NotFoundPage = lazy(() => import('../../pages/fallback/NotFoundPage'));
const UnauthorizedPage = lazy(() => import('../../pages/fallback/UnauthorizedPage'));

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader label="Loading page..." />}>
        <Routes>
          {/* =========================
              PUBLIC ROUTES
          ========================= */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />

            <Route path="/branches" element={<BranchesPage />} />
            <Route path="/branches/:branchId" element={<BranchDetailPage />} />

            <Route
              path="/rooms"
              element={
                <BackendApiUnavailablePage
                  title="Select a hostel to view rooms"
                  description="Rooms and beds are shown on each hostel detail page so you can compare live availability before booking."
                />
              }
            />
            <Route
              path="/rooms/:roomId"
              element={
                <BackendApiUnavailablePage
                  title="Room details are available from hostel pages"
                  description="Open a hostel from the listing page to view its available rooms, beds, rent, and booking options."
                />
              }
            />

            <Route
              path="/amenities"
              element={
                <BackendApiUnavailablePage
                  title="Amenities are shown with each hostel"
                  description="Browse hostels to compare listed amenities, rent, room details, and availability from live branch records."
                />
              }
            />
            <Route
              path="/pricing"
              element={<PricingPage />}
            />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />

            <Route
              path="/bookings"
              element={
                <BackendApiUnavailablePage
                  title="Booking history is available after login"
                  description="You can request a booking from a hostel page. After login, your account dashboard shows booking and payment updates."
                />
              }
            />

            <Route path="/bookings/new" element={<BookingCreatePage />} />

            <Route
              path="/bookings/:bookingId"
              element={
                <BackendApiUnavailablePage
                  title="Booking details are available in your account"
                  description="Login to your account to review booking status, payment updates, and hostel communication."
                />
              }
            />

            <Route path="/payments" element={<PaymentsPage />} />
            <Route path="/payments/:bookingId" element={<PaymentPayPage />} />
            <Route path="/payments/:bookingId/pay" element={<PaymentPayPage />} />
            <Route path="/notifications" element={<PublicNotificationsPage />} />

            <Route
              path="/complaints"
              element={
                <BackendApiUnavailablePage
                  title="Complaint tracking is available in your dashboard"
                  description="Login to your tenant, staff, manager, or owner dashboard to view and manage complaint updates securely."
                />
              }
            />
            <Route path="/complaints/new" element={<ComplaintCreatePage />} />
            <Route
              path="/complaints/:complaintId"
              element={
                <BackendApiUnavailablePage
                  title="Complaint details require account access"
                  description="For privacy and security, complaint details are available only inside your authenticated dashboard."
                />
              }
            />
          </Route>

          {/* =========================
              AUTH ROUTES
          ========================= */}
          <Route element={<AuthLayout />}>
            <Route element={<GuestRoute />}>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/forgot-password" element={<ForgotPasswordPage />} />
              <Route path="/reset-password" element={<ResetPasswordPage />} />
              <Route path="/verify-otp" element={<VerifyOtpPage />} />
              <Route path="/register" element={<RegisterPage />} />
            </Route>

            <Route element={<ProtectedRoute />}>
              <Route path="/change-password" element={<ChangePasswordPage />} />
            </Route>
          </Route>

          {/* =========================
              DASHBOARD ROUTES
          ========================= */}
          <Route element={<DashboardLayout />}>
            <Route element={<ProtectedRoute />}>
              {/* SUPER ADMIN */}
              <Route element={<RoleGuard allowedRoles={[ROLES.SUPER_ADMIN]} />}>
                <Route path="/superadmin" element={<SuperAdminLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<SuperAdminDashboardPage />} />
                  <Route path="owners" element={<SuperAdminOwnersPage />} />
                  <Route path="branches" element={<SuperAdminBranchesPage />} />
                  <Route path="audit-logs" element={<SuperAdminAuditLogsPage />} />
                  <Route path="system-health" element={<SuperAdminSystemHealthPage />} />
                  <Route path="users" element={<SuperAdminUsersPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>
              </Route>

              {/* OWNER */}
              <Route element={<RoleGuard allowedRoles={[ROLES.OWNER]} />}>
                <Route path="/owner" element={<OwnerDashboardLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<OwnerOverviewPage />} />
                  <Route path="branches" element={<OwnerBranchesPage />} />
                  <Route path="branches/:branchId" element={<OwnerBranchStatsPage />} />
                  <Route path="branches/:branchId/stats" element={<OwnerBranchStatsPage />} />
                  <Route path="revenue" element={<OwnerRevenuePage />} />
                  <Route path="beds" element={<OwnerBedsPage />} />
                  <Route path="managers" element={<OwnerManagersPage />} />
                  <Route path="complaints" element={<OwnerComplaintsPage />} />
                  <Route path="create-user" element={<OwnerCreateUserPage />} />
                  <Route path="food-menu" element={<OwnerFoodMenuPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>
              </Route>

              {/* MANAGER */}
              <Route element={<RoleGuard allowedRoles={[ROLES.MANAGER]} />}>
                <Route path="/manager" element={<ManagerDashboardLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<ManagerDashboardPage />} />
                  <Route path="tenants" element={<ManagerTenantsPage />} />
                  <Route path="rooms" element={<ManagerRoomsPage />} />
                  <Route path="staff" element={<ManagerStaffPage />} />
                  <Route path="complaints" element={<ManagerComplaintsPage />} />
                  <Route path="bookings" element={<ManagerBookingsPage />} />
                  <Route path="create-user" element={<ManagerCreateUserPage />} />
                  <Route path="food-menu" element={<ManagerFoodMenuPage />} />
                  <Route path="payments" element={<ManagerPaymentsPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>
              </Route>

              {/* TENANT */}
              <Route element={<RoleGuard allowedRoles={[ROLES.TENANT]} />}>
                <Route path="/tenant" element={<TenantDashboardLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<TenantDashboardPage />} />
                  <Route path="profile" element={<TenantProfilePage />} />
                  <Route path="payments" element={<TenantPaymentsPage />} />
                  <Route path="complaints" element={<TenantComplaintsPage />} />
                  <Route path="reviews" element={<TenantReviewsPage />} />
                  <Route path="kyc" element={<TenantKycPage />} />
                  <Route path="food-menu" element={<TenantFoodMenuPage />} />
                  <Route path="settings" element={<TenantSettingsPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>
              </Route>

              {/* STAFF */}
              <Route element={<RoleGuard allowedRoles={[ROLES.STAFF]} />}>
                <Route path="/staff" element={<StaffDashboardLayout />}>
                  <Route index element={<Navigate to="dashboard" replace />} />
                  <Route path="dashboard" element={<StaffDashboardPage />} />
                  <Route path="complaints" element={<StaffComplaintsPage />} />
                  <Route path="food-menu" element={<StaffFoodMenuPage />} />
                  <Route path="kyc" element={<StaffKycPage />} />
                  <Route path="profile" element={<StaffProfilePage />} />
                  <Route path="settings" element={<StaffSettingsPage />} />
                  <Route path="announcements" element={<AnnouncementsPage />} />
                  <Route path="notifications" element={<NotificationsPage />} />
                </Route>
              </Route>
            </Route>
          </Route>

          <Route path="/unauthorized" element={<UnauthorizedPage />} />
          <Route path="/super-admin/*" element={<Navigate to="/superadmin/dashboard" replace />} />
          <Route path="/home" element={<Navigate to="/" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
