import { unwrapData, unwrapList, unwrapMessage, unwrapObject } from '../../../lib/api/normalizeResponse';

export const BOOKING_EMPTY_VALUE = '-';

function toText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function toDisplay(value) {
  const text = toText(value);
  return text || BOOKING_EMPTY_VALUE;
}

function toNumberOrNull(value) {
  if (value === null || value === undefined || value === '') return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

export function normalizeBookingStatus(value) {
  const status = toText(value).toUpperCase();
  return status || BOOKING_EMPTY_VALUE;
}

export function isPendingBooking(status) {
  return normalizeBookingStatus(status) === 'PENDING';
}

export function normalizePublicBookingResponse(raw = {}) {
  const source = unwrapObject(raw);
  const user = unwrapObject(source.user ?? source.tenant ?? source.publicUser);
  const branch = unwrapObject(source.branch);
  const room = unwrapObject(source.room);
  const bed = unwrapObject(source.bed);
  const id = source.bookingId ?? source.id ?? source.uuid ?? '';

  return {
    id: toText(id),
    bookingId: toText(id),
    publicUserName: toDisplay(
      source.publicUserName ??
        source.tenantName ??
        source.userName ??
        source.name ??
        user.name
    ),
    publicUserEmail: toDisplay(
      source.publicUserEmail ?? source.tenantEmail ?? source.email ?? user.email
    ),
    publicUserPhone: toDisplay(
      source.publicUserPhone ??
        source.tenantPhone ??
        source.phone ??
        source.mobileNumber ??
        user.phone
    ),
    tenantName: toDisplay(
      source.publicUserName ??
        source.tenantName ??
        source.userName ??
        source.name ??
        user.name
    ),
    tenantEmail: toDisplay(
      source.publicUserEmail ?? source.tenantEmail ?? source.email ?? user.email
    ),
    tenantPhone: toDisplay(
      source.publicUserPhone ??
        source.tenantPhone ??
        source.phone ??
        source.mobileNumber ??
        user.phone
    ),
    branchId: toText(source.branchId ?? branch.id ?? branch.branchId),
    branchName: toDisplay(
      source.hostelName ?? source.branchName ?? branch.name ?? branch.hostelName
    ),
    roomId: toText(source.roomId ?? room.id ?? room.roomId),
    roomNumber: toDisplay(source.roomNumber ?? room.roomNumber ?? room.number),
    bedId: toText(source.bedId ?? bed.id ?? bed.bedId),
    bedNumber: toDisplay(source.bedNumber ?? bed.bedNumber ?? bed.number),
    amount: toNumberOrNull(source.amountPaid ?? source.amount ?? source.totalAmount ?? 0),
    status: normalizeBookingStatus(source.status ?? source.bookingStatus),
    createdAt: toText(source.createdAt ?? source.createdDate ?? source.requestedAt),
    updatedAt: toText(source.updatedAt ?? source.updatedDate),
    raw: source,
  };
}

export function normalizeBookingList(raw) {
  return unwrapList(raw)
    .map(normalizePublicBookingResponse)
    .filter((booking) => booking.bookingId);
}

export function normalizeBookingMessage(raw, fallback = 'Booking updated successfully') {
  return unwrapMessage(raw, fallback);
}

export function unwrapBookingPayload(raw) {
  return unwrapData(raw);
}
