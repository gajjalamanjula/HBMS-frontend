import { resolveBackendFileUrl } from '../../../lib/url/safeUrl';
import { formatDate, formatDateTime as formatDateTimeValue } from '../../../utils/date';

export const EMPTY_VALUE = '—';

const DASHBOARD_FIELDS = [
  'totalUsers',
  'totalOwners',
  'totalManagers',
  'totalStaff',
  'totalTenants',
  'totalBranches',
];

export const ROLE_OPTIONS = [
  { label: 'All roles', value: '' },
  { label: 'Super Admin', value: 'SUPER_ADMIN' },
  { label: 'Owner', value: 'OWNER' },
  { label: 'Manager', value: 'MANAGER' },
  { label: 'Staff', value: 'STAFF' },
  { label: 'Tenant', value: 'TENANT' },
];

export const STATUS_OPTIONS = [
  { label: 'All statuses', value: '' },
  { label: 'Active', value: 'true' },
  { label: 'Inactive', value: 'false' },
];

export const PAGE_SIZE_OPTIONS = [10, 20, 50];

export function unwrapResponse(raw) {
  if (!raw || typeof raw !== 'object') return raw;
  if ('success' in raw && 'data' in raw) return raw.data;
  return raw.data ?? raw.payload ?? raw.result ?? raw;
}

export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

export function toNumber(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', 'active', 'enabled', 'yes', '1'].includes(normalized)) return true;
    if (['false', 'inactive', 'disabled', 'no', '0'].includes(normalized)) return false;
  }
  if (typeof value === 'number') return value === 1;
  return fallback;
}

export function maskAadhaarNumber(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length < 4) return EMPTY_VALUE;
  return `xxxx-xxxx-${digits.slice(-4)}`;
}

export function displayValue(value) {
  if (value === null || value === undefined || value === '') return EMPTY_VALUE;
  return String(value);
}

export function formatDisplayDate(value) {
  const formatted = formatDate(value);
  return formatted === '-' ? EMPTY_VALUE : formatted;
}

export function formatDisplayDateTime(value) {
  const formatted = formatDateTimeValue(value);
  return formatted === '-' ? EMPTY_VALUE : formatted;
}

export function normalizeDashboardResponse(raw) {
  const data = unwrapResponse(raw);
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};

  return DASHBOARD_FIELDS.reduce((stats, field) => {
    stats[field] = toNumber(source[field], 0);
    return stats;
  }, {});
}

export function normalizeOwner(raw) {
  const data = unwrapResponse(raw);
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  const id = source.id ?? source.userId ?? source.ownerId ?? source.uuid ?? '';
  const name =
    source.name ??
    source.fullName ??
    source.ownerName ??
    [source.firstName, source.lastName].filter(Boolean).join(' ');

  return {
    id: String(id || ''),
    name: displayValue(name),
    email: displayValue(source.email ?? source.ownerEmail),
    phone: displayValue(source.phone ?? source.mobile ?? source.phoneNumber),
    role: displayValue(source.role ?? 'OWNER'),
    active: toBoolean(source.active ?? source.enabled ?? source.status, true),
    verified: toBoolean(source.verified ?? source.emailVerified ?? source.otpVerified, false),
    kycVerified: toBoolean(source.kycVerified ?? source.kycStatus, false),
    aadhaarNumber: source.aadhaarNumber ?? source.aadharNumber ?? '',
    branchId: source.branchId ?? source.branch?.id ?? '',
    branchName: source.branchName ?? source.branch?.hostelName ?? source.branch?.name ?? '',
    createdAt: source.createdAt ?? source.createdDate ?? source.createdOn ?? source.created_at ?? source.createdTime ?? source.timestamp ?? source.updatedAt ?? source.updatedDate ?? '',
    updatedAt: source.updatedAt ?? source.updatedDate ?? source.updated_at ?? '',
    raw: source,
  };
}

export function normalizeUser(raw) {
  const data = unwrapResponse(raw);
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  const id = source.id ?? source.userId ?? source.uuid ?? '';
  const name =
    source.name ??
    source.fullName ??
    [source.firstName, source.lastName].filter(Boolean).join(' ');

  return {
    id: String(id || ''),
    name: displayValue(name),
    email: displayValue(source.email),
    phone: displayValue(source.phone ?? source.mobile ?? source.phoneNumber),
    role: displayValue(source.role),
    active: toBoolean(source.active ?? source.enabled ?? source.status, true),
    verified: toBoolean(source.verified ?? source.emailVerified ?? source.otpVerified, false),
    kycVerified: toBoolean(source.kycVerified ?? source.kycStatus, false),
    branchId: source.branchId ?? source.branch?.id ?? '',
    branchName: source.branchName ?? source.branch?.hostelName ?? source.branch?.name ?? '',
    createdAt: source.createdAt ?? source.createdDate ?? source.createdOn ?? source.created_at ?? source.createdTime ?? source.timestamp ?? source.updatedAt ?? source.updatedDate ?? '',
    updatedAt: source.updatedAt ?? source.updatedDate ?? source.updated_at ?? '',
    raw: source,
  };
}

