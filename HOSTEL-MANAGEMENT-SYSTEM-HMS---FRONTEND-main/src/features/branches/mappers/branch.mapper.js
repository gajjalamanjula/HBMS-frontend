function toNumber(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function parseAmenities(value) {
  if (Array.isArray(value)) return value.filter(Boolean);

  return String(value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function parseImageUrls(raw = {}) {
  if (Array.isArray(raw.imageUrls)) {
    return raw.imageUrls.filter(Boolean);
  }

  if (Array.isArray(raw.images)) {
    return raw.images.filter(Boolean);
  }

  return [];
}

export function mapBranch(raw = {}) {
  const location = raw?.location || raw?.fullAddress || raw?.area || raw?.city || '';
  const name = raw?.hostelName || raw?.name || raw?.branchName || '-';
  const monthlyRent = toNumber(raw?.monthlyRent ?? raw?.monthlyRentStartsAt, 0);
  const totalBeds = toNumber(raw?.totalBeds, 0);
  const occupiedBeds = toNumber(raw?.occupiedBeds, 0);
  const imageUrls = parseImageUrls(raw);
  const imageUrl = raw?.imageUrl || imageUrls[0] || '';

  return {
    id: raw?.id ?? raw?.branchId ?? '',
    name,
    hostelName: raw?.hostelName || name,
    city: raw?.city || '',
    area: raw?.area || raw?.locality || '',
    colony: raw?.colony || '',
    roadNo: raw?.roadNo || '',
    landmark: raw?.landmark || '',
    fullAddress: raw?.fullAddress || raw?.address || location,
    address: raw?.fullAddress || raw?.address || location,

    imageUrls,
    image: imageUrl || raw?.image || raw?.photoUrl || raw?.thumbnailUrl || '',
    imageUrl,

    totalBeds,
    occupiedBeds,
    availableBeds: toNumber(raw?.availableBeds, 0),
    monthlyRent,
    monthlyRentStartsAt: monthlyRent,
    amenities: parseAmenities(raw?.amenities),
    genderType: raw?.genderType || raw?.hostelType || '-',
    hostelType: raw?.hostelType || raw?.genderType || '',
    status: String(raw?.status || '-').toUpperCase(),
    rating: toNumber(raw?.rating ?? raw?.avgRating, 0),
    managerName: raw?.managerName || '-',
    managerPhone: raw?.managerPhone || '',
    whatsappNumber: raw?.whatsappNumber || '',
    description: raw?.description || '',
    occupancyPercentage: toNumber(
      raw?.occupancyPercentage ?? raw?.occupancy,
      totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0
    ),
    location,
    raw,
  };
}

export function mapBranchList(rows = []) {
  return Array.isArray(rows) ? rows.map(mapBranch) : [];
}