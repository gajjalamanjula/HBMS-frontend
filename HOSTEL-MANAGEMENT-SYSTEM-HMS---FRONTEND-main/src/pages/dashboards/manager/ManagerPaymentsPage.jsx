import { zodResolver } from '@hookform/resolvers/zod';
import { CreditCard, FileText, IndianRupee, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';

import { OwnerConfirmModal } from '../../../features/owner/components/OwnerDashboardUi';
import {
  MANAGER_INPUT_CLASS,
  ManagerEmptyBlock,
  ManagerFormInput,
  ManagerMetricCard,
  ManagerPageHeader,
  ManagerPanel,
  ManagerRefreshButton,
  ManagerStatusPill,
} from '../../../features/manager/components/ManagerDashboardUi';
import {
  ManagerErrorState,
  ManagerLoadingGrid,
} from '../../../features/manager/components/ManagerPhase5States';
import useManagerBranch from '../../../features/manager/hooks/useManagerBranch';
import {
  useLoadManagerInvoice,
  useManagerPaymentDues,
  useManagerPaymentSummary,
  useRecordManagerCashPayment,
} from '../../../features/manager/hooks/useManagerPayments';
import {
  managerCashPaymentSchema,
  managerInvoiceSchema,
} from '../../../features/manager/schemas/managerPayment.schema';

export default function ManagerPaymentsPage() {
  const branchQuery = useManagerBranch();
  const branchId = branchQuery.data?.id || branchQuery.data?.branchId || '';
  const duesQuery = useManagerPaymentDues(branchId);
  const summaryQuery = useManagerPaymentSummary(branchId);
  const cashMutation = useRecordManagerCashPayment();
  const invoiceMutation = useLoadManagerInvoice();
  const dues = duesQuery.data || [];
  const summary = summaryQuery.data || null;

  const handleRefresh = () => {
    branchQuery.refetch();
    if (branchId) {
      duesQuery.refetch();
      summaryQuery.refetch();
    }
  };

  return (
    <div className="space-y-4">
      <ManagerPageHeader
        title="Payments"
        eyebrow="Collection"
        description="Record cash collections and review payment dues for your branch."
        actions={<ManagerRefreshButton isFetching={(branchQuery.isFetching || duesQuery.isFetching || summaryQuery.isFetching) && !duesQuery.isLoading} onRefresh={handleRefresh} />}
      />

      {branchQuery.isError || duesQuery.isError || summaryQuery.isError ? (
        <ManagerErrorState
          title="Payments could not be loaded"
          message={branchQuery.error?.message || duesQuery.error?.message || summaryQuery.error?.message}
          onRetry={handleRefresh}
        />
      ) : null}

      <ManagerPanel title="Assigned branch" subtitle="Payment dues for your assigned branch.">
        {branchQuery.isLoading ? (
          <ManagerLoadingGrid count={1} />
        ) : branchId ? (
          <div className="rounded-[14px] border border-slate-200 bg-slate-50 p-4">
            <p className="text-sm font-black text-slate-950">{branchQuery.data?.hostelName || branchQuery.data?.name || branchQuery.data?.branchName || 'Assigned branch'}</p>
            <p className="mt-1 text-xs text-slate-500">Payment collection workspace</p>
          </div>
        ) : (
          <ManagerEmptyBlock title="No assigned branch" message="An assigned branch is required before payment dues can be viewed." />
        )}
      </ManagerPanel>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <ManagerMetricCard title="Payment Dues" value={dues.length} icon={CreditCard} tone="amber" loading={duesQuery.isLoading} />
        <ManagerMetricCard title="Total Due" value={formatMoney(summary?.totalDue)} icon={IndianRupee} tone="amber" loading={summaryQuery.isLoading} />
        <ManagerMetricCard title="Total Paid" value={formatMoney(summary?.totalPaid)} icon={IndianRupee} tone="green" loading={summaryQuery.isLoading} />
        <ManagerMetricCard title="Pending" value={formatMoney(summary?.totalPending)} icon={Search} tone="amber" loading={summaryQuery.isLoading} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
        <CashPaymentPanel branchId={branchId} dues={dues} mutation={cashMutation} />
        <InvoicePanel mutation={invoiceMutation} />
      </div>

      <ManagerPanel title="Branch payment dues" subtitle="Payment dues for the assigned branch.">
        {!branchId ? (
          <ManagerEmptyBlock title="Assigned branch required" message="An assigned branch is required to load payment dues." />
        ) : duesQuery.isLoading ? (
          <ManagerLoadingGrid count={3} />
        ) : dues.length ? (
          <PaymentDuesTable dues={dues} />
        ) : (
          <ManagerEmptyBlock title="No dues found" message="No payment dues found for this assigned branch." />
        )}
      </ManagerPanel>
    </div>
  );
}

function CashPaymentPanel({ branchId, dues = [], mutation }) {
  const [confirmValues, setConfirmValues] = useState(null);
  const form = useForm({
    resolver: zodResolver(managerCashPaymentSchema),
    defaultValues: { tenantId: '', amount: '' },
  });

  const selectedTenant = useMemo(() => {
    const tenantId = form.watch('tenantId');
    return dues.find((row) => String(row.tenantId) === String(tenantId));
  }, [dues, form]);

  const openConfirm = (values) => {
    setConfirmValues({ ...values, branchId, tenantName: selectedTenant?.tenantName || values.tenantId });
  };

  const confirmPayment = async () => {
    if (!confirmValues) return;
    try {
      await mutation.mutateAsync(confirmValues);
      form.reset({ tenantId: '', amount: '' });
      setConfirmValues(null);
    } catch {
      // toast handled in mutation hook
    }
  };

  return (
    <ManagerPanel title="Record cash payment" subtitle="Select a tenant with dues, enter the amount, and confirm the collection.">
      <form className="grid gap-4" onSubmit={form.handleSubmit(openConfirm)} noValidate>
        <ManagerFormInput label="Tenant" error={form.formState.errors.tenantId?.message}>
          <select className={`${MANAGER_INPUT_CLASS} cursor-pointer`} disabled={!branchId || !dues.length} {...form.register('tenantId')}>
            <option value="">Select tenant from dues</option>
            {dues.map((payment, index) => (
              <option key={payment.tenantId || `${payment.id}-${index}`} value={payment.tenantId}>
                {payment.tenantName} {payment.remainingAmount ? `• Due ${formatMoney(payment.remainingAmount)}` : ''}
              </option>
            ))}
          </select>
        </ManagerFormInput>
        <ManagerFormInput label="Amount" error={form.formState.errors.amount?.message}>
          <input type="number" className={MANAGER_INPUT_CLASS} disabled={!branchId} {...form.register('amount')} />
        </ManagerFormInput>
        <button type="submit" disabled={mutation.isPending || !branchId || !dues.length} className="h-11 rounded-[12px] bg-sky-700 px-4 text-[13px] font-bold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60">
          {mutation.isPending ? 'Recording...' : 'Record Payment'}
        </button>
      </form>

      <OwnerConfirmModal
        open={Boolean(confirmValues)}
        title="Record cash payment?"
        message="Confirm the tenant, amount, and cash payment before saving."
        details={[
          ['Tenant', confirmValues?.tenantName],
          ['Amount', formatMoney(confirmValues?.amount)],
          ['Payment method', 'Cash'],
        ]}
        confirmLabel="Record payment"
        pending={mutation.isPending}
        tone="success"
        onConfirm={confirmPayment}
        onClose={() => setConfirmValues(null)}
      />
    </ManagerPanel>
  );
}

function InvoicePanel({ mutation }) {
  const form = useForm({
    resolver: zodResolver(managerInvoiceSchema),
    defaultValues: { paymentId: '' },
  });

  const onSubmit = async (values) => {
    try {
      await mutation.mutateAsync(values.paymentId);
    } catch {
      // toast handled in mutation hook
    }
  };

  return (
    <ManagerPanel title="Open invoice" subtitle="Enter a payment reference to view its invoice.">
      <form className="grid gap-4" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <ManagerFormInput label="Payment reference" error={form.formState.errors.paymentId?.message}>
          <input className={MANAGER_INPUT_CLASS} {...form.register('paymentId')} />
        </ManagerFormInput>
        <button type="submit" disabled={mutation.isPending} className="inline-flex h-11 items-center justify-center gap-2 rounded-[12px] bg-sky-700 px-4 text-[13px] font-bold text-white transition hover:bg-sky-800 disabled:cursor-not-allowed disabled:opacity-60">
          <FileText className="h-4 w-4" />
          {mutation.isPending ? 'Loading...' : 'Load Invoice'}
        </button>
      </form>
    </ManagerPanel>
  );
}

function PaymentDuesTable({ dues = [] }) {
  return (
    <div className="overflow-hidden rounded-[16px] border border-slate-200 bg-white">
      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50">
            <tr>
              <TableHead>Tenant</TableHead>
              <TableHead>Due</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Remaining</TableHead>
              <TableHead>Status</TableHead>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {dues.map((payment, index) => (
              <tr key={payment.id || `${payment.tenantId}-${index}`} className="hover:bg-slate-50">
                <td className="px-4 py-3">
                  <p className="font-bold text-slate-950">{payment.tenantName}</p>
                  <p className="break-all text-xs text-slate-500">{payment.tenantId || 'Not available'}</p>
                </td>
                <td className="px-4 py-3 text-slate-700">{formatMoney(payment.amountDue)}</td>
                <td className="px-4 py-3 text-slate-700">{formatMoney(payment.amountPaid)}</td>
                <td className="px-4 py-3 text-slate-700">{formatMoney(payment.remainingAmount)}</td>
                <td className="px-4 py-3"><ManagerStatusPill status={payment.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid gap-3 p-3 md:hidden">
        {dues.map((payment, index) => (
          <article key={payment.id || `${payment.tenantId}-${index}`} className="rounded-[14px] border border-slate-200 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="font-bold text-slate-950">{payment.tenantName}</p>
                <p className="text-[12px] text-slate-500">Remaining: {formatMoney(payment.remainingAmount)}</p>
              </div>
              <ManagerStatusPill status={payment.status} />
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function TableHead({ children }) {
  return <th className="px-4 py-3 text-left text-xs font-bold uppercase tracking-wide text-slate-500">{children}</th>;
}

function formatMoney(value) {
  const number = Number(value || 0);
  return `₹${number.toLocaleString('en-IN')}`;
}
