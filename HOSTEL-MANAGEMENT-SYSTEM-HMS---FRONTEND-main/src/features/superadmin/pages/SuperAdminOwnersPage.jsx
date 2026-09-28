import { zodResolver } from '@hookform/resolvers/zod';
import {
  CheckCircle2,
  Edit3,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
  X,
  XCircle,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams } from 'react-router-dom';

import CreateOwnerModal from '../components/CreateOwnerModal';
import VerifyOwnerOtpModal from '../components/VerifyOwnerOtpModal';
import {
  BooleanStatusBadge,
  Card,
  ConfirmActionModal,
  EmptyState,
  ErrorState,
  PageHeader,
  RefetchIndicator,
  SkeletonBlock,
  StatusBadge,
  TableShell,
} from '../components/SuperAdminUi';
import { useSuperAdminBranches } from '../hooks/useSuperAdminBranches';
import useCurrentSuperAdmin from '../hooks/useCurrentSuperAdmin';
import {
  useUpdateOwnerMutation,
  useUpdateUserStatusMutation,
} from '../hooks/useSuperAdminDashboard';
import { useSuperAdminOwners } from '../hooks/useSuperAdminOwners';
import { updateOwnerSchema } from '../schemas/ownerSchemas';
import {
  buildOwnerUpdatePayload,
  formatDisplayDate,
  getBranchLocationLabel,
  getDisplayName,
  maskAadhaarNumber,
} from '../utils/superAdminMappers';
import {
  buildStatusActionCopy,
  getStatusActionBlockReason,
} from '../utils/superAdminPermissions';

