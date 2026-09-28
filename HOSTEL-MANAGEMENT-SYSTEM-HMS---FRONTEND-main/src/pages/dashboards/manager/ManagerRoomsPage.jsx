import { useEffect, useMemo, useState } from 'react';
import { BedDouble } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { OwnerConfirmModal } from '../../../features/owner/components/OwnerDashboardUi';
import ManagerCreateRoomPanel from '../../../features/manager/components/ManagerCreateRoomPanel';
import {
  MANAGER_INPUT_CLASS,
  ManagerEmptyBlock,
  ManagerFormInput,
  ManagerMetricCard,
  ManagerPageHeader,
  ManagerPanel,
  ManagerRefreshButton,
  ManagerSearchBox,
  ManagerStatusPill,
} from '../../../features/manager/components/ManagerDashboardUi';
import {
  ManagerErrorState,
  ManagerLoadingGrid,
} from '../../../features/manager/components/ManagerPhase5States';
import ManagerRoomList from '../../../features/manager/components/ManagerRoomList';
import {
  managerAssignBedSchema,
  managerBedStatusSchema,
} from '../../../features/manager/schemas/managerRoom.schema';
import {
  useAssignManagerBed,
  useManagerAvailableBeds,
  useManagerBedStats,
} from '../../../features/manager/hooks/useManagerBeds';
import { useUpdateManagerBedStatus } from '../../../features/manager/hooks/useManagerRooms';
import { useManagerRooms } from '../../../features/manager/hooks/useManagerRooms';
import useManagerTenants from '../../../features/manager/hooks/useManagerTenants';

