import { BedDouble, CalendarCheck2, MessageSquareText, RefreshCw, UserCog, Users } from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

import useManagerBookings from '../../bookings/hooks/useManagerBookings';
import {
  ManagerEmptyBlock,
  ManagerMetricCard,
  ManagerPageHeader,
  ManagerPanel,
  ManagerRefreshButton,
} from '../components/ManagerDashboardUi';
import {
  ManagerErrorState,
  ManagerLoadingGrid,
} from '../components/ManagerPhase5States';
import { useManagerBedStats } from '../hooks/useManagerBeds';
import useManagerBranch from '../hooks/useManagerBranch';
import useManagerBranchReviews from '../hooks/useManagerBranchReviews';
import { useManagerComplaints } from '../hooks/useManagerComplaints';
import useManagerDashboard from '../hooks/useManagerDashboard';
import { getManagerOccupancyPercent } from '../utils/managerMappers';

function getBranchImage(branch = {}) {
  return branch.imageUrl || branch.image || branch.photoUrl || branch.thumbnailUrl || '';
}

function getBranchName(branch = {}) {
  return branch.hostelName || branch.name || branch.branchName || 'Assigned branch';
}

function getBranchLocation(branch = {}) {
  return branch.location || branch.fullAddress || branch.area || branch.city || 'Not available';
}

function getBranchRent(branch = {}) {
  const rent = Number(branch.monthlyRent ?? branch.monthlyRentStartsAt ?? 0);
  return rent > 0 ? `INR ${rent.toLocaleString('en-IN')}` : 'Not available';
}

function getReviewRating(review = {}) {
  const categoryRatings = [
    review.foodRating,
    review.cleaningRating,
    review.securityRating,
    review.wifiRating,
    review.powerRating,
  ]
    .map(Number)
    .filter((rating) => Number.isFinite(rating) && rating > 0);

  if (Number.isFinite(Number(review.overallRating))) return Number(review.overallRating);
  if (Number.isFinite(Number(review.rating))) return Number(review.rating);
  if (!categoryRatings.length) return 0;

  return categoryRatings.reduce((sum, rating) => sum + rating, 0) / categoryRatings.length;
}

