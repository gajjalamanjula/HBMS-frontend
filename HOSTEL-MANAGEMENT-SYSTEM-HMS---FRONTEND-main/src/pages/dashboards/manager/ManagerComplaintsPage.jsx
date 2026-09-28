import { useMemo, useState } from 'react';
import { MessageSquareText, Search, UserCog } from 'lucide-react';

import { OwnerConfirmModal } from '../../../features/owner/components/OwnerDashboardUi';
import ManagerComplaintList from '../../../features/manager/components/ManagerComplaintList';
import {
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
  useAssignManagerComplaint,
  useManagerComplaints,
} from '../../../features/manager/hooks/useManagerComplaints';
import { useManagerStaff } from '../../../features/manager/hooks/useManagerStaff';

export default function ManagerComplaintsPage() {
  const [search, setSearch] = useState('');
  const [assigningId, setAssigningId] = useState('');
  const [assignConfirm, setAssignConfirm] = useState(null);
  const complaintsQuery = useManagerComplaints();
  const staffQuery = useManagerStaff();
  const assignMutation = useAssignManagerComplaint();
  const complaints = complaintsQuery.data || [];
  const staff = staffQuery.data || [];

  const filteredComplaints = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return complaints;
    return complaints.filter((complaint) =>
      [complaint.description, complaint.status, complaint.priority, complaint.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [complaints, search]);

  const openCount = complaints.filter((complaint) => String(complaint.status).includes('OPEN')).length;

  const handleAssign = (complaint, staffId) => {
    const staffMember = staff.find((member) => String(member.id) === String(staffId));
    setAssignConfirm({
      record: { complaint, staffId, staffMember },
      title: 'Assign complaint?',
      message: 'Confirm before assigning this complaint to a staff member.',
      details: [
        ['Complaint', complaint.title || complaint.id],
        ['Priority', complaint.priority],
        ['Staff', staffMember?.name || staffId],
      ],
    });
  };

  const confirmAssign = async () => {
    const complaint = assignConfirm?.record?.complaint;
    const staffId = assignConfirm?.record?.staffId;
    if (!complaint?.id || !staffId) return;
    setAssigningId(complaint.id);
    try {
      await assignMutation.mutateAsync({ id: complaint.id, staffId });
      setAssignConfirm(null);
    } catch {
      // toast handled by mutation hook
    } finally {
      setAssigningId('');
    }
  };

  const handleRefresh = () => {
    complaintsQuery.refetch();
    staffQuery.refetch();
  };

  return (
    <div className="space-y-4">
      <ManagerPageHeader
        title="Assigned Complaints"
        eyebrow="Issue Tracking"
        description="Assign complaints to available staff and track their current status."
        actions={
          <ManagerRefreshButton
            isFetching={(complaintsQuery.isFetching || staffQuery.isFetching) && !complaintsQuery.isLoading}
            onRefresh={handleRefresh}
          />
        }
      />

      {complaintsQuery.isError ? (
        <ManagerErrorState title="Complaints could not be loaded" message={complaintsQuery.error?.message} onRetry={complaintsQuery.refetch} />
      ) : null}

      {staffQuery.isError ? (
        <ManagerErrorState title="Staff could not be loaded" message={staffQuery.error?.message} onRetry={staffQuery.refetch} />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ManagerMetricCard title="Assigned Complaints" value={complaints.length} icon={MessageSquareText} loading={complaintsQuery.isLoading} tone="red" />
        <ManagerMetricCard title="Open" value={openCount} icon={Search} tone="amber" loading={complaintsQuery.isLoading} />
        <ManagerMetricCard title="Assignable Staff" value={staff.length} icon={UserCog} tone="green" loading={staffQuery.isLoading} />
      </div>

      <ManagerPanel
        title="Assigned complaints"
        subtitle="Assign a complaint to an available staff member."
        action={<ManagerSearchBox value={search} onChange={setSearch} placeholder="Search complaints" />}
      >
        {complaintsQuery.isLoading || staffQuery.isLoading ? (
          <ManagerLoadingGrid count={3} />
        ) : (
          <ManagerComplaintList
            complaints={filteredComplaints}
            staff={staff}
            onAssign={handleAssign}
            assigningId={assigningId}
          />
        )}
      </ManagerPanel>

      <OwnerConfirmModal
        open={Boolean(assignConfirm)}
        title={assignConfirm?.title}
        message={assignConfirm?.message}
        details={assignConfirm?.details}
        confirmLabel="Assign complaint"
        pending={assignMutation.isPending}
        tone="success"
        onConfirm={confirmAssign}
        onClose={() => setAssignConfirm(null)}
      />
    </div>
  );
}