export default function ManagerRoomsPage() {
  const [search, setSearch] = useState('');
  const roomsQuery = useManagerRooms();
  const bedsQuery = useManagerAvailableBeds();
  const bedStatsQuery = useManagerBedStats();
  const tenantsQuery = useManagerTenants();

  const rooms = roomsQuery.data || [];
  const allBeds = useMemo(() => {
    const bedsFromRooms = rooms.flatMap((room) => Array.isArray(room.beds) ? room.beds : []);
    return bedsFromRooms.length ? bedsFromRooms : bedsQuery.data || [];
  }, [rooms, bedsQuery.data]);

  const filteredRooms = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return rooms;
    return rooms.filter((room) =>
      [room.roomNumber, room.roomType, room.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [rooms, search]);

  const totalBeds = bedStatsQuery.data?.total || rooms.reduce((sum, room) => sum + Number(room.totalBeds || room.beds?.length || 0), 0);
  const occupiedBeds = bedStatsQuery.data?.occupied || allBeds.filter((bed) => String(bed.status).includes('OCCUPIED')).length || 0;
  const availableBeds = bedStatsQuery.data?.available || bedsQuery.data?.length || allBeds.filter((bed) => String(bed.status).includes('AVAILABLE')).length || 0;
  const isLoading = roomsQuery.isLoading || bedsQuery.isLoading || bedStatsQuery.isLoading || tenantsQuery.isLoading;
  const isFetching = roomsQuery.isFetching || bedsQuery.isFetching || bedStatsQuery.isFetching || tenantsQuery.isFetching;

  const handleRefresh = () => {
    roomsQuery.refetch();
    bedsQuery.refetch();
    bedStatsQuery.refetch();
    tenantsQuery.refetch();
  };

  return (
    <div className="space-y-4">
      <ManagerPageHeader
        title="Rooms & Beds"
        eyebrow="Inventory"
        description="Create rooms, review available beds, assign tenants, and update bed status for your branch."
        actions={<ManagerRefreshButton isFetching={isFetching && !isLoading} onRefresh={handleRefresh} />}
      />

      {roomsQuery.isError ? (
        <ManagerErrorState
          title="Rooms could not be loaded"
          message={roomsQuery.error?.message}
          onRetry={handleRefresh}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ManagerMetricCard title="Rooms" value={rooms.length} icon={BedDouble} loading={isLoading} tone="blue" />
        <ManagerMetricCard title="Total Beds" value={totalBeds} icon={BedDouble} loading={isLoading} tone="slate" />
        <ManagerMetricCard title="Occupied" value={occupiedBeds} icon={BedDouble} loading={isLoading} tone="amber" />
        <ManagerMetricCard title="Available" value={availableBeds} icon={BedDouble} loading={isLoading} tone="green" />
      </div>

      <ManagerCreateRoomPanel mode="manager" />

      <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
        <BedAssignmentPanel beds={bedsQuery.data || []} tenants={tenantsQuery.data || []} />
        <BedStatusPanel beds={allBeds} />
      </div>

      <ManagerPanel
        title="Room list"
        subtitle="Rooms for your assigned branch."
        action={<ManagerSearchBox value={search} onChange={setSearch} placeholder="Search rooms" />}
      >
        {isLoading ? (
          <ManagerLoadingGrid count={3} />
        ) : filteredRooms.length ? (
          <ManagerRoomList rooms={filteredRooms} />
        ) : (
          <ManagerEmptyBlock title="No rooms found" message="Create a room to start building bed capacity." />
        )}
      </ManagerPanel>

      <ManagerPanel title="Available beds" subtitle="Beds available for assignment to a tenant.">
        {bedsQuery.isLoading ? (
          <ManagerLoadingGrid count={3} />
        ) : (bedsQuery.data || []).length ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {(bedsQuery.data || []).map((bed) => (
              <article key={bed.id} className="rounded-[16px] border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-bold text-slate-950">Bed {bed.bedNumber}</p>
                    <p className="mt-1 text-[12px] text-slate-500">Room {bed.roomNumber}</p>
                  </div>
                  <ManagerStatusPill status={bed.status} />
                </div>
              </article>
            ))}
          </div>
        ) : (
          <ManagerEmptyBlock title="No available beds" message="Available beds will appear after rooms/beds are created or released." />
        )}
      </ManagerPanel>
    </div>
  );
}

function BedAssignmentPanel({ beds = [], tenants = [] }) {
  const [confirmValues, setConfirmValues] = useState(null);
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const mutation = useAssignManagerBed();
  const form = useForm({
    resolver: zodResolver(managerAssignBedSchema),
    defaultValues: { bedId: '', bedNumber: '', tenantId: '' },
  });

  const selectedBedId = form.watch('bedId');
  const selectedTenantId = form.watch('tenantId');
  const selectedBed = beds.find((bed) => String(bed.id) === String(selectedBedId));
  const eligibleTenants = tenants.filter((tenant) => tenant.active !== false);
  const selectedTenant = eligibleTenants.find((tenant) => String(tenant.id) === String(selectedTenantId));
  const roomOptions = [...new Set(beds.map((bed) => bed.roomNumber).filter(Boolean))];
  const roomBeds = selectedRoomNumber
    ? beds.filter((bed) => String(bed.roomNumber) === String(selectedRoomNumber))
    : [];

  useEffect(() => {
    form.setValue('bedNumber', selectedBed?.bedNumber || '', { shouldValidate: true });
  }, [form, selectedBed]);

  useEffect(() => {
    form.setValue('bedId', '');
    form.setValue('bedNumber', '');
  }, [form, selectedRoomNumber]);

  const openConfirm = (values) => {
    const bed = beds.find((item) => String(item.id) === String(values.bedId));
    setConfirmValues({
      ...values,
      bedNumber: values.bedNumber || bed?.bedNumber || '',
      roomNumber: bed?.roomNumber || '',
      tenantName: selectedTenant?.name || values.tenantId,
    });
  };

  const confirmAssign = async () => {
    if (!confirmValues) return;
    try {
      await mutation.mutateAsync(confirmValues);
      form.reset({ bedId: '', bedNumber: '', tenantId: '' });
      setSelectedRoomNumber('');
      setConfirmValues(null);
    } catch {
      // toast handled by mutation hook
    }
  };

  return (
    <ManagerPanel title="Assign bed" subtitle="Complete each step before confirming the assignment.">
      <form className="grid gap-4" onSubmit={form.handleSubmit(openConfirm)} noValidate>
        <ManagerFormInput label="Step 1: Select room">
          <select
            className={`${MANAGER_INPUT_CLASS} cursor-pointer`}
            value={selectedRoomNumber}
            onChange={(event) => setSelectedRoomNumber(event.target.value)}
          >
            <option value="">Select room</option>
            {roomOptions.map((roomNumber) => (
              <option key={roomNumber} value={roomNumber}>Room {roomNumber}</option>
            ))}
          </select>
        </ManagerFormInput>

        <ManagerFormInput label="Step 2: Select tenant" error={form.formState.errors.tenantId?.message}>
          <select className={`${MANAGER_INPUT_CLASS} cursor-pointer`} {...form.register('tenantId')}>
            <option value="">Select tenant</option>
            {eligibleTenants.map((tenant) => (
              <option key={tenant.id} value={tenant.id}>
                {tenant.name} {tenant.email && tenant.email !== '-' ? `· ${tenant.email}` : ''}
              </option>
            ))}
          </select>
        </ManagerFormInput>

        <ManagerFormInput label="Step 3: Select available bed" error={form.formState.errors.bedId?.message}>
          <select className={`${MANAGER_INPUT_CLASS} cursor-pointer`} {...form.register('bedId')}>
            <option value="">Select available bed</option>
            {roomBeds.map((bed) => (
              <option key={bed.id} value={bed.id}>
                Bed {bed.bedNumber || 'Not available'}
              </option>
            ))}
          </select>
        </ManagerFormInput>

        <input type="hidden" {...form.register('bedNumber')} />

        <button type="submit" disabled={mutation.isPending || !selectedRoomNumber || !roomBeds.length || !eligibleTenants.length} className="h-11 cursor-pointer rounded-[12px] bg-sky-700 px-4 text-[13px] font-bold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60">
          {mutation.isPending ? 'Assigning...' : 'Step 4: Confirm assignment'}
        </button>
      </form>

      <OwnerConfirmModal
        open={Boolean(confirmValues)}
        title="Assign bed?"
        message="Confirm this tenant and bed assignment for the selected room."
        details={[
          ['Bed', confirmValues?.bedNumber],
          ['Room', confirmValues?.roomNumber],
          ['Tenant', confirmValues?.tenantName],
        ]}
        confirmLabel="Assign bed"
        tone="success"
        pending={mutation.isPending}
        onConfirm={confirmAssign}
        onClose={() => setConfirmValues(null)}
      />
    </ManagerPanel>
  );
}

function BedStatusPanel({ beds = [] }) {
  const [confirmValues, setConfirmValues] = useState(null);
  const mutation = useUpdateManagerBedStatus();
  const form = useForm({
    resolver: zodResolver(managerBedStatusSchema),
    defaultValues: { bedId: '', status: 'AVAILABLE' },
  });

  const openConfirm = (values) => {
    const bed = beds.find((item) => String(item.id) === String(values.bedId));
    setConfirmValues({ ...values, bedNumber: bed?.bedNumber || values.bedId, roomNumber: bed?.roomNumber || '' });
  };

  const confirmStatus = async () => {
    if (!confirmValues) return;
    try {
      await mutation.mutateAsync({ id: confirmValues.bedId, status: confirmValues.status });
      form.reset({ bedId: '', status: 'AVAILABLE' });
      setConfirmValues(null);
    } catch {
      // toast handled by mutation hook
    }
  };

  return (
    <ManagerPanel title="Update bed status" subtitle="Choose any bed in your branch and set its current status.">
      <form className="grid gap-4" onSubmit={form.handleSubmit(openConfirm)} noValidate>
        <ManagerFormInput label="Bed" error={form.formState.errors.bedId?.message}>
          <select className={`${MANAGER_INPUT_CLASS} cursor-pointer`} {...form.register('bedId')}>
            <option value="">Select bed</option>
            {beds.map((bed) => (
              <option key={bed.id} value={bed.id}>
                {bed.bedNumber || bed.id} {bed.roomNumber && bed.roomNumber !== '-' ? `• Room ${bed.roomNumber}` : ''} {bed.status ? `• ${bed.status}` : ''}
              </option>
            ))}
          </select>
        </ManagerFormInput>
        <ManagerFormInput label="Status" error={form.formState.errors.status?.message}>
          <select className={`${MANAGER_INPUT_CLASS} cursor-pointer`} {...form.register('status')}>
            <option value="AVAILABLE">Available</option>
            <option value="OCCUPIED">Occupied</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RESERVED">Reserved</option>
          </select>
        </ManagerFormInput>
        <button type="submit" disabled={mutation.isPending || !beds.length} className="h-11 cursor-pointer rounded-[12px] bg-sky-700 px-4 text-[13px] font-bold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60">
          {mutation.isPending ? 'Updating...' : 'Update Status'}
        </button>
      </form>

      <OwnerConfirmModal
        open={Boolean(confirmValues)}
        title="Update bed status?"
        message="Confirm the new operating status for this bed."
        details={[
          ['Bed', confirmValues?.bedNumber],
          ['Room', confirmValues?.roomNumber],
          ['New Status', confirmValues?.status],
        ]}
        confirmLabel="Update status"
        tone="success"
        pending={mutation.isPending}
        onConfirm={confirmStatus}
        onClose={() => setConfirmValues(null)}
      />
    </ManagerPanel>
  );
}
