import { isSafeFileUrl, resolveBackendFileUrl } from '../../../lib/url/safeUrl';

const EMPTY = '-';

const pickFirst = (...values) =>
  values.find((value) => value !== undefined && value !== null && value !== '') ?? '';

const toArray = (value) => (Array.isArray(value) ? value : []);

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

export const toStaffBoolean = (value, fallback = null) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'active', 'verified'].includes(normalized)) return true;
    if (['false', '0', 'no', 'inactive', 'unverified'].includes(normalized)) return false;
  }
  if (typeof value === 'number') return value === 1;
  return fallback;
};

export const isSafeStaffFileUrl = (value = '') => isSafeFileUrl(value, { allowBlob: false, allowHttp: false });

export const toAbsoluteStaffUrl = (value = '') => resolveBackendFileUrl(value, { allowBlob: false, allowHttp: false });


export const formatStaffDate = (value) => {
  if (!value) return EMPTY;

  const numericValue = Number(value);
  const date = Number.isFinite(numericValue) && String(value).length >= 10
    ? new Date(numericValue)
    : new Date(value);

  if (Number.isNaN(date.getTime())) return String(value);

  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
  }).format(date);
};


export const getStaffInitials = (name = '') => {
  const parts = String(name || '')
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (!parts.length) return 'S';

  return parts
    .slice(0, 2)
    .map((part) => part.charAt(0).toUpperCase())
    .join('');
};

export const normalizeStaffUser = (user = {}) => {
  const branch = user.branch || {};

  return {
    id: pickFirst(user.id, user.userId, user.staffId, user.uuid),
    name: pickFirst(user.name, user.fullName, user.username),
    email: user.email || '',
    phone: pickFirst(user.phone, user.mobile, user.phoneNumber),
    role: String(user.role || 'STAFF').toUpperCase(),
    branchId: pickFirst(user.branchId, branch.id, branch.branchId),
    branchName: pickFirst(user.branchName, branch.name, branch.hostelName, branch.location),
    active: toStaffBoolean(user.active, null),
    verified: toStaffBoolean(user.verified, null),
    joinedAt: pickFirst(user.joinedAt, user.createdAt, user.createdDate),
    raw: user,
  };
};

export const normalizeStaffComplaint = (complaint = {}) => ({
  id: pickFirst(complaint.id, complaint.complaintId, complaint.complaintCode),
  category: pickFirst(complaint.category, complaint.type, 'General'),
  priority: String(pickFirst(complaint.priority, 'MEDIUM')).toUpperCase(),
  description: pickFirst(complaint.description, complaint.message),
  status: String(pickFirst(complaint.status, 'UNKNOWN')).toUpperCase(),
  branchId: pickFirst(complaint.branchId, complaint.branch_id),
  raisedBy: pickFirst(complaint.raisedBy, complaint.raisedById, complaint.tenantId, complaint.userId),
  assignedTo: pickFirst(
    complaint.assignedTo,
    complaint.assigned_to,
    complaint.assignedStaffId,
    complaint.staffId,
    complaint.assigneeId,
    complaint.assignedUser?.id
  ),
  tenantName: pickFirst(complaint.tenantName, complaint.raisedByName, complaint.userName, complaint.name),
  resolutionNote: pickFirst(complaint.resolutionNote, complaint.resolution_note),
  createdAt: pickFirst(complaint.createdAt, complaint.created_at, complaint.createdDate),
  updatedAt: pickFirst(complaint.updatedAt, complaint.updated_at, complaint.updatedDate),
  resolvedAt: pickFirst(complaint.resolvedAt, complaint.resolved_at),
  escalated: complaint.escalated === true,
  raw: complaint,
});

export const normalizeStaffComplaints = (rows = []) =>
  toArray(rows)
    .map(normalizeStaffComplaint)
    .filter((complaint) => Boolean(complaint.id));

