import { unwrapList, unwrapMessage, unwrapObject } from '../../../lib/api/normalizeResponse';

export const MANAGER_EMPTY_VALUE = '-';

export function toManagerText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function managerDisplay(value) {
  const text = toManagerText(value);
  return text || MANAGER_EMPTY_VALUE;
}

export function toManagerNumber(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toManagerBoolean(value, fallback = null) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (['true', '1', 'yes', 'y', 'active'].includes(normalized)) return true;
    if (['false', '0', 'no', 'n', 'inactive'].includes(normalized)) return false;
  }
  if (typeof value === 'number') return value === 1;
  return fallback;
}

export function maskManagerAadhaar(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length < 4) return MANAGER_EMPTY_VALUE;
  return `xxxx-xxxx-${digits.slice(-4)}`;
}

function normalizeStatus(value) {
  return managerDisplay(value).toUpperCase();
}

export function normalizeManagerDashboard(raw) {
  const source = unwrapObject(raw);
  return {
    staffCount: toManagerNumber(source.staffCount ?? source.staff),
    tenantCount: toManagerNumber(source.tenantCount ?? source.tenants),
    totalBeds: toManagerNumber(source.totalBeds ?? source.total),
    occupiedBeds: toManagerNumber(source.occupiedBeds ?? source.occupied),
    availableBeds: toManagerNumber(source.availableBeds ?? source.available),
    complaints: toManagerNumber(source.complaints ?? source.complaintCount),
    raw: source,
  };
}

export function normalizeManagerCounts(raw) {
  const source = unwrapObject(raw);
  return {
    staff: toManagerNumber(source.staff ?? source.staffCount),
    tenants: toManagerNumber(source.tenants ?? source.tenantCount),
    raw: source,
  };
}

export function normalizeManagerStaff(raw = {}) {
  const source = unwrapObject(raw);
  const id = source.id ?? source.userId ?? source.staffId ?? source.uuid ?? '';
  return {
    id: toManagerText(id),
    name: managerDisplay(source.name ?? source.fullName),
    email: managerDisplay(source.email),
    phone: managerDisplay(source.phone ?? source.mobile ?? source.phoneNumber),
    aadhaarNumber: maskManagerAadhaar(source.aadhaarNumber ?? source.aadhaar),
    branchId: toManagerText(source.branchId ?? source.branch?.id),
    branchName: managerDisplay(source.branchName ?? source.branch?.name ?? source.branch?.hostelName),
    role: managerDisplay(source.role ?? 'STAFF'),
    active: toManagerBoolean(source.active, null),
    raw: source,
  };
}

export function normalizeManagerStaffList(raw) {
  return unwrapList(raw).map(normalizeManagerStaff).filter((staff) => staff.id);
}

export function normalizeManagerTenant(raw = {}) {
  const source = unwrapObject(raw);
  const id = source.id ?? source.userId ?? source.tenantId ?? source.uuid ?? '';
  return {
    id: toManagerText(id),
    name: managerDisplay(source.name ?? source.fullName),
    email: managerDisplay(source.email),
    phone: managerDisplay(source.phone ?? source.mobile ?? source.phoneNumber),
    aadhaarNumber: maskManagerAadhaar(source.aadhaarNumber ?? source.aadhaar),
    role: managerDisplay(source.role ?? 'TENANT'),
    branchId: toManagerText(source.branchId ?? source.branch?.id),
    branchName: managerDisplay(source.branchName ?? source.branch?.name ?? source.branch?.hostelName),
    active: toManagerBoolean(source.active, null),
    raw: source,
  };
}

export function normalizeManagerTenants(raw) {
  return unwrapList(raw).map(normalizeManagerTenant).filter((tenant) => tenant.id);
}

export function normalizeManagerBedStatus(raw = {}) {
  const source = unwrapObject(raw);
  const room = unwrapObject(source.room);
  const tenant = unwrapObject(source.tenant);
  const id = source.id ?? source.bedId ?? source.uuid ?? '';
  return {
    id: toManagerText(id),
    roomId: toManagerText(source.roomId ?? room.id ?? room.roomId),
    roomNumber: managerDisplay(source.roomNumber ?? room.roomNumber ?? room.name ?? source.roomId ?? room.id),
    bedNumber: managerDisplay(source.bedNumber ?? source.number ?? source.name ?? (id ? String(id).slice(0, 8) : '')),
    status: normalizeStatus(source.status),
    tenantId: toManagerText(source.tenantId ?? tenant.id),
    tenantName: managerDisplay(source.tenantName ?? tenant.name),
    raw: source,
  };
}