export default function ManagerDashboardPage() {
  const dashboardQuery = useManagerDashboard();
  const bookingsQuery = useManagerBookings();
  const complaintsQuery = useManagerComplaints();
  const bedStatsQuery = useManagerBedStats();
  const branchQuery = useManagerBranch();
  const reviewsQuery = useManagerBranchReviews(branchQuery.data?.id);

  const { dashboard, counts, isLoading, isFetching, isError, errorMessage, refetch } =
    dashboardQuery;

  const staffCount = dashboard?.staffCount ?? counts?.staff ?? 0;
  const tenantCount = dashboard?.tenantCount ?? counts?.tenants ?? 0;
  const totalBeds = dashboard?.totalBeds ?? bedStatsQuery.data?.total ?? 0;
  const occupiedBeds = dashboard?.occupiedBeds ?? bedStatsQuery.data?.occupied ?? 0;
  const availableBeds = dashboard?.availableBeds ?? bedStatsQuery.data?.available ?? 0;
  const complaints = dashboard?.complaints ?? complaintsQuery.data?.length ?? 0;
  const occupancy = getManagerOccupancyPercent(occupiedBeds, totalBeds);

  const peopleData = [
    { name: 'Staff', value: Number(staffCount || 0) },
    { name: 'Tenants', value: Number(tenantCount || 0) },
  ].filter((item) => item.value > 0);

  const bedData = [
    { name: 'Occupied', value: Number(occupiedBeds || 0) },
    { name: 'Available', value: Number(availableBeds || 0) },
    { name: 'Maintenance', value: Number(bedStatsQuery.data?.maintenance || 0) },
  ].filter((item) => item.value > 0);

  const operationsData = [
    { name: 'Bookings', value: bookingsQuery.data?.length || 0 },
    { name: 'Complaints', value: complaintsQuery.data?.length || 0 },
    { name: 'Beds', value: totalBeds || 0 },
  ];

  const handleRefresh = () => {
    refetch();
    bookingsQuery.refetch();
    complaintsQuery.refetch();
    bedStatsQuery.refetch();
    branchQuery.refetch();
    if (branchQuery.data?.id) reviewsQuery.refetch();
  };

  const anyLoading = isLoading || bookingsQuery.isLoading || complaintsQuery.isLoading || bedStatsQuery.isLoading;
  const anyFetching =
    isFetching ||
    bookingsQuery.isFetching ||
    complaintsQuery.isFetching ||
    bedStatsQuery.isFetching ||
    branchQuery.isFetching ||
    reviewsQuery.isFetching;

  return (
    <div className="space-y-4">
      <ManagerPageHeader
        title="Operational Summary"
        eyebrow="Today"
        description="A clear view of bookings, available beds, assigned complaints, staff, and tenants for your branch."
        actions={<ManagerRefreshButton isFetching={anyFetching && !anyLoading} onRefresh={handleRefresh} />}
      />

      {isError ? (
        <ManagerErrorState title="Manager dashboard could not be loaded" message={errorMessage} onRetry={refetch} />
      ) : null}

      {anyLoading ? (
        <ManagerLoadingGrid count={5} />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <ManagerMetricCard title="Staff" value={staffCount} subtitle="Active staff" icon={UserCog} tone="blue" />
          <ManagerMetricCard title="Tenants" value={tenantCount} subtitle="Current tenants" icon={Users} tone="green" />
          <ManagerMetricCard title="Total Beds" value={totalBeds} subtitle="Branch capacity" icon={BedDouble} tone="slate" />
          <ManagerMetricCard title="Occupied" value={occupiedBeds} subtitle={`${occupancy}% occupied`} icon={BedDouble} tone="amber" />
          <ManagerMetricCard title="Complaints" value={complaints} subtitle="Assigned complaints" icon={MessageSquareText} tone="red" />
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <ManagerPanel title="People distribution" subtitle="Staff and tenant split for your branch.">
          {peopleData.length ? (
            <div className="h-72">
              <ResponsiveContainer width="99%" height={260}>
                <PieChart>
                  <Pie data={peopleData} dataKey="value" nameKey="name" innerRadius={64} outerRadius={100} paddingAngle={4} label={({ name, value }) => `${name}: ${value}`}>
                    {peopleData.map((entry, index) => (
                      <Cell key={entry.name} fill={index === 0 ? '#0284c7' : '#059669'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={28} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ManagerEmptyBlock title="No people data" message="Create staff or tenants to populate this chart." />
          )}
        </ManagerPanel>

        <ManagerPanel title="Bed status" subtitle="Bed capacity and status for your branch.">
          {bedData.length ? (
            <div className="h-72">
              <ResponsiveContainer width="99%" height={260}>
                <PieChart>
                  <Pie data={bedData} dataKey="value" nameKey="name" innerRadius={58} outerRadius={98} paddingAngle={3} label={({ name, value }) => `${name}: ${value}`}>
                    {bedData.map((entry) => (
                      <Cell key={entry.name} fill={entry.name === 'Occupied' ? '#0369A1' : entry.name === 'Available' ? '#059669' : '#DC2626'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={28} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <ManagerEmptyBlock title="No bed data" message="Create rooms and beds to populate this chart." />
          )}
        </ManagerPanel>
      </div>

      <ManagerPanel title="Operational volume" subtitle="Bookings, complaints, and beds shown together for quick review.">
        <div className="h-72">
          <ResponsiveContainer width="99%" height={260}>
            <BarChart data={operationsData} margin={{ left: 0, right: 12, top: 12, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="name" tickLine={false} axisLine={false} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
              <Tooltip />
              <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="#0284c7" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </ManagerPanel>

      <ManagerPanel title="Recent booking requests" subtitle="Booking requests for your branch.">
        {(bookingsQuery.data || []).slice(0, 5).length ? (
          <div className="space-y-3">
            {(bookingsQuery.data || []).slice(0, 5).map((booking) => (
              <div key={booking.bookingId} className="flex flex-col gap-2 rounded-[16px] border border-slate-100 bg-slate-50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="font-bold text-slate-950">{booking.tenantName}</p>
                  <p className="text-[12px] text-slate-500">{booking.branchName} • {booking.roomNumber} • {booking.bedNumber}</p>
                </div>
                <div className="flex items-center gap-2 text-[12px] font-bold text-slate-600">
                  <CalendarCheck2 className="h-4 w-4 text-sky-700" />
                  {booking.status}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <ManagerEmptyBlock title="No bookings found" message="New booking requests will appear here." />
        )}
      </ManagerPanel>

      <ManagerPanel
        title="Assigned Branch and Reviews"
        subtitle="Hostel details and recent tenant feedback"
      >
        {branchQuery.isLoading ? (
          <ManagerLoadingGrid count={1} />
        ) : branchQuery.isError ? (
          <ManagerErrorState
            title="Assigned branch could not be loaded"
            message={branchQuery.error?.message || 'Assigned branch details are not available right now.'}
            onRetry={branchQuery.refetch}
          />
        ) : branchQuery.data ? (
          <div className="space-y-6">
            {getBranchImage(branchQuery.data) ? (
              <img
                src={getBranchImage(branchQuery.data)}
                alt={getBranchName(branchQuery.data)}
                className="h-64 w-full rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-64 w-full items-center justify-center rounded-xl bg-slate-100 text-sm font-semibold text-slate-500">
                Branch image unavailable
              </div>
            )}

            <div>
              <h2 className="text-2xl font-bold text-slate-950">
                {getBranchName(branchQuery.data)}
              </h2>

              <p className="text-slate-600">
                {getBranchLocation(branchQuery.data)}
              </p>

              <p className="mt-2 font-medium text-slate-700">
                Rent: {getBranchRent(branchQuery.data)}
              </p>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <h3 className="mb-4 text-lg font-semibold text-slate-950">
                Tenant Reviews
              </h3>

              {reviewsQuery.isLoading ? (
                <ManagerLoadingGrid count={2} />
              ) : reviewsQuery.isError ? (
                <ManagerEmptyBlock
                  title="Reviews are not available right now"
                  message="Branch details are still usable. Refresh this section later."
                />
              ) : (reviewsQuery.data || []).length ? (
                <div className="space-y-3">
                  {(reviewsQuery.data || []).map((review, index) => (
                    <div
                      key={review.id || review.reviewId || `${review.comment}-${index}`}
                      className="rounded-lg border border-slate-200 p-4"
                    >
                      <div className="font-semibold text-slate-950">
                        Star {getReviewRating(review).toFixed(1)}
                      </div>

                      <div className="text-sm text-slate-600">
                        {review.comment || 'No written feedback provided.'}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-slate-500">
                  No reviews available yet
                </p>
              )}
            </div>
          </div>
        ) : (
          <ManagerEmptyBlock title="No branch assigned" message="Ask an owner or administrator to assign a branch to this manager account." />
        )}
      </ManagerPanel>
    </div>
  );
}