export const filterAssignedStaffComplaints = (complaints = [], staffId = '') => {
  const currentStaffId = String(staffId || '').trim();

  if (!currentStaffId) return [];

  return complaints.filter(
    (complaint) => String(complaint.assignedTo || '').trim() === currentStaffId
  );
};

export const normalizeStaffFoodMenu = (menu = {}) => {
  const id = pickFirst(menu.id, menu.menuId);
  const fileUrl = toAbsoluteStaffUrl(pickFirst(menu.fileUrl, menu.menuUrl, menu.url, menu.filePath));

  return {
    id,
    title: pickFirst(menu.title, menu.name, 'Food Menu'),
    description: pickFirst(menu.description, menu.note, menu.notes),
    weekStartDate: pickFirst(menu.weekStartDate, menu.week_start_date, menu.startDate, menu.menuDate),
    fileUrl,
    hasData: Boolean(id || fileUrl || menu.weekStartDate || menu.description),
    raw: menu,
  };
};

export const normalizeStaffFoodMenuHistory = (rows = []) =>
  toArray(rows)
    .map(normalizeStaffFoodMenu)
    .filter((menu) => menu.hasData);

export const normalizeStaffKyc = (kyc = {}, user = {}) => {
  const verified = toStaffBoolean(kyc.verified, false) || toStaffBoolean(user.kycVerified, false);
  const status = String(
    pickFirst(kyc.status, kyc.kycStatus, kyc.verificationStatus, verified ? 'VERIFIED' : '')
  ).toUpperCase();

  const aadhaarUrl = toAbsoluteStaffUrl(pickFirst(kyc.aadhaarUrl, kyc.aadhaarFileUrl));
  const photoUrl = toAbsoluteStaffUrl(pickFirst(kyc.photoUrl, kyc.profilePhotoUrl));

  return {
    id: pickFirst(kyc.id, kyc.kycId, aadhaarUrl || photoUrl ? 'kyc-documents' : ''),
    status: status || 'NOT_UPLOADED',
    verified,
    aadhaarFileName: pickFirst(kyc.aadhaarFileName, kyc.aadhaarName, aadhaarUrl ? 'Aadhaar document' : ''),
    photoFileName: pickFirst(kyc.photoFileName, kyc.profilePhotoName, photoUrl ? 'Profile photo' : ''),
    aadhaarUrl,
    photoUrl,
    rejectionReason: pickFirst(kyc.rejectionReason, kyc.rejectReason, kyc.remarks, kyc.note),
    raw: kyc,
  };
};

export const getStaffStatusTone = (status = '') => {
  const normalized = String(status || '').toUpperCase();

  if (['RESOLVED', 'CLOSED', 'VERIFIED', 'APPROVED'].includes(normalized)) {
    return 'border-emerald-100 bg-emerald-50 text-emerald-700';
  }

  if (normalized === 'IN_PROGRESS') {
    return 'border-sky-100 bg-sky-50 text-sky-700';
  }

  if (['OPEN', 'PENDING', 'SUBMITTED', 'UNDER_REVIEW'].includes(normalized)) {
    return 'border-amber-100 bg-amber-50 text-amber-700';
  }

  if (['ESCALATED', 'REJECTED', 'FAILED'].includes(normalized)) {
    return 'border-rose-100 bg-rose-50 text-rose-700';
  }

  return 'border-sky-100 bg-sky-50 text-sky-700';
};

export const getStaffPriorityTone = (priority = '') => {
  const normalized = String(priority || '').toUpperCase();

  if (normalized === 'HIGH') return 'border-rose-100 bg-rose-50 text-rose-700';
  if (normalized === 'MEDIUM') return 'border-amber-100 bg-amber-50 text-amber-700';
  return 'border-slate-200 bg-slate-50 text-slate-700';
};

export const countByStatus = (rows = []) =>
  rows.reduce((acc, item) => {
    const key = String(item.status || 'UNKNOWN').toUpperCase();
    acc[key] = toNumber(acc[key]) + 1;
    return acc;
  }, {});