export function normalizeManagerBedList(raw) {
  return unwrapList(raw).map(normalizeManagerBedStatus).filter((bed) => bed.id);
}

export function normalizeManagerBedStats(raw = {}) {
  const source = unwrapObject(raw);
  return {
    total: toManagerNumber(source.total ?? source.totalBeds, 0),
    occupied: toManagerNumber(source.occupied ?? source.occupiedBeds, 0),
    available: toManagerNumber(source.available ?? source.availableBeds, 0),
    maintenance: toManagerNumber(source.maintenance ?? source.maintenanceBeds, 0),
    reserved: toManagerNumber(source.reserved ?? source.reservedBeds, 0),
    raw: source,
  };
}

export function normalizeManagerRoom(raw = {}) {
  const source = unwrapObject(raw);
  const id = source.id ?? source.roomId ?? source.uuid ?? '';
  const beds = Array.isArray(source.beds)
    ? source.beds.map(normalizeManagerBedStatus).filter((bed) => bed.id)
    : [];

  return {
    id: toManagerText(id),
    roomNumber: managerDisplay(source.roomNumber ?? source.number ?? source.name),
    roomType: managerDisplay(source.roomType ?? source.type),
    totalBeds: toManagerNumber(source.totalBeds ?? source.bedCount),
    available: toManagerNumber(source.available),
    occupied: toManagerNumber(source.occupied),
    maintenance: toManagerNumber(source.maintenance),
    floor: toManagerNumber(source.floor),
    imageUrl: toManagerText(source.imageUrl ?? source.image_url),
    beds,
    raw: source,
  };
}

export function normalizeManagerRooms(raw) {
  return unwrapList(raw).map(normalizeManagerRoom).filter((room) => room.id);
}

export function normalizeManagerComplaint(raw = {}) {
  const source = unwrapObject(raw);
  const id = source.id ?? source.complaintId ?? source.uuid ?? '';
  return {
    id: toManagerText(id),
    title: managerDisplay(source.title ?? source.subject ?? source.category),
    category: managerDisplay(source.category),
    priority: normalizeStatus(source.priority),
    description: managerDisplay(source.description ?? source.message),
    status: normalizeStatus(source.status),
    branchId: toManagerText(source.branchId ?? source.branch?.id),
    branchName: managerDisplay(source.branchName ?? source.branch?.name ?? source.branch?.hostelName),
    raisedBy: managerDisplay(source.raisedBy ?? source.tenantName ?? source.userName),
    assignedTo: toManagerText(source.assignedTo ?? source.assignedStaffId),
    resolutionNote: toManagerText(source.resolutionNote),
    createdAt: toManagerText(source.createdAt ?? source.createdDate),
    raw: source,
  };
}

export function normalizeManagerComplaints(raw) {
  return unwrapList(raw).map(normalizeManagerComplaint).filter((complaint) => complaint.id);
}

export function normalizeManagerFoodMenu(raw = {}) {
  const source = unwrapObject(raw);
  const id = source.id ?? source.menuId ?? source.uuid ?? '';
  return {
    id: toManagerText(id),
    fileUrl: toManagerText(source.fileUrl ?? source.url ?? source.menuUrl),
    uploadedBy: toManagerText(source.uploadedBy),
    weekStartDate: toManagerText(source.weekStartDate ?? source.week_start_date),
    createdAt: toManagerText(source.createdAt),
    raw: source,
  };
}

export function normalizeManagerFoodMenuHistory(raw) {
  return unwrapList(raw).map(normalizeManagerFoodMenu).filter((menu) => menu.id || menu.fileUrl);
}

