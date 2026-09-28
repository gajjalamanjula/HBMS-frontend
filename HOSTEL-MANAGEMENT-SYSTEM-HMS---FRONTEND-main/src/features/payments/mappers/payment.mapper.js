const toText = (value) => {
  if (value === null || value === undefined) return '';
  return String(value).trim();
};

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== '') ?? '';

const hasValue = (value) => value !== undefined && value !== null && value !== '';

function optionalNumberField(raw, keys) {
  const key = keys.find((item) => hasValue(raw[item]));
  return key ? toNumber(raw[key]) : undefined;
}

export function mapPayment(raw = {}) {
  const source = raw && typeof raw === 'object' ? raw : {};
  const amountDue = optionalNumberField(source, ['amountDue', 'amount_due']);
  const amountPaid = optionalNumberField(source, ['amountPaid', 'amount_paid', 'paidAmount']);
  const payableNow = optionalNumberField(source, ['payableNow', 'payable_now']);
  const payment = {
    id: toText(pickFirst(source.id, source.paymentId)),
    amount: toNumber(pickFirst(source.amount, source.totalAmount, source.total_amount)),
    status: toText(pickFirst(source.status, source.paymentStatus)).toUpperCase() || 'UNKNOWN',
    mode:
      toText(
        pickFirst(source.mode, source.paymentMode, source.payment_method, source.paymentMethod)
      ) || 'UNKNOWN',
    invoiceUrl: toText(
      pickFirst(source.invoiceUrl, source.invoice_url, source.receiptUrl, source.receipt_url)
    ),
    raw: source,
  };

  if (hasValue(source.createdAt) || hasValue(source.created_at)) {
    payment.createdAt = toText(pickFirst(source.createdAt, source.created_at));
  }

  if (amountDue !== undefined) payment.amountDue = amountDue;
  if (amountPaid !== undefined) payment.amountPaid = amountPaid;
  if (payableNow !== undefined) payment.payableNow = payableNow;

  return payment;
}

export function mapPaymentList(rows = []) {
  return Array.isArray(rows) ? rows.map(mapPayment) : [];
}
