import { resolveBackendFileUrl, isSafeHttpUrl } from '../../../lib/url/safeUrl';

const EMPTY = '-';

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const toArray = (value) => (Array.isArray(value) ? value : []);

const readResultData = (result, fallback) => {
  if (!result || !result.ok) return fallback;
  return result.data ?? fallback;
};

const readResultError = (result) => {
  if (!result || result.ok) return '';
  return result.error || 'Request failed';
};

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== '') ?? '';

const hasValue = (value) => value !== undefined && value !== null && value !== '';

const optionalNumber = (...values) => {
  const value = pickFirst(...values);
  return hasValue(value) ? toNumber(value) : undefined;
};

export const toSafeTenantFileUrl = (value = '') => resolveBackendFileUrl(value, { allowHttp: true });

export const isSafeTenantHttpUrl = (value = '') => isSafeHttpUrl(value, { allowHttp: true });

const toAbsoluteUrl = toSafeTenantFileUrl;

export const toBoolean = (value, fallback = null) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'active', 'verified'].includes(normalized)) return true;
    if (['false', '0', 'no', 'inactive', 'unverified'].includes(normalized)) return false;
  }
  if (typeof value === 'number') return value === 1;
  return fallback;
};

export const formatCurrency = (value) =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(toNumber(value));

export const formatDate = (value) => {
  if (!value) return EMPTY;

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(date);
};

export const getInitials = (name = '') => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return 'T';

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

export const normalizeTenantUser = (user = {}) => {
  const branch = user.branch || {};

  return {
    id: pickFirst(user.id, user.userId, user.tenantId),
    name: pickFirst(user.name, user.fullName, user.username),
    email: user.email || '',
    phone: user.phone || user.mobile || '',
    role: String(user.role || 'TENANT').toUpperCase(),
    branchId: pickFirst(user.branchId, branch.id, branch.branchId),
    branchName: pickFirst(user.branchName, branch.name),
    active: toBoolean(user.active),
    verified: toBoolean(user.verified),
    kycVerified: toBoolean(user.kycVerified),
    joinedAt: pickFirst(user.joinedAt, user.createdAt, user.checkInDate),
    raw: user,
  };
};

export const normalizePayment = (payment = {}) => {
  const source = payment && typeof payment === 'object' ? payment : {};
  const amountDue = optionalNumber(source.amountDue, source.amount_due);
  const amountPaid = optionalNumber(source.amountPaid, source.amount_paid, source.paidAmount);
  const payableNow = optionalNumber(source.payableNow, source.payable_now);
  const normalized = {
    id: String(pickFirst(source.id, source.paymentId)).trim(),
    amount: toNumber(pickFirst(source.amount, source.totalAmount, source.total_amount)),
    status: String(pickFirst(source.status, source.paymentStatus, 'UNKNOWN')).toUpperCase(),
    mode: String(
      pickFirst(source.mode, source.paymentMode, source.paymentMethod, 'UNKNOWN')
    ).toUpperCase(),
    invoiceUrl: toSafeTenantFileUrl(
      pickFirst(source.invoiceUrl, source.invoice_url, source.receiptUrl, source.receipt_url)
    ),
    raw: source.raw && typeof source.raw === 'object' ? source.raw : source,
  };

  if (hasValue(source.createdAt) || hasValue(source.created_at)) {
    normalized.createdAt = pickFirst(source.createdAt, source.created_at);
  }

  if (amountDue !== undefined) {
    normalized.amountDue = amountDue;
    normalized.dueAmount = amountDue;
  }
  if (amountPaid !== undefined) {
    normalized.amountPaid = amountPaid;
    normalized.paidAmount = amountPaid;
  }
  if (payableNow !== undefined) normalized.payableNow = payableNow;

  return normalized;
};

export const normalizePayments = (payments = []) =>
  toArray(payments)
    .map(normalizePayment)
    .filter((payment) => Boolean(payment.id));

export const normalizeComplaint = (complaint = {}) => ({
  id: pickFirst(complaint.id, complaint.complaintId, complaint.complaintCode),
  description: pickFirst(complaint.description, complaint.message),
  category: pickFirst(complaint.category, complaint.type),
  priority: pickFirst(complaint.priority),
  status: String(pickFirst(complaint.status, 'UNKNOWN')).toUpperCase(),
  createdAt: pickFirst(complaint.createdAt, complaint.createdDate, complaint.timestamp),
  raw: complaint,
});

export const normalizeComplaints = (complaints = []) =>
  toArray(complaints)
    .map(normalizeComplaint)
    .filter((complaint) => Boolean(complaint.id));

