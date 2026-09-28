import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, Search, Users } from 'lucide-react';

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
import { OwnerConfirmModal } from '../../../features/owner/components/OwnerDashboardUi';
import ManagerTenantList from '../../../features/manager/components/ManagerTenantList';
import {
  useCheckoutTenant,
  useManagerTenants,
} from '../../../features/manager/hooks/useManagerTenants';

export default function ManagerTenantsPage() {
  const [search, setSearch] = useState('');
  const [checkoutId, setCheckoutId] = useState('');
  const [checkoutConfirm, setCheckoutConfirm] = useState(null);
  const tenantsQuery = useManagerTenants();
  const checkoutMutation = useCheckoutTenant();
  const tenants = tenantsQuery.data || [];

  const filteredTenants = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return tenants;
    return tenants.filter((tenant) =>
      [tenant.name, tenant.email, tenant.phone, tenant.id]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(keyword))
    );
  }, [search, tenants]);

  const handleCheckout = (tenant) => {
    setCheckoutConfirm({
      record: tenant,
      title: 'Checkout tenant?',
      message: 'Checkout will end the active stay and may release the assigned bed. Confirm the tenant before continuing.',
      details: [
        ['Tenant', tenant.name],
        ['Email', tenant.email],
        ['Phone', tenant.phone],
      ],
    });
  };

  const confirmCheckout = async () => {
    const tenant = checkoutConfirm?.record;
    if (!tenant?.id) return;
    setCheckoutId(tenant.id);
    try {
      await checkoutMutation.mutateAsync(tenant.id);
      setCheckoutConfirm(null);
    } catch {
      // toast handled by mutation hook
    } finally {
      setCheckoutId('');
    }
  };

  return (
    <div className="space-y-4">
      <ManagerPageHeader
        title="Tenants"
        eyebrow="Residents"
        description="Review current tenants and perform checkout when a tenant leaves."
        actions={
          <>
            <ManagerRefreshButton
              isFetching={tenantsQuery.isFetching && !tenantsQuery.isLoading}
              onRefresh={tenantsQuery.refetch}
            />
            <Link
              to="/manager/create-user"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-[12px] bg-sky-700 px-3 text-[13px] font-bold text-white shadow-[0_12px_26px_rgba(2,132,199,0.22)] transition hover:-translate-y-0.5 hover:bg-sky-800"
            >
              <PlusCircle className="h-4 w-4" />
              Create Tenant
            </Link>
          </>
        }
      />

      {tenantsQuery.isError ? (
        <ManagerErrorState
          title="Tenants could not be loaded"
          message={tenantsQuery.error?.message}
          onRetry={tenantsQuery.refetch}
        />
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <ManagerMetricCard title="Tenants" value={tenants.length} icon={Users} loading={tenantsQuery.isLoading} tone="green" />
        <ManagerMetricCard title="Shown" value={filteredTenants.length} icon={Search} tone="slate" loading={tenantsQuery.isLoading} />
      </div>

      <ManagerPanel
        title="Tenant list"
        subtitle="Current tenants for your branch."
        action={<ManagerSearchBox value={search} onChange={setSearch} placeholder="Search tenants" />}
      >
        {tenantsQuery.isLoading ? (
          <ManagerLoadingGrid count={3} />
        ) : filteredTenants.length ? (
          <ManagerTenantList
            tenants={filteredTenants}
            onCheckout={handleCheckout}
            checkoutId={checkoutId}
          />
        ) : (
          <ManagerEmptyBlock title="No tenants found" message="Create and verify tenants from the Create User page." />
        )}
      </ManagerPanel>

      <OwnerConfirmModal
        open={Boolean(checkoutConfirm)}
        title={checkoutConfirm?.title}
        message={checkoutConfirm?.message}
        details={checkoutConfirm?.details}
        confirmLabel="Checkout tenant"
        tone="danger"
        pending={checkoutMutation.isPending}
        onConfirm={confirmCheckout}
        onClose={() => setCheckoutConfirm(null)}
      />
    </div>
  );
}
