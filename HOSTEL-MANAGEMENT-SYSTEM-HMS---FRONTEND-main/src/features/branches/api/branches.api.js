import { httpClient, uploadClient } from '../../../lib/axios/apiClient';
import { mapBranch, mapBranchList } from '../mappers/branch.mapper';

const cleanParams = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );

export const branchesApi = {
  async getAll(params = {}) {
    const response = await httpClient.get('/branches', {
      params: cleanParams({
        search: params.search,
        page: params.page,
        size: params.size,
        city: params.city,
        area: params.area,
      }),
    });

    return mapBranchList(response.data);
  },

  async getMenHostels(location) {
    const response = await httpClient.get('/branches/men-hostels', {
      params: cleanParams({ location }),
    });

    return mapBranchList(response.data);
  },

  async getWomenHostels(location) {
    const response = await httpClient.get('/branches/women-hostels', {
      params: cleanParams({ location }),
    });

    return mapBranchList(response.data);
  },

  async getCoLivingHostels(location) {
    const response = await httpClient.get('/branches/co-living-hostels', {
      params: cleanParams({ location }),
    });

    return mapBranchList(response.data);
  },

  async getById(branchId) {
    if (!branchId) return null;

    try {
      const response = await httpClient.get(`/branches/${branchId}`);
      return mapBranch(response.data);
    } catch (primaryError) {
      const status = primaryError?.response?.status;
      if (status && ![404, 405].includes(status)) throw primaryError;

      const rows = await this.getAll();
      return rows.find((item) => String(item.id) === String(branchId)) || null;
    }
  },

  async create(payload = {}) {
    const formData = new FormData();

    Object.entries(payload).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        formData.append(key, value);
      }
    });

    const response = await uploadClient.post('/branches', formData);

    return mapBranch(response.data);
  },
};