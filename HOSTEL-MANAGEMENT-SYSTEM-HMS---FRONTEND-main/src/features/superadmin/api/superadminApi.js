import { getApiErrorMessage, httpClient, uploadClient } from '../../../lib/axios/apiClient';
import {
  buildCreateOwnerFormData,
  cleanParams,
  normalizeAuditLog,
  normalizeBranch,
  normalizeDashboardResponse,
  normalizeHealth,
  normalizeOwner,
  normalizePageResponse,
  normalizeUser,
  unwrapResponse,
} from '../utils/superAdminMappers';

const toMessage = (payload, fallback) => {
  if (typeof payload === 'string') return payload;
  if (typeof payload?.data === 'string') return payload.data;
  if (typeof payload?.message === 'string') return payload.message;
  return fallback;
};

export const superadminApi = {
  async createOwner(values = {}) {
    try {
      const response = await uploadClient.post(
        '/admin/create-owner',
        buildCreateOwnerFormData(values)
      );

      return {
        name: values.name?.trim() || '',
        email: values.email?.trim() || '',
        message: toMessage(response?.data, 'Owner created successfully. OTP sent to email.'),
        raw: response?.data,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create owner'));
    }
  },

  async verifyOwnerOtp({ email, otp } = {}) {
    try {
      const response = await httpClient.post('/admin/verify-otp', null, {
        params: cleanParams({
          email: email?.trim(),
          otp: String(otp || '').trim(),
        }),
      });

      return {
        email: email?.trim() || '',
        message: toMessage(response?.data, 'Owner OTP verified successfully'),
        raw: response?.data,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to verify owner OTP'));
    }
  },

  async getDashboard() {
    try {
      const response = await httpClient.get('/admin/dashboard');
      return normalizeDashboardResponse(response?.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load dashboard stats'));
    }
  },

  async getOwners() {
    try {
      const response = await httpClient.get('/admin/owners');
      const data = unwrapResponse(response?.data);
      const list = Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

      return list.map(normalizeOwner);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load owners'));
    }
  },

  async updateOwner({ id, payload = {} } = {}) {
    try {
      if (!id) throw new Error('Owner ID is required');

      const response = await httpClient.put(`/admin/owners/${id}`, cleanParams(payload));

      return {
        id,
        name: payload.name?.trim() || '',
        message: toMessage(response?.data, 'Owner updated successfully'),
        raw: response?.data,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update owner'));
    }
  },

  async getUsers(params = {}) {
    try {
      const response = await httpClient.get('/admin/users', {
        params: cleanParams({
          page: params.page ?? 0,
          size: params.size ?? 10,
          role: params.role,
          active: params.active,
          search: params.search,
          sortBy: params.sortBy || 'createdAt',
          direction: params.direction || 'desc',
        }),
      });

      return normalizePageResponse(response?.data, normalizeUser);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load users'));
    }
  },

  async updateUserStatus({ id, active } = {}) {
    try {
      if (!id) throw new Error('User ID is required');

      const response = await httpClient.put(`/admin/users/${id}/status`, null, {
        params: { active: Boolean(active) },
      });

      return {
        id,
        active: Boolean(active),
        message: toMessage(response?.data, 'User status updated successfully'),
        raw: response?.data,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update user status'));
    }
  },

  async getBranches() {
    try {
      const response = await httpClient.get('/admin/branches');
      const data = unwrapResponse(response?.data);
      const list = Array.isArray(data?.content)
        ? data.content
        : Array.isArray(data?.data)
          ? data.data
          : Array.isArray(data)
            ? data
            : [];

      return list.map(normalizeBranch);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load branches'));
    }
  },

  async getHealth() {
    try {
      const response = await httpClient.get('/admin/health');
      return normalizeHealth(response?.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load system health'));
    }
  },

  async getAuditLogs(params = {}) {
    try {
      const response = await httpClient.get('/admin/audit-logs', {
        params: cleanParams({
          page: params.page ?? 0,
          size: params.size ?? 10,
          action: params.action,
        }),
      });

      return normalizePageResponse(response?.data, normalizeAuditLog);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load audit logs'));
    }
  },
};

export default superadminApi;