export const normalizeKyc = (kyc = {}, user = {}) => {
  const verified = toBoolean(kyc.verified, false) === true || toBoolean(user.kycVerified, false) === true;
  const status = String(
    pickFirst(
      kyc.status,
      kyc.kycStatus,
      kyc.verificationStatus,
      verified ? 'VERIFIED' : ''
    )
  ).toUpperCase();

  const aadhaarUrl = toAbsoluteUrl(pickFirst(kyc.aadhaarUrl, kyc.aadhaarFileUrl));
  const photoUrl = toAbsoluteUrl(pickFirst(kyc.photoUrl, kyc.profilePhotoUrl));

  const aadhaarFileName = pickFirst(kyc.aadhaarFileName, kyc.aadhaarName, aadhaarUrl ? 'Aadhaar document' : '');
  const photoFileName = pickFirst(kyc.photoFileName, kyc.profilePhotoName, photoUrl ? 'Profile photo' : '');

  return {
    id: pickFirst(kyc.id, kyc.kycId, aadhaarUrl || photoUrl ? 'kyc-documents' : ''),
    status: status || 'NOT_UPLOADED',
    verified,
    aadhaarFileName,
    photoFileName,
    aadhaarUrl,
    photoUrl,
    hasAadhaarFile: Boolean(aadhaarUrl || aadhaarFileName || kyc.hasAadhaarFile),
    hasPhotoFile: Boolean(photoUrl || photoFileName || kyc.hasPhotoFile),
    rejectionReason: pickFirst(kyc.rejectionReason, kyc.rejectReason, kyc.reason),
    raw: kyc,
  };
};

export const normalizeFoodMenu = (menu = {}) => {
  const id = pickFirst(menu.id, menu.menuId);
  const title = pickFirst(menu.title, menu.name, 'Food Menu');
  const description = pickFirst(menu.description, menu.note, menu.notes);
  const weekStartDate = pickFirst(menu.weekStartDate, menu.week_start_date, menu.startDate, menu.menuDate);
  const fileUrl = toAbsoluteUrl(pickFirst(menu.fileUrl, menu.menuUrl, menu.url, menu.filePath));

  return {
    id,
    title,
    description,
    weekStartDate,
    fileUrl,
    hasData: Boolean(id || description || weekStartDate || fileUrl),
    raw: menu,
  };
};

const isPendingPayment = (payment) =>
  ['PENDING', 'DUE', 'OVERDUE', 'FAILED', 'UNPAID'].includes(payment.status);

const isPaidPayment = (payment) =>
  ['SUCCESS', 'PAID', 'COMPLETED'].includes(payment.status);

const isOpenComplaint = (complaint) =>
  ['OPEN', 'IN_PROGRESS', 'ESCALATED'].includes(complaint.status);

export function normalizeTenantDashboard(payload = {}) {
  const user = normalizeTenantUser(readResultData(payload.me, {}));
  const payments = normalizePayments(readResultData(payload.payments, []));
  const complaints = normalizeComplaints(readResultData(payload.complaints, []));
  const kyc = normalizeKyc(readResultData(payload.kyc, {}), user);
  const foodMenu = normalizeFoodMenu(readResultData(payload.foodMenu, {}));

  const pendingPayments = payments.filter(isPendingPayment);
  const paidPayments = payments.filter(isPaidPayment);
  const openComplaints = complaints.filter(isOpenComplaint);

  return {
    user,
    payments,
    complaints,
    kyc,
    foodMenu,
    recentPayments: payments.slice(0, 3),
    recentComplaints: complaints.slice(0, 3),

    stats: {
      paymentRecords: payments.length,
      pendingPayments: pendingPayments.length,
      totalDue: pendingPayments.reduce(
        (sum, payment) => sum + toNumber(payment.dueAmount || payment.amount),
        0
      ),
      totalPaid: paidPayments.reduce(
        (sum, payment) => sum + toNumber(payment.paidAmount || payment.amount),
        0
      ),
      openComplaints: openComplaints.length,
      complaintRecords: complaints.length,
      kycStatus: kyc.status,
      currentFoodMenuAvailable: foodMenu.hasData,
    },

    errors: {
      me: readResultError(payload.me),
      payments: readResultError(payload.payments),
      complaints: readResultError(payload.complaints),
      kyc: readResultError(payload.kyc),
      foodMenu: readResultError(payload.foodMenu),
    },
  };
}

export const getKycLabel = (status = '') => {
  const normalized = String(status || '').toUpperCase();

  if (['APPROVED', 'VERIFIED'].includes(normalized)) return 'Verified';
  if (['PENDING', 'SUBMITTED', 'UNDER_REVIEW'].includes(normalized)) return 'Pending';
  if (normalized === 'REJECTED') return 'Rejected';

  return 'Not Uploaded';
};

export const getPaymentStatusTone = (status = '') => {
  const normalized = String(status || '').toUpperCase();

  if (['SUCCESS', 'PAID', 'COMPLETED'].includes(normalized)) {
    return 'bg-emerald-50 text-emerald-700 border-emerald-100';
  }

  if (['PENDING', 'DUE', 'UNPAID'].includes(normalized)) {
    return 'bg-amber-50 text-amber-700 border-amber-100';
  }

  if (['FAILED', 'OVERDUE'].includes(normalized)) {
    return 'bg-rose-50 text-rose-700 border-rose-100';
  }

  return 'bg-slate-100 text-slate-700 border-slate-200';
};
