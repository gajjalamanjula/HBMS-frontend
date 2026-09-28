import {
  AlertTriangle,
  IndianRupee,
  Loader2,
  RefreshCw,
  ReceiptText,
  WalletCards,
} from 'lucide-react';
import { toast } from 'sonner';
import { openSafeUrl, resolveBackendFileUrl } from '../../../lib/url/safeUrl';
import TenantPaymentTable from '../../../features/tenants/components/TenantPaymentTable';
import {
  useInitiateTenantOnlinePayment,
  useTenantInvoiceDownload,
  useTenantPayments,
} from '../../../features/tenants/hooks/useTenantPayments';
import { formatCurrency } from '../../../features/tenants/utils/tenantMappers';

const PAID_STATUSES = ['SUCCESS', 'PAID', 'COMPLETED'];
const PENDING_STATUSES = ['PENDING', 'DUE', 'UNPAID', 'OVERDUE'];

const isPendingPayment = (payment) =>
  PENDING_STATUSES.includes(String(payment.status || '').toUpperCase());

const isPaidPayment = (payment) =>
  PAID_STATUSES.includes(String(payment.status || '').toUpperCase());

function MetricCard({ title, value, subtitle, icon: Icon, tone = 'blue', loading }) {
  const toneMap = {
    blue: 'bg-blue-50 text-blue-600',
    emerald: 'bg-emerald-50 text-emerald-600',
    amber: 'bg-amber-50 text-amber-600',
    violet: 'bg-violet-50 text-violet-600',
  };

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:-translate-y-0.5 hover:shadow-md">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm text-slate-500">{title}</p>
          <p className="mt-2 truncate text-2xl font-bold tracking-tight text-slate-950">
            {loading ? '...' : value}
          </p>
          <p className="mt-2 text-xs text-slate-500">{subtitle || '-'}</p>
        </div>
        <div
          className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${
            toneMap[tone] || toneMap.blue
          }`}
        >
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}

function ErrorAlert({ title, message, onRetry }) {
  if (!message) return null;

  return (
    <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-medium">{title}</p>
            <p className="mt-1 text-xs">This information is not available right now. Please try again.</p>
          </div>
        </div>
        {onRetry ? (
          <button
            type="button"
            onClick={onRetry}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-rose-200 bg-white px-3 text-xs font-semibold text-rose-700 transition hover:bg-rose-100"
          >
            <RefreshCw className="h-4 w-4" />
            Retry
          </button>
        ) : null}
      </div>
    </div>
  );
}

export default function TenantPaymentsPage() {
  const { tenantId, payments, queries, isLoading, refetchAll } = useTenantPayments();
  const invoiceMutation = useTenantInvoiceDownload();
  const payNowMutation = useInitiateTenantOnlinePayment(tenantId);

  const totalPaid = payments
    .filter(isPaidPayment)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const totalDue = payments
    .filter(isPendingPayment)
    .reduce((sum, payment) => sum + Number(payment.amount || 0), 0);

  const invoiceCount = payments.filter((payment) => payment.invoiceUrl || payment.id).length;

  const handleOpenInvoice = (payment) => {
    const safeInvoiceUrl = resolveBackendFileUrl(payment?.invoiceUrl, { allowHttp: true });

    if (safeInvoiceUrl && openSafeUrl(safeInvoiceUrl, '_blank', { allowHttp: false })) {
      toast.success('Invoice opened successfully');
      return;
    }

    if (payment?.invoiceUrl && !safeInvoiceUrl) {
      toast.error('Invoice is not available right now. Please contact your hostel team.');
      return;
    }

    if (payment?.id) {
      invoiceMutation.mutate(payment.id);
      return;
    }

    toast.error('Invoice is not available for this payment.');
  };

  const handlePayNow = async (payment) => {
    if (!payment?.id) return;

    try {
      const result = await payNowMutation.mutateAsync({
        ...payment,
        amount: payment.payableNow || payment.amountDue || payment.amount,
      });

      const paymentUrl = resolveBackendFileUrl(result?.paymentUrl, { allowHttp: true });
      if (paymentUrl && openSafeUrl(paymentUrl, '_blank', { allowHttp: false })) {
        toast.success('Payment page opened successfully');
      } else {
        toast.info('Payment order created. Payment link is not available right now.');
      }
    } catch {
      // Mutation hook already shows a controlled toast.
    }
  };

  return (
    <div className="p-4 md:p-6 lg:p-8">
      <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-950 md:text-3xl">
            Payments
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            View your payment records and open available invoices.
          </p>
        </div>

        <button
          type="button"
          onClick={refetchAll}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-md"
        >
          <RefreshCw className={`h-4 w-4 ${queries.payments.isFetching ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      <ErrorAlert title="Profile could not be loaded" message={queries.me.error?.message} onRetry={queries.me.refetch} />
      <ErrorAlert title="Payments could not be loaded" message={queries.payments.error?.message} onRetry={queries.payments.refetch} />

      {isLoading ? (
        <div className="mb-6 flex items-center gap-2 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-500 shadow-card">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading payments...
        </div>
      ) : null}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Payment Records"
          value={payments.length}
          subtitle="Available records"
          icon={ReceiptText}
          tone="blue"
          loading={isLoading}
        />
        <MetricCard
          title="Total Paid"
          value={formatCurrency(totalPaid)}
          subtitle="Completed payments"
          icon={WalletCards}
          tone="emerald"
          loading={isLoading}
        />
        <MetricCard
          title="Pending Due"
          value={formatCurrency(totalDue)}
          subtitle="Payments awaiting completion"
          icon={IndianRupee}
          tone="amber"
          loading={isLoading}
        />
        <MetricCard
          title="Invoices"
          value={invoiceCount}
          subtitle="Available invoice actions"
          icon={ReceiptText}
          tone="violet"
          loading={isLoading}
        />
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
        <div className="mb-5">
          <h2 className="text-base font-semibold text-slate-950">Payment History</h2>
          <p className="mt-1 text-xs text-slate-500">
            Payment records for your tenant account.
          </p>
          {queries.payments.isFetching && !isLoading ? (
            <p className="mt-2 inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
              Refreshing payment records
            </p>
          ) : null}
        </div>

        <TenantPaymentTable
          payments={payments}
          onDownloadInvoice={handleOpenInvoice}
          onPayNow={handlePayNow}
          invoiceLoading={invoiceMutation.isPending}
          payNowLoadingId={payNowMutation.isPending ? payNowMutation.variables?.id : ''}
          isLoading={isLoading}
          error={queries.payments.isError ? queries.payments.error : null}
          onRetry={queries.payments.refetch}
        />
      </section>
    </div>
  );
}
