import { Eye, Loader2, RefreshCw, Search, X } from 'lucide-react';
import { useState } from 'react';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import {
  BooleanStatusBadge,
  Card,
  ConfirmActionModal,
  EmptyState,
  ErrorState,
  PageHeader,
  PaginationBar,
  RefetchIndicator,
  RoleBadge,
  SkeletonBlock,
  TableShell,
} from '../components/SuperAdminUi';
import useCurrentSuperAdmin from '../hooks/useCurrentSuperAdmin';
import { useSuperAdminUserStatus, useSuperAdminUsers } from '../hooks/useSuperAdminUsers';
import {
  PAGE_SIZE_OPTIONS,
  ROLE_OPTIONS,
  STATUS_OPTIONS,
  formatDisplayDate,
  getDisplayName,
} from '../utils/superAdminMappers';
import {
  buildStatusActionCopy,
  getStatusActionBlockReason,
} from '../utils/superAdminPermissions';

function UserDetailsPanel({ user, onClose }) {
  if (!user) return null;

  const details = [
    ['Name', getDisplayName(user)],
    ['Email', user.email],
    ['Phone', user.phone],
    ['Role', user.role],
    ['Status', user.active ? 'Active' : 'Inactive'],
    ['Verified', user.verified ? 'Yes' : 'No'],
    ['KYC Verified', user.kycVerified ? 'Yes' : 'No'],
    ['Branch', user.branchId || 'Not available'],
    ['Created', formatDisplayDate(user.createdAt)],
  ];

  return (
    <Card className="p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">User Details</h2>
          <p className="mt-1 text-sm text-slate-500">Only available user details are shown.</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          aria-label="Close user details"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {details.map(([label, value]) => (
          <div key={label} className="rounded-lg border border-slate-200 bg-slate-50 p-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label}</p>
            <p className="mt-1 break-words text-sm font-semibold text-slate-900">{value}</p>
          </div>
        ))}
      </div>
    </Card>
  );
}

function getStatusButtonClass(active) {
  return active
    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100';
}

function UserMobileCard({ user, onView, onToggleStatus, pending, statusBlockReason = '' }) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">{getDisplayName(user)}</h3>
          <p className="truncate text-sm text-slate-500">{user.email}</p>
          <p className="mt-1 text-xs text-slate-500">{user.phone}</p>
        </div>
        <BooleanStatusBadge active={user.active} />
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <RoleBadge role={user.role} />
        <span className="inline-flex h-[22px] items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 text-xs font-semibold text-slate-600">
          {formatDisplayDate(user.createdAt)}
        </span>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onView(user)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700"
        >
          <Eye className="h-4 w-4" />
          View
        </button>
        <button
          type="button"
          disabled={pending || Boolean(statusBlockReason)}
          title={statusBlockReason || undefined}
          onClick={() => onToggleStatus(user)}
          className={`inline-flex h-10 items-center rounded-lg border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            statusBlockReason ? 'border-slate-200 bg-white text-slate-500' : getStatusButtonClass(user.active)
          }`}
        >
          {statusBlockReason ? 'Protected' : user.active ? 'Disable' : 'Enable'}
        </button>
      </div>
    </article>
  );
}

