import { unwrapData, unwrapList, unwrapObject, unwrapMessage } from '../../../lib/api/normalizeResponse';
import { resolveBackendFileUrl } from '../../../lib/url/safeUrl';

export const OWNER_EMPTY_VALUE = '-';

export function toOwnerNumber(value, fallback = null) {
  if (value === null || value === undefined || value === '') return fallback;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function toOwnerText(value) {
  if (value === null || value === undefined) return '';
  return String(value).trim();
}

export function ownerDisplay(value) {
  const text = toOwnerText(value);
  return text || OWNER_EMPTY_VALUE;
}

export function maskOwnerAadhaar(value) {
  const digits = String(value || '').replace(/\D/g, '');
  if (digits.length < 4) return OWNER_EMPTY_VALUE;
  return `xxxx-xxxx-${digits.slice(-4)}`;
}

export function isSafeOwnerExternalUrl(value) {
  const text = toOwnerText(value);
  if (!text) return false;

  try {
    const parsed = new URL(text);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

export function toSafeOwnerExternalUrl(value) {
  const text = toOwnerText(value);
  return isSafeOwnerExternalUrl(text) ? text : '';
}

export function isKnownOwnerRevenuePlaceholder(row = {}) {
  return String(row.month || '').trim().toUpperCase() === 'JAN' && Number(row.revenue) === 50000;
}

export function toOwnerAssetUrl(value) {
  return resolveBackendFileUrl(toOwnerText(value), {
    allowBlob: false,
    allowHttp: false,
  });
}

export function normalizeOwnerDashboard(raw) {
  const source = unwrapObject(raw);

  return {
    totalBranches: toOwnerNumber(source.totalBranches),
    totalTenants: toOwnerNumber(source.totalTenants),
    totalStaff: toOwnerNumber(source.totalStaff),
    totalBeds: toOwnerNumber(source.totalBeds),
    occupiedBeds: toOwnerNumber(source.occupiedBeds),
    availableBeds: toOwnerNumber(source.availableBeds),
    raw: source,
  };
}

export function normalizeOwnerBranch(raw = {}) {
  const source = unwrapObject(raw);
  const id = source.branchId ?? source.id ?? source.uuid ?? '';

  const imageUrls = Array.isArray(source.imageUrls)
    ? source.imageUrls
    : Array.isArray(source.images)
      ? source.images
      : [];

  const imageUrl = toOwnerText(
    source.imageUrl ??
      imageUrls[0] ??
      source.image_url ??
      source.photoUrl ??
      source.image
  );

  return {
    id: toOwnerText(id),
    branchId: toOwnerText(id),
    name: ownerDisplay(source.name ?? source.hostelName ?? source.branchName),
    hostelName: ownerDisplay(source.hostelName ?? source.name ?? source.branchName),
    location: ownerDisplay(source.location ?? source.fullAddress ?? source.city ?? source.area),
    fullAddress: toOwnerText(source.fullAddress),
    city: toOwnerText(source.city),
    area: toOwnerText(source.area),
    colony: toOwnerText(source.colony),
    roadNo: toOwnerText(source.roadNo),
    landmark: toOwnerText(source.landmark),
    description: toOwnerText(source.description),
    managerName: toOwnerText(source.managerName),
    managerPhone: toOwnerText(source.managerPhone),
    whatsappNumber: toOwnerText(source.whatsappNumber),
    totalFloors: toOwnerNumber(source.totalFloors),
    amenities: toOwnerText(source.amenities),
    mapLocationUrl: toSafeOwnerExternalUrl(source.mapLocationUrl),
    hostelType: toOwnerText(source.hostelType),
    monthlyRent: toOwnerNumber(source.monthlyRent),
    bookingAdvance: toOwnerNumber(source.bookingAdvance),
    totalBeds: toOwnerNumber(source.totalBeds),
    occupiedBeds: toOwnerNumber(source.occupiedBeds),

    imageUrls,
    displayImageUrls: imageUrls.map((url) => toOwnerAssetUrl(url)),
    imageUrl,
    displayImageUrl: toOwnerAssetUrl(imageUrl),

    raw: source,
  };
}

export function mergeOwnerBranchRows(summaryBranches = [], catalogBranches = []) {
  const catalogById = new Map(catalogBranches.map((branch) => [branch.id, branch]));
  const catalogByNameLocation = new Map(
    catalogBranches.map((branch) => [
      `${String(branch.name || '').toLowerCase()}::${String(branch.location || '').toLowerCase()}`,
      branch,
    ])
  );

  const pickDisplay = (primary, fallback) => {
    if (primary && primary !== OWNER_EMPTY_VALUE) return primary;
    if (fallback && fallback !== OWNER_EMPTY_VALUE) return fallback;
    return primary || fallback || OWNER_EMPTY_VALUE;
  };

  const pickText = (primary, fallback) => primary || fallback || '';

  return summaryBranches.map((branch) => {
    const catalog =
      catalogById.get(branch.id) ||
      catalogByNameLocation.get(
        `${String(branch.name || '').toLowerCase()}::${String(branch.location || '').toLowerCase()}`
      ) ||
      null;

    if (!catalog) return branch;

    return {
      ...branch,
      ...catalog,
      id: branch.id || catalog.id,
      branchId: branch.branchId || catalog.branchId,
      name: pickDisplay(catalog.name, branch.name),
      hostelName: pickDisplay(catalog.hostelName, branch.hostelName),
      location: pickDisplay(catalog.location, branch.location),
      fullAddress: pickText(catalog.fullAddress, branch.fullAddress),
      city: pickText(catalog.city, branch.city),
      area: pickText(catalog.area, branch.area),
      colony: pickText(catalog.colony, branch.colony),
      roadNo: pickText(catalog.roadNo, branch.roadNo),
      landmark: pickText(catalog.landmark, branch.landmark),
      description: pickText(catalog.description, branch.description),
      managerName: pickText(catalog.managerName, branch.managerName),
      managerPhone: pickText(catalog.managerPhone, branch.managerPhone),
      whatsappNumber: pickText(catalog.whatsappNumber, branch.whatsappNumber),
      totalFloors: catalog.totalFloors || branch.totalFloors,
      amenities: pickText(catalog.amenities, branch.amenities),
      mapLocationUrl: toSafeOwnerExternalUrl(
        pickText(catalog.mapLocationUrl, branch.mapLocationUrl)
      ),
      hostelType: pickText(catalog.hostelType, branch.hostelType),
      monthlyRent: catalog.monthlyRent || branch.monthlyRent,
      bookingAdvance: catalog.bookingAdvance || branch.bookingAdvance,
      totalBeds: branch.totalBeds ?? catalog.totalBeds,
      occupiedBeds: branch.occupiedBeds ?? catalog.occupiedBeds,

      imageUrls: catalog.imageUrls || branch.imageUrls || [],
      displayImageUrls: catalog.displayImageUrls || branch.displayImageUrls || [],
      imageUrl: catalog.imageUrl || branch.imageUrl,
      displayImageUrl: catalog.displayImageUrl || branch.displayImageUrl,

      raw: {
        ...(catalog.raw || {}),
        ...(branch.raw || {}),
      },
    };
  });
}

export function normalizeOwnerBranches(raw) {
  return unwrapList(raw).map(normalizeOwnerBranch).filter((branch) => branch.id);
}

export function normalizeOwnerBranchStats(raw) {
  const source = unwrapObject(raw);

  return {
    totalBeds: toOwnerNumber(source.totalBeds ?? source.total),
    occupied: toOwnerNumber(source.occupied ?? source.occupiedBeds),
    available: toOwnerNumber(source.available ?? source.availableBeds),
    raw: source,
  };
}

export function normalizeOwnerRevenue(raw) {
  return unwrapList(raw)
    .map((item) => {
      const source = unwrapObject(item);
      return {
        month: ownerDisplay(source.month),
        revenue: toOwnerNumber(source.revenue ?? source.amount ?? source.total),
        raw: source,
      };
    })
    .filter((row) => !isKnownOwnerRevenuePlaceholder(row));
}

export function normalizeOwnerBedSummary(raw) {
  const source = unwrapObject(raw);

  return {
    total: toOwnerNumber(source.total ?? source.totalBeds),
    occupied: toOwnerNumber(source.occupied ?? source.occupiedBeds),
    available: toOwnerNumber(source.available ?? source.availableBeds),
    maintenance: toOwnerNumber(source.maintenance),
    raw: source,
  };
}

export function normalizeOwnerComplaint(raw = {}) {
  const source = unwrapObject(raw);
  const id = source.id ?? source.complaintId ?? source.uuid ?? '';

  return {
    id: toOwnerText(id),
    category: ownerDisplay(source.category),
    priority: ownerDisplay(source.priority),
    description: ownerDisplay(source.description),
    status: ownerDisplay(source.status).toUpperCase(),
    branchId: toOwnerText(source.branchId),
    raisedBy: toOwnerText(source.raisedBy),
    assignedTo: toOwnerText(source.assignedTo),
    resolutionNote: toOwnerText(source.resolutionNote),
    raw: source,
  };
}

export function normalizeOwnerComplaints(raw) {
  return unwrapList(raw).map(normalizeOwnerComplaint).filter((complaint) => complaint.id);
}

export function normalizeOwnerManager(raw = {}) {
  const source = unwrapObject(raw);
  const id = source.id ?? source.userId ?? source.managerId ?? source.uuid ?? '';

  return {
    id: toOwnerText(id),
    name: ownerDisplay(source.name ?? source.fullName),
    email: ownerDisplay(source.email),
    phone: ownerDisplay(source.phone ?? source.mobile ?? source.phoneNumber),
    branchId: toOwnerText(source.branchId ?? source.branch?.id),
    branchName: ownerDisplay(source.branchName ?? source.branch?.name ?? source.branch?.hostelName),
    createdAt: toOwnerText(source.createdAt),
    aadhaarNumber: maskOwnerAadhaar(source.aadhaarNumber ?? source.aadhaar),
    raw: source,
  };
}

export function normalizeOwnerManagers(raw) {
  return unwrapList(raw).map(normalizeOwnerManager).filter((manager) => manager.id);
}

export function normalizeOwnerCountResponse(raw, keys = []) {
  const source = unwrapObject(raw);
  const valueKey = keys.find((key) => source[key] !== undefined);
  return toOwnerNumber(valueKey ? source[valueKey] : source.count ?? source.total);
}

export function normalizeOwnerFoodMenu(raw = {}) {
  const source = unwrapObject(raw);
  const id = source.id ?? source.menuId ?? source.uuid ?? '';
  const fileUrl = toOwnerText(source.fileUrl ?? source.url ?? source.filePath);

  return {
    id: toOwnerText(id),
    fileUrl,
    displayFileUrl: toOwnerAssetUrl(fileUrl),
    uploadedBy: toOwnerText(source.uploadedBy),
    weekStartDate: toOwnerText(source.weekStartDate ?? source.week_start_date),
    createdAt: toOwnerText(source.createdAt),
    raw: source,
  };
}

export function normalizeOwnerFoodMenuHistory(raw) {
  return unwrapList(raw).map(normalizeOwnerFoodMenu).filter((menu) => menu.id || menu.fileUrl);
}

export function normalizeOwnerMessage(raw, fallback = 'Success') {
  return unwrapMessage(raw, fallback);
}

export function getOwnerOccupancyPercent(occupied, total) {
  const safeTotal = toOwnerNumber(total, 0);
  if (!safeTotal) return 0;
  return Math.round((toOwnerNumber(occupied, 0) / safeTotal) * 100);
}

export function buildOwnerUserFormData(values = {}, options = {}) {
  const formData = new FormData();
  const entries = {
    email: values.email,
    name: values.name,
    phone: values.phone,
    aadhaarNumber: values.aadhaarNumber,
  };

  Object.entries(entries).forEach(([key, value]) => {
    const text = typeof value === 'string' ? value.trim() : value;
    if (text !== undefined && text !== null && text !== '') {
      formData.append(key, text);
    }
  });

  const branchId = toOwnerText(values.branchId);
  if (!options.skipBranchId && branchId) {
    formData.append('branchId', branchId);
  }

  const file = getFirstOwnerFile(values.aadhaarPhoto);
  if (file) {
    formData.append('aadhaarPhoto', file);
  }

  return formData;
}

export function buildOwnerBranchFormData(values = {}) {
  const formData = new FormData();

  const fields = {
    location: values.location,
    monthlyRent: values.monthlyRent,
    hostelType: values.hostelType,
    hostelName: values.hostelName,
    city: values.city,
    area: values.area,
    colony: values.colony,
    roadNo: values.roadNo,
    landmark: values.landmark,
    fullAddress: values.fullAddress,
    description: values.description,
    managerName: values.managerName,
    managerPhone: values.managerPhone,
    whatsappNumber: values.whatsappNumber,
    totalFloors: values.totalFloors,
    amenities: values.amenities,
    mapLocationUrl: values.mapLocationUrl,
  };

  Object.entries(fields).forEach(([key, value]) => {
    const safeValue = typeof value === 'string' ? value.trim() : value;

    if (safeValue !== undefined && safeValue !== null && safeValue !== '') {
      formData.append(key, safeValue);
    }
  });

  const images = getOwnerFiles(values.images);

  images.forEach((file) => {
    formData.append('images', file);
  });

  return formData;
}

export function getFirstOwnerFile(value) {
  if (!value) return null;
  if (typeof File !== 'undefined' && value instanceof File) return value;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return value;
  if (Array.isArray(value)) return value[0] || null;
  if (typeof FileList !== 'undefined' && value instanceof FileList) return value[0] || null;
  return null;
}

export function getOwnerFiles(value) {
  if (!value) return [];

  if (typeof File !== 'undefined' && value instanceof File) {
    return [value];
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof FileList !== 'undefined' && value instanceof FileList) {
    return Array.from(value).filter(Boolean);
  }

  return [];
}

export function unwrapOwnerPayload(payload) {
  return unwrapData(payload);
}