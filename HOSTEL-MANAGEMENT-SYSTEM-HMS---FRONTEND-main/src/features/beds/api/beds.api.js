import { getApiErrorMessage, httpClient } from '../../../lib/axios/apiClient';
import { unwrapList, unwrapObject } from '../../../lib/api/normalizeResponse';

function mapBed(raw = {}) {
  return {
    id: raw?.id ?? raw?.bedId ?? '',
    roomId: raw?.roomId ?? raw?.room?.id ?? '',
    branchId:
      raw?.branchId ??
      raw?.branch?.id ??
      raw?.room?.branchId ??
      raw?.room?.branch?.id ??
      '',
    bedNumber: raw?.bedNumber ?? raw?.number ?? raw?.name ?? '-',
    status: String(raw?.status || '').toUpperCase(),
    tenantId: raw?.tenantId ?? raw?.tenant?.id ?? '',
    raw,
  };
}

function mapBedList(rows = []) {
  return Array.isArray(rows) ? rows.map(mapBed).filter((bed) => bed.id) : [];
}

export const bedsApi = {
  async getAvailable() {
    try {
      const response = await httpClient.get('/beds/available');
      return mapBedList(unwrapList(response.data));
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to load available beds')
      );
    }
  },

  async getAll() {
    const endpoints = ['/auth/manager/beds', '/beds'];

    for (const endpoint of endpoints) {
      try {
        const response = await httpClient.get(endpoint);
        return mapBedList(unwrapList(response.data));
      } catch (error) {
        const status = error?.response?.status;

        if (status && ![404, 405].includes(status)) {
          throw new Error(getApiErrorMessage(error, 'Failed to load beds'));
        }
      }
    }

    return this.getAvailable();
  },

  async assign(payload = {}) {
    try {
      const response = await httpClient.post('/beds/assign', {
        bedId: payload.bedId,
        bedNumber: payload.bedNumber,
        tenantId: payload.tenantId,
      });

      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to assign bed'));
    }
  },

  async updateStatus(id, payload = {}) {
    try {
      if (!id) throw new Error('Bed ID is required');

      const response = await httpClient.patch(
        `/auth/manager/beds/${id}/status`,
        null,
        {
          params: {
            status: payload.status,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update bed status'));
    }
  },

  async getStats() {
    try {
      const response = await httpClient.get('/beds/stats');
      const data = unwrapObject(response.data);

      return {
        total: Number(data?.total ?? 0),
        occupied: Number(data?.occupied ?? 0),
        available: Number(data?.available ?? 0),
        maintenance: Number(data?.maintenance ?? 0),
        reserved: Number(data?.reserved ?? 0),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load bed stats'));
    }
  },
};

export default bedsApi;