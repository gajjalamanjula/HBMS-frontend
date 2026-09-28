import { Download, ReceiptText, WalletCards } from 'lucide-react';
import VirtualizedDataTable from '../../../components/ui/VirtualizedDataTable';
import { formatCurrency, getPaymentStatusTone } from '../utils/tenantMappers';

const PENDING_STATUSES = ['PENDING', 'DUE', 'UNPAID', 'OVERDUE', 'FAILED'];

function StatusBadge({ status }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getPaymentStatusTone(
        status
      )}`}
    >
      {String(status || 'UNKNOWN').replace('_', ' ')}
    </span>
  );
}

const canOpenInvoice = (payment = {}) => Boolean(payment.invoiceUrl || payment.id);
const canPayNow = (payment = {}) =>
  Boolean(payment.id) && PENDING_STATUSES.includes(String(payment.status || '').toUpperCase());

export default function TenantPaymentTable({
  payments = [],
  onDownloadInvoice,
  onPayNow,
  invoiceLoading = false,
  payNowLoadingId = '',
  isLoading = false,
  error = null,
  onRetry,
}) {
  const invoiceButton = (payment) => (
    <button
      type="button"
      disabled={invoiceLoading || !canOpenInvoice(payment)}
      onClick={() => onDownloadInvoice?.(payment)}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-3 text-xs font-semibold text-blue-700 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
      title={canOpenInvoice(payment) ? 'Open invoice' : 'Invoice unavailable'}
    >
      <Download className="h-4 w-4" />
      Invoice
    </button>
  );

  const payButton = (payment) => (
    <button
      type="button"
      disabled={!canPayNow(payment) || payNowLoadingId === payment.id}
      onClick={() => onPayNow?.(payment)}
      className="inline-flex h-9 items-center justify-center gap-2 rounded-lg bg-blue-600 px-3 text-xs font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
      title={canPayNow(payment) ? 'Pay this pending due online' : 'Online payment is available only for pending dues'}
    >
      <WalletCards className="h-4 w-4" />
      {payNowLoadingId === payment.id ? 'Opening...' : 'Pay Now'}
    </button>
  );

  return (
    <VirtualizedDataTable
      data={payments}
      isLoading={isLoading}
      error={error}
      onRetry={onRetry}
      emptyMessage="Your payment records will appear here once payments are created or collected by your hostel team."
      getRowKey={(payment, index) => payment.id || payment.invoiceUrl || index}
      rowHeight={76}
      maxHeight={620}
      minWidth={860}
      gridTemplateColumns="minmax(220px,1.4fr) minmax(130px,.8fr) minmax(120px,.7fr) minmax(120px,.7fr) minmax(220px,1fr)"
      columns={[
        {
          id: 'paymentId',
          header: 'Payment ID',
          cell: (payment) => (
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <ReceiptText className="h-4 w-4" />
              </div>
              <span className="truncate font-semibold text-slate-950">
                {payment.id || '-'}
              </span>
            </div>
          ),
        },
        {
          id: 'amount',
          header: 'Amount',
          className: 'font-semibold text-slate-950',
          cell: (payment) => formatCurrency(payment.amount),
        },
        {
          id: 'mode',
          header: 'Mode',
          className: 'text-slate-700',
          cell: (payment) => payment.mode || 'UNKNOWN',
        },
        {
          id: 'status',
          header: 'Status',
          cell: (payment) => <StatusBadge status={payment.status} />,
        },
        {
          id: 'actions',
          header: 'Actions',
          headerClassName: 'text-right',
          className: 'flex justify-end gap-2',
          cell: (payment) => (
            <>
              {payButton(payment)}
              {invoiceButton(payment)}
            </>
          ),
        },
      ]}
      renderMobileCard={(payment) => (
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-card transition-all hover:shadow-md">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <p className="text-[11px] text-slate-500">Payment ID</p>
              <h3 className="mt-1 truncate text-sm font-bold text-slate-950">
                {payment.id || '-'}
              </h3>
            </div>
            <StatusBadge status={payment.status} />
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Amount</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {formatCurrency(payment.amount)}
              </p>
            </div>
            <div className="rounded-xl bg-slate-50 p-3">
              <p className="text-[11px] text-slate-500">Mode</p>
              <p className="mt-1 text-sm font-semibold text-slate-950">
                {payment.mode || 'UNKNOWN'}
              </p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {payButton(payment)}
            {invoiceButton(payment)}
          </div>
        </article>
      )}
    />
  );
}