export default function SuperAdminUsersPage() {
  const [filters, setFilters] = useState({
    page: 0,
    size: 10,
    role: '',
    active: '',
    sortBy: 'createdAt',
    direction: 'desc',
  });
  const [searchInput, setSearchInput] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState(null);
  const debouncedSearch = useDebouncedValue(searchInput, 400);
  const usersQuery = useSuperAdminUsers({
    ...filters,
    search: debouncedSearch,
    active: filters.active === '' ? undefined : filters.active === 'true',
  });
  const { data: currentSuperAdmin } = useCurrentSuperAdmin();
  const updateStatusMutation = useSuperAdminUserStatus();

  const page = usersQuery.data || {
    content: [],
    totalElements: 0,
    totalPages: 0,
    number: filters.page,
    size: filters.size,
    first: true,
    last: true,
  };
  const users = page.content || [];

  const updateFilter = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
      page: key === 'page' ? value : 0,
    }));
  };

  const clearFilters = () => {
    setSearchInput('');
    setFilters({
      page: 0,
      size: 10,
      role: '',
      active: '',
      sortBy: 'createdAt',
      direction: 'desc',
    });
  };

  const toggleStatus = (user) => {
    const blockReason = getStatusActionBlockReason(user, currentSuperAdmin);
    if (blockReason) return;

    setStatusConfirm({
      record: user,
      ...buildStatusActionCopy(user, 'user'),
    });
  };

  const confirmStatusChange = async () => {
    const user = statusConfirm?.record;
    if (!user) return;

    try {
      await updateStatusMutation.mutateAsync({ id: user.id, active: !user.active });
      setStatusConfirm(null);
    } catch {
      // Mutation hook already shows a safe toast message.
    }
  };

  const searchNeedsMoreText = searchInput.trim().length === 1;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Users"
        description="Manage user access by role, status, and search filters."
        actions={
          <>
            <RefetchIndicator show={usersQuery.isFetching && !usersQuery.isLoading} />
            <button
              type="button"
              onClick={() => usersQuery.refetch()}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="p-5">
          <p className="text-[13px] font-medium text-slate-500">Matching Users</p>
          <p className="mt-3 text-[28px] font-bold leading-8 text-slate-900">
            {usersQuery.isLoading ? '...' : page.totalElements}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-[13px] font-medium text-slate-500">Visible Users</p>
          <p className="mt-3 text-[28px] font-bold leading-8 text-slate-900">
            {usersQuery.isLoading ? '...' : users.length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-[13px] font-medium text-slate-500">Active Users</p>
          <p className="mt-3 text-[28px] font-bold leading-8 text-slate-900">
            {usersQuery.isLoading ? '...' : users.filter((user) => user.active).length}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-[13px] font-medium text-slate-500">Inactive Users</p>
          <p className="mt-3 text-[28px] font-bold leading-8 text-slate-900">
            {usersQuery.isLoading ? '...' : users.filter((user) => !user.active).length}
          </p>
        </Card>
      </div>

      <UserDetailsPanel user={selectedUser} onClose={() => setSelectedUser(null)} />

      <TableShell
        title="All Users"
        description="Filter users by role, status, search text, and page size."
        actions={
          <label className="flex h-10 w-full min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 sm:w-[320px]">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                updateFilter('page', 0);
              }}
              placeholder="Search users"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
            {usersQuery.isFetching ? <Loader2 className="h-4 w-4 animate-spin text-slate-400" /> : null}
          </label>
        }
      >
        <div className="grid gap-3 border-b border-slate-100 p-4 sm:grid-cols-2 lg:grid-cols-4">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Role</span>
            <select value={filters.role} onChange={(event) => updateFilter('role', event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-900">
              {ROLE_OPTIONS.map((option) => (
                <option key={option.value || option.label} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Status</span>
            <select value={filters.active} onChange={(event) => updateFilter('active', event.target.value)} className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-900">
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value || option.label} value={option.value}>{option.label}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Page Size</span>
            <select value={filters.size} onChange={(event) => updateFilter('size', Number(event.target.value))} className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm outline-none focus:border-slate-900">
              {PAGE_SIZE_OPTIONS.map((size) => (
                <option key={size} value={size}>{size} rows</option>
              ))}
            </select>
          </label>
          <div className="flex items-end">
            <button type="button" onClick={clearFilters} className="h-10 w-full rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50">
              Clear Filters
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5">
          {searchNeedsMoreText ? (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-3 text-sm font-semibold text-amber-800">
              Enter at least 2 characters to search users.
            </div>
          ) : null}
          {usersQuery.isLoading ? <SkeletonBlock rows={5} /> : null}
          {usersQuery.isError ? (
            <ErrorState title="Users could not be loaded" message={usersQuery.error?.message} onRetry={usersQuery.refetch} />
          ) : null}
          {!usersQuery.isLoading && !usersQuery.isError && users.length === 0 ? (
            <EmptyState title="No users found" description="No users matched the current filters." />
          ) : null}
          {!usersQuery.isLoading && !usersQuery.isError && users.length > 0 ? (
            <>
              <div className="space-y-4 md:hidden">
                {users.map((user) => (
                  <UserMobileCard
                    key={user.id || user.email}
                    user={user}
                    onView={setSelectedUser}
                    onToggleStatus={toggleStatus}
                    pending={updateStatusMutation.isPending}
                    statusBlockReason={getStatusActionBlockReason(user, currentSuperAdmin)}
                  />
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                <table className="min-w-[840px] w-full text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">User</th>
                      <th className="px-4 py-3">Role</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {users.map((user) => (
                      <tr key={user.id || user.email} className="hover:bg-slate-50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">{getDisplayName(user)}</p>
                          <p className="text-xs text-slate-500">{user.email}</p>
                        </td>
                        <td className="px-4 py-3"><RoleBadge role={user.role} /></td>
                        <td className="px-4 py-3 text-slate-700">{user.phone}</td>
                        <td className="px-4 py-3"><BooleanStatusBadge active={user.active} /></td>
                        <td className="px-4 py-3 text-slate-700">{formatDisplayDate(user.createdAt)}</td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button type="button" onClick={() => setSelectedUser(user)} className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                              <Eye className="h-4 w-4" />
                              View
                            </button>
                            <button type="button" disabled={updateStatusMutation.isPending || Boolean(getStatusActionBlockReason(user, currentSuperAdmin))} title={getStatusActionBlockReason(user, currentSuperAdmin) || undefined} onClick={() => toggleStatus(user)} className={`inline-flex h-9 items-center rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                              getStatusActionBlockReason(user, currentSuperAdmin)
                                ? 'border-slate-200 bg-white text-slate-500'
                                : getStatusButtonClass(user.active)
                            }`}>
                              {getStatusActionBlockReason(user, currentSuperAdmin) ? 'Protected' : user.active ? 'Disable' : 'Enable'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : null}
        </div>

        <PaginationBar
          page={page.number}
          totalPages={page.totalPages}
          totalElements={page.totalElements}
          size={page.size}
          onPrevious={() => updateFilter('page', Math.max(filters.page - 1, 0))}
          onNext={() => updateFilter('page', filters.page + 1)}
          previousDisabled={page.first || filters.page <= 0}
          nextDisabled={page.last || filters.page + 1 >= page.totalPages}
        />
      </TableShell>

      <ConfirmActionModal
        open={Boolean(statusConfirm)}
        title={statusConfirm?.title}
        message={statusConfirm?.message}
        details={statusConfirm?.details}
        confirmLabel={statusConfirm?.confirmLabel}
        tone={statusConfirm?.tone}
        pending={updateStatusMutation.isPending}
        onConfirm={confirmStatusChange}
        onClose={() => setStatusConfirm(null)}
      />

    </div>
  );
}