function SummaryCard({ label, value, icon: Icon, tone }) {
  return (
    <Card className="p-5 transition hover:-translate-y-0.5 hover:border-indigo-100 hover:shadow-[0_22px_50px_rgba(15,23,42,0.10)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-[13px] font-medium text-slate-500">{label}</p>
          <p className="mt-3 text-[28px] font-bold leading-8 text-slate-900">
            {value}
          </p>
        </div>

        <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${tone}`}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </Card>
  );
}

function FieldError({ message }) {
  if (!message) return null;

  return <p className="mt-1 text-xs text-red-600">{message}</p>;
}

function getStatusButtonClass(active) {
  return active
    ? 'border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-100'
    : 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-100';
}

function OwnerMobileCard({
  owner,
  branchLabel,
  onVerify,
  onEdit,
  onToggleStatus,
  statusPending,
  statusBlockReason = '',
}) {
  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:hidden">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-base font-semibold text-slate-900">
            {getDisplayName(owner)}
          </h3>
          <p className="truncate text-sm text-slate-500">{owner.email}</p>
          <p className="mt-1 text-xs text-slate-500">{owner.phone}</p>
        </div>

        <BooleanStatusBadge active={owner.active} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-slate-600">
        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-semibold text-slate-700">Verified</p>
          <p className="mt-1">{owner.verified ? 'Yes' : 'No'}</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-semibold text-slate-700">Branch</p>
          <p className="mt-1 truncate">{branchLabel}</p>
        </div>

        <div className="rounded-lg bg-slate-50 p-3">
          <p className="font-semibold text-slate-700">Created</p>
          <p className="mt-1">{formatDisplayDate(owner.createdAt)}</p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => onVerify(owner)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <ShieldCheck className="h-4 w-4" />
          Verify
        </button>

        <button
          type="button"
          onClick={() => onEdit(owner)}
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
        >
          <Edit3 className="h-4 w-4" />
          Edit
        </button>

        <button
          type="button"
          disabled={statusPending || Boolean(statusBlockReason)}
          title={statusBlockReason || undefined}
          onClick={() => onToggleStatus(owner)}
          className={`inline-flex h-10 items-center rounded-lg border px-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
            statusBlockReason ? 'border-slate-200 bg-white text-slate-500' : getStatusButtonClass(owner.active)
          }`}
        >
          {statusBlockReason ? 'Protected' : owner.active ? 'Disable' : 'Enable'}
        </button>
      </div>
    </article>
  );
}

function EditOwnerPanel({ owner, branches, onClose }) {
  const updateOwnerMutation = useUpdateOwnerMutation();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(updateOwnerSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      aadhaarNumber: '',
      branchId: '',
    },
  });

  useEffect(() => {
    if (!owner) return;

    reset({
      name: owner.name === '—' ? '' : owner.name,
      email: owner.email === '—' ? '' : owner.email,
      phone: owner.phone === '—' ? '' : owner.phone,
      aadhaarNumber: maskAadhaarNumber(owner.aadhaarNumber),
      branchId: owner.branchId || '',
    });
  }, [owner, reset]);

  if (!owner) return null;

  const onSubmit = async (values) => {
    try {
      await updateOwnerMutation.mutateAsync({
        id: owner.id,
        payload: buildOwnerUpdatePayload(values),
      });

      onClose();
    } catch {
      // Mutation hook already shows a safe toast message.
    }
  };

  return (
    <div className="fixed inset-0 z-[90] overflow-hidden">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55"
        aria-label="Close owner edit panel"
        onClick={onClose}
      />

      <aside className="absolute inset-y-0 right-0 flex w-full max-w-[480px] flex-col bg-white shadow-[-24px_0_60px_rgba(15,23,42,0.22)]">
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-slate-200 px-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Update Owner</h2>
            <p className="text-xs text-slate-500">
              Update supported owner contact fields.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            aria-label="Close owner edit panel"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex min-h-0 flex-1 flex-col"
          noValidate
        >
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
            <div className="grid gap-4">
              <label className="block">
                <span className="text-[13px] font-medium text-slate-500">Name</span>
                <input
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-900"
                  {...register('name')}
                />
                <FieldError message={errors.name?.message} />
              </label>

              <label className="block">
                <span className="text-[13px] font-medium text-slate-500">
                  Email (read-only)
                </span>
                <input
                  type="email"
                  disabled
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 outline-none"
                  {...register('email')}
                />
                <FieldError message={errors.email?.message} />
              </label>

              <label className="block">
                <span className="text-[13px] font-medium text-slate-500">Phone</span>
                <input
                  type="tel"
                  inputMode="numeric"
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-slate-900"
                  {...register('phone')}
                />
                <FieldError message={errors.phone?.message} />
              </label>

              <label className="block">
                <span className="text-[13px] font-medium text-slate-500">
                  Aadhaar Number (read-only)
                </span>
                <input
                  type="text"
                  disabled
                  inputMode="numeric"
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 outline-none"
                  {...register('aadhaarNumber')}
                />
                <FieldError message={errors.aadhaarNumber?.message} />
              </label>

              <label className="block">
                <span className="text-[13px] font-medium text-slate-500">
                  Branch (read-only)
                </span>
                <select
                  disabled
                  className="mt-2 h-10 w-full rounded-lg border border-slate-200 bg-slate-50 px-3 text-sm text-slate-500 outline-none"
                  {...register('branchId')}
                >
                  <option value="">No branch assignment</option>
                  {branches.map((branch) => (
                    <option key={branch.id || branch.name} value={branch.id}>
                      {branch.name} - {getBranchLocationLabel(branch)}
                    </option>
                  ))}
                </select>
                <FieldError message={errors.branchId?.message} />
              </label>
            </div>
          </div>

          <div className="flex min-h-[72px] shrink-0 flex-col-reverse gap-3 border-t border-slate-200 bg-white px-5 py-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={updateOwnerMutation.isPending}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {updateOwnerMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : null}
              {updateOwnerMutation.isPending ? 'Saving' : 'Save Owner'}
            </button>
          </div>
        </form>
      </aside>
    </div>
  );
}

export default function SuperAdminOwnersPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const createRequested = searchParams.get('create') === 'owner';
  const [createOpen, setCreateOpen] = useState(createRequested);
  const [verifyState, setVerifyState] = useState({ open: false, email: '' });
  const [editingOwner, setEditingOwner] = useState(null);
  const [statusConfirm, setStatusConfirm] = useState(null);

  const { data: currentSuperAdmin } = useCurrentSuperAdmin();
  const updateUserStatusMutation = useUpdateUserStatusMutation();
  const branchesQuery = useSuperAdminBranches();
  const branches = branchesQuery.data || [];

  const { search, setSearch, filteredOwners, summary, ownersQuery, refetch } =
    useSuperAdminOwners();

  const branchNamesByOwnerId = useMemo(() => {
    const map = new Map();

    branches.forEach((branch) => {
      const ownerId = String(branch.ownerId || '').trim();
      if (!ownerId) return;

      const label = branch.name && branch.name !== '—' ? branch.name : branch.id;
      if (!label) return;

      const current = map.get(ownerId) || [];
      if (!current.includes(label)) current.push(label);

      map.set(ownerId, current);
    });

    return map;
  }, [branches]);

  const getOwnerBranchLabel = (owner) => {
    if (owner.branchName && owner.branchName !== '—') return owner.branchName;

    const branchNames = branchNamesByOwnerId.get(String(owner.id || '').trim());
    if (branchNames?.length) return branchNames.join(', ');

    if (owner.branchId) return owner.branchId;

    return 'No branch yet';
  };

  const openVerify = (owner) => {
    setVerifyState({
      open: true,
      email: owner?.email === '—' ? '' : owner?.email || '',
    });
  };

  const handleToggleStatus = (owner) => {
    const blockReason = getStatusActionBlockReason(owner, currentSuperAdmin);
    if (blockReason) return;

    setStatusConfirm({
      record: owner,
      ...buildStatusActionCopy(owner, 'owner'),
    });
  };

  const confirmStatusChange = async () => {
    const owner = statusConfirm?.record;
    if (!owner) return;

    try {
      await updateUserStatusMutation.mutateAsync({
        id: owner.id,
        active: !owner.active,
        invalidateOwners: true,
      });
      setStatusConfirm(null);
    } catch {
      // Mutation hook already shows a safe toast message.
    }
  };

  const closeCreateOwner = () => {
    setCreateOpen(false);
    if (createRequested) {
      setSearchParams({}, { replace: true });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Owners"
        description="Create, verify, update, and manage owner accounts."
        actions={
          <>
            <RefetchIndicator show={ownersQuery.isFetching && !ownersQuery.isLoading} />

            <button
              type="button"
              onClick={refetch}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>

            <button
              type="button"
              onClick={() => setCreateOpen(true)}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white shadow-[0_12px_26px_rgba(79,70,229,0.22)] transition hover:-translate-y-0.5 hover:bg-indigo-700"
            >
              <Plus className="h-4 w-4" />
              Create Owner
            </button>
          </>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total Owners"
          value={summary.total}
          icon={Users}
          tone="bg-indigo-50 text-indigo-700"
        />

        <SummaryCard
          label="Active"
          value={summary.active}
          icon={CheckCircle2}
          tone="bg-green-50 text-green-700"
        />

        <SummaryCard
          label="Verified"
          value={summary.verified}
          icon={ShieldCheck}
          tone="bg-green-50 text-green-700"
        />

        <SummaryCard
          label="Inactive"
          value={summary.inactive}
          icon={XCircle}
          tone="bg-red-50 text-red-700"
        />
      </div>

      <TableShell
        title="Owner Accounts"
        description="Search available owner accounts."
        actions={
          <label className="flex h-10 w-full min-w-0 items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 sm:w-[320px]">
            <Search className="h-4 w-4 shrink-0 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search owners"
              className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-slate-400"
            />
          </label>
        }
      >
        <div className="p-4 sm:p-5">
          {ownersQuery.isLoading ? <SkeletonBlock rows={5} /> : null}

          {ownersQuery.isError ? (
            <ErrorState
              title="Owners could not be loaded"
              message={ownersQuery.error?.message}
              onRetry={ownersQuery.refetch}
            />
          ) : null}

          {!ownersQuery.isLoading && !ownersQuery.isError && filteredOwners.length === 0 ? (
            <EmptyState title="No owners found" description="No owners match this view." />
          ) : null}

          {!ownersQuery.isLoading && !ownersQuery.isError && filteredOwners.length > 0 ? (
            <>
              <div className="space-y-4 md:hidden">
                {filteredOwners.map((owner) => (
                  <OwnerMobileCard
                    key={owner.id || owner.email}
                    owner={owner}
                    branchLabel={getOwnerBranchLabel(owner)}
                    onVerify={openVerify}
                    onEdit={setEditingOwner}
                    onToggleStatus={handleToggleStatus}
                    statusPending={updateUserStatusMutation.isPending}
                    statusBlockReason={getStatusActionBlockReason(owner, currentSuperAdmin)}
                  />
                ))}
              </div>

              <div className="hidden overflow-x-auto rounded-xl border border-slate-200 md:block">
                <table className="w-full min-w-[860px] text-left text-sm">
                  <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Branch</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3">Created</th>
                      <th className="px-4 py-3 text-right">Actions</th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100 bg-white">
                    {filteredOwners.map((owner) => (
                      <tr
                        key={owner.id || owner.email}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-4 py-3">
                          <p className="font-semibold text-slate-900">
                            {getDisplayName(owner)}
                          </p>
                          <p className="text-xs text-slate-500">{owner.email}</p>
                        </td>

                        <td className="px-4 py-3 text-slate-700">{owner.phone}</td>

                        <td className="px-4 py-3 text-slate-700">
                          {getOwnerBranchLabel(owner)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-2">
                            <BooleanStatusBadge active={owner.active} />
                            <StatusBadge value={owner.verified ? 'Verified' : 'Unverified'} />
                          </div>
                        </td>

                        <td className="px-4 py-3 text-slate-700">
                          {formatDisplayDate(owner.createdAt)}
                        </td>

                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            <button
                              type="button"
                              onClick={() => openVerify(owner)}
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              <ShieldCheck className="h-4 w-4" />
                              Verify
                            </button>

                            <button
                              type="button"
                              onClick={() => setEditingOwner(owner)}
                              className="inline-flex h-9 items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </button>

                            <button
                              type="button"
                              disabled={updateUserStatusMutation.isPending || Boolean(getStatusActionBlockReason(owner, currentSuperAdmin))}
                              title={getStatusActionBlockReason(owner, currentSuperAdmin) || undefined}
                              onClick={() => handleToggleStatus(owner)}
              className={`inline-flex h-9 items-center rounded-lg border px-3 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 ${
                getStatusActionBlockReason(owner, currentSuperAdmin)
                  ? 'border-slate-200 bg-white text-slate-500'
                  : getStatusButtonClass(owner.active)
              }`}
                            >
                              {getStatusActionBlockReason(owner, currentSuperAdmin) ? 'Protected' : owner.active ? 'Disable' : 'Enable'}
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
      </TableShell>

      <CreateOwnerModal
        open={createOpen || createRequested}
        onClose={closeCreateOwner}
        branches={branches}
        onCreated={(result) => {
          if (result?.email) setVerifyState({ open: true, email: result.email });
        }}
      />

      <VerifyOwnerOtpModal
        open={verifyState.open}
        defaultEmail={verifyState.email}
        onClose={() => setVerifyState({ open: false, email: '' })}
      />

      <EditOwnerPanel
        owner={editingOwner}
        branches={branches}
        onClose={() => setEditingOwner(null)}
      />

      <ConfirmActionModal
        open={Boolean(statusConfirm)}
        title={statusConfirm?.title}
        message={statusConfirm?.message}
        details={statusConfirm?.details}
        confirmLabel={statusConfirm?.confirmLabel}
        tone={statusConfirm?.tone}
        pending={updateUserStatusMutation.isPending}
        onConfirm={confirmStatusChange}
        onClose={() => setStatusConfirm(null)}
      />
    </div>
  );
}
