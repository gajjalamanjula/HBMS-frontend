import { unwrapData, unwrapList, unwrapObject, unwrapMessage } from '../../../lib/api/normalizeResponse';

export const EMPTY_PUBLIC_VALUE = '-';

function toText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

function toDisplay(value) {
  const text = toText(value);
  return text || EMPTY_PUBLIC_VALUE;
}

function toNumberOrNull(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toBoolean(value, fallback = false) {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'number') return value === 1;

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();

    if (['true', 'yes', '1', 'available'].includes(normalized)) return true;

    if (['false', 'no', '0', 'occupied', 'unavailable'].includes(normalized)) {
      return false;
    }
  }

  return fallback;
}

function formatRent(value) {
  const amount = toNumberOrNull(value);
  return amount === null ? EMPTY_PUBLIC_VALUE : `INR ${amount.toLocaleString('en-IN')}`;
}

function parseImageUrls(source = {}) {
  if (Array.isArray(source.imageUrls)) {
    return source.imageUrls.filter(Boolean);
  }

  if (Array.isArray(source.images)) {
    return source.images.filter(Boolean);
  }

  return [];
}

export function normalizeBranch(raw = {}) {
  const source = unwrapObject(raw);
  const id = source.id ?? source.branchId ?? source.uuid ?? '';

  const locationParts = [
    source.fullAddress,
    source.location,
    source.area,
    source.colony,
    source.city,
  ].filter(Boolean);

  const imageUrls = parseImageUrls(source);
  const imageUrl = toText(source.imageUrl ?? imageUrls[0] ?? source.image);

  const averageRating = toNumberOrNull(
    source.averageRating ?? source.avgRating ?? source.rating
  );

  const totalReviews = toNumberOrNull(
    source.totalReviews ?? source.reviewCount ?? source.reviewsCount
  );

  return {
    id: toText(id),
    hostelName: toDisplay(source.hostelName ?? source.name ?? source.branchName),
    name: toDisplay(source.hostelName ?? source.name ?? source.branchName),
    location: toDisplay(locationParts[0]),
    city: toText(source.city),
    area: toText(source.area),
    colony: toText(source.colony),
    roadNo: toText(source.roadNo),
    landmark: toText(source.landmark),
    fullAddress: toText(source.fullAddress),
    description: toText(source.description),

    imageUrls,
    imageUrl,
    image: imageUrl,

    monthlyRent: toNumberOrNull(source.monthlyRent),
    monthlyRentLabel: formatRent(source.monthlyRent),
    hostelType: toText(source.hostelType),
    managerName: toText(source.managerName),
    managerPhone: toText(source.managerPhone),
    whatsappNumber: toText(source.whatsappNumber),
    totalFloors: toNumberOrNull(source.totalFloors),
    amenities: toText(source.amenities),
    mapLocationUrl: toText(source.mapLocationUrl),

    averageRating,
    avgRating: averageRating,
    rating: averageRating,
    totalReviews,

    raw: source,
  };
}

export function normalizeBranchResponse(raw) {
  return unwrapList(raw).map(normalizeBranch).filter((branch) => branch.id);
}

export function normalizeRoomAvailability(raw = {}) {
  const source = unwrapObject(raw);
  const roomId = source.roomId ?? source.id ?? source.uuid ?? '';
  const totalBeds = toNumberOrNull(source.totalBeds);
  const availableBeds = toNumberOrNull(source.availableBeds);
  const fullyOccupied = toBoolean(source.fullyOccupied, availableBeds === 0);

  const imageUrls = parseImageUrls(source);

  const imageUrl = toText(
    source.imageUrl ??
      source.roomImageUrl ??
      imageUrls[0] ??
      source.image ??
      source.photoUrl ??
      source.roomPhotoUrl ??
      source.thumbnailUrl ??
      source.fileUrl ??
      source.path ??
      source.url
  );

  return {
    id: toText(roomId),
    roomId: toText(roomId),
    roomNumber: toDisplay(source.roomNumber ?? source.number),
    roomType: toDisplay(source.roomType ?? source.type),
    totalBeds,
    availableBeds,
    fullyOccupied,
    status: fullyOccupied ? 'FULLY_OCCUPIED' : 'AVAILABLE',

    imageUrls,
    imageUrl,
    image: imageUrl,
    displayImageUrl: imageUrl,

    raw: source,
  };
}

export function normalizeRoomAvailabilityResponse(raw) {
  return unwrapList(raw)
    .map(normalizeRoomAvailability)
    .filter((room) => room.roomId);
}

export function normalizeBed(raw = {}) {
  const source = unwrapObject(raw);
  const id = source.id ?? source.bedId ?? source.uuid ?? '';
  const status = toText(source.status).toUpperCase();

  return {
    id: toText(id),
    bedId: toText(id),
    bedNumber: toDisplay(source.bedNumber ?? source.number ?? source.name),
    status: status || EMPTY_PUBLIC_VALUE,
    available: status ? status === 'AVAILABLE' : false,
    raw: source,
  };
}

export function normalizeBedResponse(raw) {
  return unwrapList(raw).map(normalizeBed).filter((bed) => bed.id);
}

export function normalizeBookingResponse(raw) {
  const data = unwrapData(raw);

  if (typeof data === 'string') {
    return {
      message: data,
      bookingId: '',
      status: EMPTY_PUBLIC_VALUE,
      raw: data,
    };
  }

  const source = data && typeof data === 'object' && !Array.isArray(data) ? data : {};
  const bookingId = source.bookingId ?? source.id ?? source.uuid ?? '';

  return {
    message: unwrapMessage(raw, 'Booking request submitted successfully'),
    bookingId: toText(bookingId),
    status: toText(source.status ?? source.bookingStatus).toUpperCase() || EMPTY_PUBLIC_VALUE,
    branchId: toText(source.branchId ?? source.branch?.id ?? source.branch?.branchId),
    roomId: toText(source.roomId ?? source.room?.id ?? source.room?.roomId),
    bedId: toText(source.bedId ?? source.bed?.id ?? source.bed?.bedId),
    createdAt: toText(source.createdAt ?? source.createdDate ?? source.requestedAt),
    raw: source,
  };
}

export function normalizePublicRegisterResponse(raw) {
  return {
    message: unwrapMessage(raw, 'Registration successful'),
    raw: unwrapData(raw),
  };
}

export function normalizePaymentResponse(raw) {
  return {
    message: unwrapMessage(raw, 'Full payment successful'),
    raw: unwrapData(raw),
  };
}

export function buildPublicBookingPayload(values = {}) {
  return {
    branchId: toText(values.branchId),
    bedId: toText(values.bedId),
  };
}

export function buildPublicRegisterPayload(values = {}) {
  return {
    name: toText(values.name),
    email: toText(values.email),
    phone: toText(values.phone),
    password: values.password || '',
  };
}

export function getBranchLocation(branch = {}) {
  return branch.fullAddress || branch.location || branch.area || branch.city || EMPTY_PUBLIC_VALUE;
}

export function getAmenityList(branch = {}) {
  return toText(branch.amenities)
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function isValidPublicId(value) {
  return Boolean(toText(value));
}