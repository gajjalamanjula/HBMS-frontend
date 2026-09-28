import { zodResolver } from '@hookform/resolvers/zod';
import { Megaphone, PlusCircle, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { z } from 'zod';

import { useCurrentUser } from '../../../features/auth/hooks/useAuth';
import {
  useAnnouncements,
  useCreateAnnouncement,
  useDeleteAnnouncement,
} from '../../../features/communication/hooks/useCommunication';
import { OwnerConfirmModal } from '../../../features/owner/components/OwnerDashboardUi';
import { useOwnerBranches } from '../../../features/owner/hooks/useOwnerBranches';
import { normalizeRole, ROLES } from '../../../utils/constants/roles';

const announcementSchema = z
  .object({
    role: z.string().optional(),
    branchId: z.string().trim().optional(),
    title: z.string().trim().min(3, 'Title is required'),
    message: z.string().trim().min(5, 'Message is required'),
  })
  .superRefine((values, ctx) => {
    const role = normalizeRole(values.role);
    if ((role === ROLES.OWNER || role === ROLES.MANAGER) && !values.branchId) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['branchId'],
        message: 'Branch is required',
      });
    }
  });

function canManageAnnouncements(role = '') {
  return [ROLES.OWNER, ROLES.MANAGER].includes(normalizeRole(role));
}

