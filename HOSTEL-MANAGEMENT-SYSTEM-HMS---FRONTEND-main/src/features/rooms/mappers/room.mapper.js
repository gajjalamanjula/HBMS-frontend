export function mapRoom(raw = {}) {
  const totalBeds = Number(raw.totalBeds ?? raw.total_beds ?? 0);
  const occupiedBeds = Number(raw.occupiedBeds ?? raw.occupied_beds ?? 0);
  const availableBeds =
    raw.availableBeds ?? raw.available_beds ?? Math.max(totalBeds - occupiedBeds, 0);

  return {
    id: raw.id ?? raw.roomId ?? '',
    branchId: raw.branchId ?? raw.branch_id ?? '',
    roomNumber: raw.roomNumber ?? raw.room_number ?? '-',
    roomType: raw.roomType ?? raw.room_type ?? '-',
    floor: raw.floor ?? '-',
    price: Number(raw.price ?? 0),
    totalBeds,
    occupiedBeds,
    availableBeds: Number(availableBeds),
    status: String(raw.status ?? '-').toUpperCase(),
    furnishing: raw.furnishing ?? '-',
    amenities: Array.isArray(raw.amenities) ? raw.amenities : [],
    image: raw.image ?? raw.imageUrl ?? '',
    description: raw.description ?? '',
    occupancyPercentage: totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0,
  };
}

export function mapRoomList(rows = []) {
  return Array.isArray(rows) ? rows.map(mapRoom) : [];
}