export function normalizePageResponse(raw, itemMapper = (item) => item) {
  const data = unwrapResponse(raw);
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  const contentSource = Array.isArray(data)
    ? data
    : source.content ?? source.items ?? source.data ?? source.results ?? [];
  const content = Array.isArray(contentSource) ? contentSource.map(itemMapper) : [];
  const size = toNumber(source.size ?? source.pageSize ?? source.pageable?.pageSize, content.length || 10);
  const number = toNumber(source.number ?? source.page ?? source.pageable?.pageNumber, 0);
  const totalElements = toNumber(
    source.totalElements ?? source.totalItems ?? source.total ?? content.length,
    content.length
  );
  const totalPages = toNumber(
    source.totalPages ?? Math.ceil(totalElements / Math.max(size, 1)),
    totalElements > 0 ? Math.ceil(totalElements / Math.max(size, 1)) : 0
  );

  return {
    content,
    totalElements,
    totalPages,
    number,
    size,
    first: source.first ?? number <= 0,
    last: source.last ?? (totalPages === 0 ? true : number + 1 >= totalPages),
    raw: source,
  };
}

export function resolveSuperAdminImageUrl(value) {
  return resolveBackendFileUrl(String(value || '').trim(), { allowBlob: false, allowHttp: false });
}

export function normalizeBranch(raw) {
  const data = unwrapResponse(raw);
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  const id = source.id ?? source.branchId ?? source.uuid ?? '';
  const name = source.hostelName ?? source.name ?? source.branchName ?? source.title;
  const location = source.location ?? source.area ?? source.city ?? '';
  const city = source.city ?? '';
  const state = source.state ?? '';
  const address = source.fullAddress ?? source.address ?? [source.colony, source.roadNo, source.landmark]
    .filter(Boolean)
    .join(', ');

  return {
    id: String(id || ''),
    name: displayValue(name),
    code: source.code ?? source.branchCode ?? '',
    address,
    city,
    state,
    area: source.area ?? '',
    location,
    imageUrl: resolveSuperAdminImageUrl(source.imageUrl ?? source.image ?? source.photoUrl),
    hostelType: source.hostelType ?? source.type ?? '',
    monthlyRent: toNumber(source.monthlyRent, 0),
    bookingAdvance: toNumber(source.bookingAdvance, 0),
    totalFloors: toNumber(source.totalFloors, 0),
    amenities: source.amenities ?? '',
    managerName: source.managerName ?? '',
    managerPhone: source.managerPhone ?? '',
    ownerId: source.ownerId ?? source.owner?.id ?? '',
    ownerName: source.ownerName ?? source.owner?.name ?? source.ownerFullName ?? '',
    ownerEmail: source.ownerEmail ?? source.owner?.email ?? '',
    createdAt: source.createdAt ?? source.createdDate ?? source.createdOn ?? source.created_at ?? source.createdTime ?? source.timestamp ?? source.updatedAt ?? source.updatedDate ?? '',
    updatedAt: source.updatedAt ?? source.updatedDate ?? source.updated_at ?? '',
    raw: source,
  };
}

export function normalizeHealth(raw) {
  const data = unwrapResponse(raw);
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};

  return {
    status: displayValue(source.status),
    timestamp: source.timestamp ?? '',
    database: displayValue(source.database),
    raw: {
      status: source.status ?? null,
      timestamp: source.timestamp ?? null,
      database: source.database ?? null,
    },
  };
}

export function normalizeAuditLog(raw) {
  const data = unwrapResponse(raw);
  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  const id = source.id ?? source.auditLogId ?? source.uuid ?? '';

  return {
    id: String(id || ''),
    action: displayValue(source.action ?? source.eventType),
    entityName: displayValue(source.entityName ?? source.entity ?? source.resource),
    entityId: source.entityId ?? source.resourceId ?? '',
    performedBy: displayValue(source.performedBy ?? source.userEmail ?? source.username ?? source.actor),
    role: source.role ?? source.performedByRole ?? '',
    description: displayValue(source.description ?? source.message ?? source.details),
    createdAt: source.createdAt ?? source.timestamp ?? source.createdDate ?? '',
    raw: source,
  };
}

export function getFirstFile(value) {
  if (!value) return null;
  if (typeof File !== 'undefined' && value instanceof File) return value;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return value;
  if (Array.isArray(value)) return value[0] || null;
  if (typeof FileList !== 'undefined' && value instanceof FileList) return value[0] || null;
  return null;
}

export function buildCreateOwnerFormData(values = {}) {
  const formData = new FormData();
  const entries = {
    name: values.name,
    email: values.email,
    phone: values.phone,
    aadhaarNumber: values.aadhaarNumber,
    branchId: values.branchId,
  };

  Object.entries(entries).forEach(([key, value]) => {
    const normalized = typeof value === 'string' ? value.trim() : value;
    if (normalized !== undefined && normalized !== null && normalized !== '') {
      formData.append(key, normalized);
    }
  });

  const file = getFirstFile(values.aadhaarPhoto);
  if (file) formData.append('aadhaarPhoto', file);

  return formData;
}

export function buildOwnerUpdatePayload(values = {}) {
  return cleanParams({
    name: values.name?.trim(),
    phone: values.phone?.trim(),
  });
}

export function getBranchLocationLabel(branch = {}) {
  const parts = [branch.location, branch.area, branch.city, branch.state].filter(
    (value) => value && value !== EMPTY_VALUE
  );
  return parts.length ? parts.join(', ') : EMPTY_VALUE;
}

export function getRoleMix(users = []) {
  return users.reduce((acc, user) => {
    const role = user.role && user.role !== EMPTY_VALUE ? user.role : 'UNKNOWN';
    acc[role] = (acc[role] || 0) + 1;
    return acc;
  }, {});
}

export function getDisplayName(record = {}) {
  return record.name && record.name !== EMPTY_VALUE ? record.name : record.email;
}
