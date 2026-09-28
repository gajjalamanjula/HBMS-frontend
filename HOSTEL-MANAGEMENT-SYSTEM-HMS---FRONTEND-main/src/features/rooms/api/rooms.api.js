import { getApiErrorMessage, httpClient, uploadClient } from '../../../lib/axios/apiClient';
import { cleanParams, unwrapList } from '../../../lib/api/normalizeResponse';

function mapRoomRow(raw = {}) {
  return {
    id: raw?.roomId ?? raw?.id ?? '',
    branchId: raw?.branchId ?? raw?.branch?.id ?? '',
    roomNumber: raw?.roomNumber || raw?.name || '',
    roomType: raw?.roomType || raw?.type || '',
    floor: Number(raw?.floor ?? 0),
    totalBeds: Number(raw?.totalBeds ?? raw?.bedCount ?? 0),
    available: Number(raw?.available ?? raw?.availableBeds ?? 0),
    occupied: Number(raw?.occupied ?? raw?.occupiedBeds ?? 0),
    maintenance: Number(raw?.maintenance ?? raw?.maintenanceBeds ?? 0),
    beds: Array.isArray(raw?.beds) ? raw.beds : [],
    imageUrl: raw?.imageUrl ?? '',
    raw,
  };
}

function buildRoomFormData(payload = {}) {
  const formData = new FormData();
  const fields = {
    branchId: payload.branchId ?? payload.branch?.id,
    roomNumber: payload.roomNumber,
    floor: payload.floor,
    roomType: payload.roomType,
    totalBeds: payload.totalBeds,
  };

  Object.entries(fields).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') formData.append(key, value);
  });

  const file = payload.image?.[0] || payload.image || null;
  if (file) formData.append('image', file);

  return formData;
}

function filterByBranch(rows = [], branchId) {
  if (!branchId) return rows;
  return rows.filter((room) => String(room.branchId || room.raw?.branchId || room.raw?.branch?.id || '') === String(branchId));
}

export const roomsApi = {
  async getAll() {
    try {
      const response = await httpClient.get('/rooms');
      return unwrapList(response.data).map(mapRoomRow);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load rooms'));
    }
  },

  async getByBranch(branchId) {
    if (!branchId) return this.getAll();

    try {
      const response = await httpClient.get(`/branches/${branchId}/rooms`, {
        params: cleanParams({ branchId }),
      });
      return unwrapList(response.data).map(mapRoomRow);
    } catch (primaryError) {
      const status = primaryError?.response?.status;
      if (status && ![404, 405].includes(status)) {
        throw new Error(getApiErrorMessage(primaryError, 'Failed to load branch rooms'));
      }

      const rows = await this.getAll();
      return filterByBranch(rows, branchId);
    }
  },

  async create(payload = {}) {
    try {
      const response = await uploadClient.post('/rooms', buildRoomFormData(payload));
      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create room'));
    }
  },
};