export default function AnnouncementsPage() {
  const currentUser = useCurrentUser();
  const role = normalizeRole(currentUser.data?.role);
  const isOwner = role === ROLES.OWNER;
  const isManager = role === ROLES.MANAGER;
  const isStaff = role === ROLES.STAFF;
  const canManage = canManageAnnouncements(role);
  const managerBranchId = currentUser.data?.branchId || currentUser.data?.branch?.id || '';
  const staffBranchId = currentUser.data?.branchId || currentUser.data?.branch?.id || '';

  const ownerBranchesQuery = useOwnerBranches({ enabled: isOwner });
  const createMutation = useCreateAnnouncement();
  const deleteMutation = useDeleteAnnouncement();
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const form = useForm({
    resolver: zodResolver(announcementSchema),
    defaultValues: { role: '', branchId: '', title: '', message: '' },
  });

  const selectedBranchId = useWatch({ control: form.control, name: 'branchId' });
  const announcementsBranchId = isOwner
    ? selectedBranchId
    : isManager
      ? managerBranchId
      : isStaff
        ? staffBranchId
        : '';
  const announcementsQuery = useAnnouncements(
    { branchId: announcementsBranchId || undefined },
    {
      enabled:
        !currentUser.isLoading &&
        (!isOwner || !ownerBranchesQuery.isLoading) &&
        (!isStaff || Boolean(staffBranchId)),
    }
  );

  useEffect(() => {
    form.setValue('role', role, { shouldValidate: true });

    if (isManager) {
      form.setValue('branchId', managerBranchId, { shouldValidate: true });
    }

    if (!isOwner && !isManager) {
      form.setValue('branchId', '');
    }
  }, [form, isManager, isOwner, managerBranchId, role]);

  const onSubmit = async (values) => {
    try {
      await createMutation.mutateAsync({
        branchId: values.branchId,
        title: values.title,
        message: values.message,
      });

      form.reset({ role, branchId: values.branchId, title: '', message: '' });
    } catch {
      // Mutation hook already shows a controlled toast.
    }
  };

  const requestDelete = (item) => {
    setDeleteConfirm({
      record: item,
      title: 'Delete announcement?',
      message: 'This announcement will be removed for the selected branch.',
      details: [
        ['Title', item.title],
        ['Branch ID', item.branchId || announcementsBranchId || 'Selected branch'],
      ],
    });
  };

  const confirmDelete = async () => {
    const item = deleteConfirm?.record;
    if (!item?.id) return;

    try {
      await deleteMutation.mutateAsync({ id: item.id, branchId: item.branchId || announcementsBranchId });
      setDeleteConfirm(null);
    } catch {
      // Mutation hook already shows a controlled toast.
    }
  };

  const announcements = announcementsQuery.data || [];
  const ownerBranches = ownerBranchesQuery.branches;
  const disableSubmit =
    createMutation.isPending ||
    currentUser.isLoading ||
    (isOwner && ownerBranchesQuery.isLoading) ||
    (isManager && !managerBranchId);

  return (
    <div className="space-y-5">
      <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_16px_36px_rgba(15,23,42,0.06)] transition hover:-translate-y-0.5 hover:shadow-[0_22px_48px_rgba(15,23,42,0.09)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-slate-500">Branch communication</p>
            <h1 className="mt-1 text-2xl font-black text-slate-950">Announcements</h1>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-500">
              {isStaff
                ? 'View announcements shared by your hostel team.'
                : 'Live branch announcements for your hostel team. Owner and Manager can create or remove branch announcements.'}
            </p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-700">
            <Megaphone className="h-6 w-6" />
          </div>
        </div>
      </div>

      {canManage ? (
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]"
          noValidate
        >
          {isOwner && ownerBranchesQuery.isError ? (
            <div className="mb-4 rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              {ownerBranchesQuery.errorMessage || 'Owner branches could not be loaded'}
            </div>
          ) : null}

          {isManager && !managerBranchId ? (
            <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
              Manager account is not assigned to a branch, so announcements cannot be created.
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-[260px_280px_1fr]">
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Branch</span>
              {isOwner ? (
                <select
                  {...form.register('branchId')}
                  disabled={ownerBranchesQuery.isLoading || createMutation.isPending}
                  className="h-11 w-full cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {ownerBranchesQuery.isLoading ? 'Loading branches...' : 'Select branch'}
                  </option>
                  {ownerBranches.map((branch) => (
                    <option key={branch.id} value={branch.id}>
                      {branch.name}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  {...form.register('branchId')}
                  value={managerBranchId}
                  readOnly
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-100 px-3 text-sm text-slate-500 outline-none"
                  placeholder="Assigned branch ID"
                />
              )}
              {form.formState.errors.branchId ? (
                <p className="text-xs font-semibold text-rose-600">{form.formState.errors.branchId.message}</p>
              ) : null}
            </label>

            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Title</span>
              <input
                {...form.register('title')}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Maintenance update"
              />
              {form.formState.errors.title ? <p className="text-xs font-semibold text-rose-600">{form.formState.errors.title.message}</p> : null}
            </label>
            <label className="space-y-2">
              <span className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Message</span>
              <textarea
                {...form.register('message')}
                rows={3}
                className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
                placeholder="Write announcement message"
              />
              {form.formState.errors.message ? <p className="text-xs font-semibold text-rose-600">{form.formState.errors.message.message}</p> : null}
            </label>
          </div>
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={disableSubmit}
              className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 text-sm font-bold text-white shadow-[0_12px_26px_rgba(79,70,229,0.2)] transition hover:-translate-y-0.5 hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <PlusCircle className="h-4 w-4" />
              {createMutation.isPending ? 'Publishing...' : 'Publish Announcement'}
            </button>
          </div>
        </form>
      ) : null}

      {isStaff && !staffBranchId ? (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Staff account is not assigned to a branch, so branch announcements cannot be loaded.
        </div>
      ) : null}

      <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_14px_34px_rgba(15,23,42,0.05)]">
        {announcementsQuery.isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((item) => <div key={item} className="h-20 animate-pulse rounded-2xl bg-slate-100" />)}
          </div>
        ) : announcementsQuery.isError ? (
          <div className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
            Announcements are not available right now. Please try again.
          </div>
        ) : announcements.length ? (
          <div className="space-y-3">
            {announcements.map((item) => (
              <article key={item.id || item.title} className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:-translate-y-0.5 hover:bg-white hover:shadow-sm">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-sm font-black text-slate-950">{item.title}</h2>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{item.message}</p>
                    {item.createdAt ? <p className="mt-2 text-xs text-slate-400">{new Date(item.createdAt).toLocaleString()}</p> : null}
                  </div>
                  {canManage && item.id ? (
                    <button
                      type="button"
                      onClick={() => requestDelete(item)}
                      disabled={deleteMutation.isPending}
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-xl border border-rose-100 bg-white text-rose-600 transition hover:bg-rose-50 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label="Delete announcement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-500">
            No announcements yet.
          </div>
        )}
      </section>

      <OwnerConfirmModal
        open={Boolean(deleteConfirm)}
        title={deleteConfirm?.title}
        message={deleteConfirm?.message}
        details={deleteConfirm?.details}
        confirmLabel="Delete announcement"
        pending={deleteMutation.isPending}
        onConfirm={confirmDelete}
        onClose={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