export function normalizeManagerPayment(raw = {}) {
  const source = unwrapObject(raw);
  const id = source.id ?? source.paymentId ?? source.uuid ?? '';
  const amountDue = toManagerNumber(source.amountDue ?? source.dueAmount ?? source.amount, 0);
  const amountPaid = toManagerNumber(source.amountPaid ?? source.paidAmount, 0);
  return {
    id: toManagerText(id),
    tenantId: toManagerText(source.tenantId ?? source.tenant?.id),
    tenantName: managerDisplay(source.tenantName ?? source.tenant?.name ?? source.name),
    branchId: toManagerText(source.branchId ?? source.branch?.id),
    branchName: managerDisplay(source.branchName ?? source.branch?.name ?? source.branch?.hostelName),
    amountDue,
    amountPaid,
    amount: toManagerNumber(source.amount ?? amountDue ?? amountPaid, 0),
    remainingAmount: toManagerNumber(source.remainingAmount, Math.max(amountDue - amountPaid, 0)),
    status: normalizeStatus(source.status),
    paymentMethod: managerDisplay(source.paymentMethod ?? source.method),
    dueDate: toManagerText(source.dueDate),
    paidAt: toManagerText(source.paidAt ?? source.paymentDate),
    raw: source,
  };
}

export function normalizeManagerPaymentList(raw) {
  return unwrapList(raw).map(normalizeManagerPayment);
}

export function normalizeManagerPaymentSummary(raw = {}) {
  const source = unwrapObject(raw);
  return {
    totalDue: toManagerNumber(source.totalDue ?? source.due ?? source.total, 0),
    totalPaid: toManagerNumber(source.totalPaid ?? source.paid, 0),
    totalPending: toManagerNumber(source.totalPending ?? source.pending, 0),
    collectionRate: toManagerNumber(source.collectionRate ?? source.rate, null),
    raw: source,
  };
}

export function normalizeManagerMessage(raw, fallback = 'Success') {
  return unwrapMessage(raw, fallback);
}

export function getManagerOccupancyPercent(occupied, total) {
  const safeTotal = toManagerNumber(total, 0);
  if (!safeTotal) return 0;
  return Math.round((toManagerNumber(occupied, 0) / safeTotal) * 100);
}

export function getFirstManagerFile(value) {
  if (!value) return null;
  if (typeof File !== 'undefined' && value instanceof File) return value;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return value;
  if (Array.isArray(value)) return value[0] || null;
  if (typeof FileList !== 'undefined' && value instanceof FileList) return value[0] || null;
  return null;
}

function appendFormValue(formData, key, value) {
  const text = typeof value === 'string' ? value.trim() : value;
  if (text !== undefined && text !== null && text !== '') {
    formData.append(key, text);
  }
}

export function buildManagerUserFormData(values = {}) {
  const formData = new FormData();
  const entries = {
    email: values.email,
    name: values.name,
    phone: values.phone,
    aadhaarNumber: values.aadhaarNumber,
    branchId: values.branchId,
    role: values.role,
  };

  Object.entries(entries).forEach(([key, value]) => appendFormValue(formData, key, value));

  const aadhaarPhoto = getFirstManagerFile(values.aadhaarPhoto);
  if (aadhaarPhoto) {
    formData.append('aadhaarPhoto', aadhaarPhoto);
  }

  return formData;
}

export function buildUpdateStaffPayload(values = {}) {
  return {
    name: toManagerText(values.name),
    phone: toManagerText(values.phone),
  };
}

export function buildCreateRoomPayload(values = {}) {
  return {
    roomNumber: toManagerText(values.roomNumber),
    floor: toManagerNumber(values.floor),
    roomType: toManagerText(values.roomType),
    totalBeds: toManagerNumber(values.totalBeds),
  };
}

export function buildCreateRoomFormData(values = {}) {
  const formData = new FormData();
  appendFormValue(formData, 'roomNumber', values.roomNumber);
  appendFormValue(formData, 'floor', values.floor);
  appendFormValue(formData, 'roomType', values.roomType);
  appendFormValue(formData, 'totalBeds', values.totalBeds);

  const image = getFirstManagerFile(values.image);
  if (image) {
    formData.append('image', image);
  }

  return formData;
}

export function buildFoodMenuFormData(values = {}) {
  const formData = new FormData();
  const file = getFirstManagerFile(values.file);
  if (file) formData.append('file', file);
  appendFormValue(formData, 'week_start_date', values.weekStartDate ?? values.week_start_date);
  return formData;
}

export function buildAssignBedPayload(values = {}) {
  return {
    bedId: toManagerText(values.bedId),
    bedNumber: toManagerText(values.bedNumber),
    tenantId: toManagerText(values.tenantId),
  };
}

export function buildBedStatusPayload(status) {
  return { status: toManagerText(status) };
}

export function buildCashPaymentPayload(values = {}) {
  return {
    tenantId: toManagerText(values.tenantId),
    amount: toManagerNumber(values.amount, 0),
  };
}
