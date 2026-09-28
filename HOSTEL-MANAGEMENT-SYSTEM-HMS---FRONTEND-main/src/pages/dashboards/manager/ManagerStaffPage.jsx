import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, PlusCircle, Search, UserCog } from 'lucide-react';

import { OwnerConfirmModal } from '../../../features/owner/components/OwnerDashboardUi';
import ManagerEditStaffPanel from '../../../features/manager/components/ManagerEditStaffPanel';
import ManagerStaffList from '../../../features/manager/components/ManagerStaffList';
import {
  ManagerEmptyBlock,
  ManagerMetricCard,
  ManagerPageHeader,
  ManagerPanel,
  ManagerRefreshButton,
  ManagerSearchBox,
} from '../../../features/manager/components/ManagerDashboardUi';
import {
  ManagerErrorState,
  ManagerLoadingGrid,
} from '../../../features/manager/components/ManagerPhase5States';
import {
  useDeactivateManagerStaff,
  useManagerStaff,
} from '../../../features/manager/hooks/useManagerStaff';

export default function ManagerStaffPage() {
  const [search, setSearch] = useState('');
  const [editingStaff, setEditingStaff] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [deletingId, setDeletingId] = useState('');
  const staffQuery = useManagerStaff();
  const deleteMutation = useDeactivateManagerStaff();
  const staff = staffQuery.data || [];

  const filteredStaff = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return staff;
    return staff.filter((member) =>
      [member.name, member.email, member.phone, member.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [search, staff]);

  const activeCount = staff.filter((member) => member.active === true).length;

  const requestDeactivate = (member) => {
    setDeleteConfirm({
      record: member,
      title: 'Deactivate staff?',
      message: 'This staff member may lose access immediately. Confirm before changing account status.',
      details: [
        ['Name', member.name],
        ['Email', member.email],
        ['Phone', member.phone],
      ],
    });
  };

  const confirmDeactivate = async () => {
    const member = deleteConfirm?.record;
    if (!member?.id) return;
    setDeletingId(member.id);
    try {
      await deleteMutation.mutateAsync(member.id);
      setDeleteConfirm(null);
    } catch {
      // toast handled by mutation hook
    } finally {
      setDeletingId('');
    }
  };

  return (
    <div className="space-y-4">
      <ManagerPageHeader
        title="Staff"
        eyebrow="Team"
        description="Review staff assigned to your branch, edit contact details, or deactivate access with confirmation."
        actions={
          <>
            <ManagerRefreshButton
              isFetching={staffQuery.isFetching && !staffQuery.isLoading}
              onRefresh={staffQuery.refetch}
            />
            <Link
              to="/manager/create-user"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-sky-700 px-3 text-[13px] font-bold text-white shadow-[0_12px_26px_rgba(2,132,199,0.22)] transition hover:-translate-y-0.5 hover:bg-sky-800"
            >
              <PlusCircle className="h-4 w-4" />
              Create Staff
            </Link>
          </>
        }
      />

      {staffQuery.isError ? (
        <ManagerErrorState title="Staff could not be loaded" message={staffQuery.error?.message} onRetry={staffQuery.refetch} />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ManagerMetricCard title="Staff" value={staff.length} icon={UserCog} loading={staffQuery.isLoading} tone="blue" />
        <ManagerMetricCard title="Active" value={activeCount} icon={Pencil} tone="green" loading={staffQuery.isLoading} />
        <ManagerMetricCard title="Shown" value={filteredStaff.length} icon={Search} tone="slate" loading={staffQuery.isLoading} />
      </div>

      <ManagerPanel
        title="Staff list"
        subtitle="Staff accounts for your branch. Deactivation requires confirmation."
        action={<ManagerSearchBox value={search} onChange={setSearch} placeholder="Search staff" />}
      >
        {staffQuery.isLoading ? (
          <ManagerLoadingGrid count={3} />
        ) : filteredStaff.length ? (
          <ManagerStaffList
            staff={filteredStaff}
            onEdit={setEditingStaff}
            onDelete={requestDeactivate}
            deletingId={deletingId}
          />
        ) : (
          <ManagerEmptyBlock title="No staff found" message="Create and verify staff from the Create User page." />
        )}
      </ManagerPanel>

      <ManagerEditStaffPanel staff={editingStaff} onClose={() => setEditingStaff(null)} />

      <OwnerConfirmModal
        open={Boolean(deleteConfirm)}
        title={deleteConfirm?.title}
        message={deleteConfirm?.message}
        details={deleteConfirm?.details}
        confirmLabel="Deactivate staff"
        tone="danger"
        pending={deleteMutation.isPending}
        onConfirm={confirmDeactivate}
        onClose={() => setDeleteConfirm(null)}
      />
    </div>
  );
}
