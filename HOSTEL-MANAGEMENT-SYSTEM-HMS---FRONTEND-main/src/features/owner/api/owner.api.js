import { getApiErrorMessage, httpClient, uploadClient } from '../../../lib/axios/apiClient';
import complaintsApi from '../../complaints/api/complaints.api';
import {
  buildOwnerBranchFormData,
  buildOwnerUserFormData,
  normalizeOwnerBedSummary,
  normalizeOwnerBranch,
  normalizeOwnerBranches,
  normalizeOwnerBranchStats,
  normalizeOwnerComplaints,
  normalizeOwnerCountResponse,
  normalizeOwnerDashboard,
  normalizeOwnerManagers,
  normalizeOwnerFoodMenu,
  normalizeOwnerFoodMenuHistory,
  normalizeOwnerMessage,
  normalizeOwnerRevenue,
} from '../utils/ownerMappers';


function isFoodMenuEmptyError(error) {
  const message = String(
    error?.response?.data?.message ||
      error?.response?.data?.error ||
      error?.message ||
      ''
  ).toLowerCase();

  return (
    message.includes('menu not found') ||
    message.includes('not assigned to any branch') ||
    message.includes('user is not assigned to any branch')
  );
}
function assertId(value, label) {
  if (!String(value || '').trim()) {
    throw new Error(`${label} is required`);
  }
}

function entityName(payload = {}, fallback = 'record') {
  return String(payload.name || payload.hostelName || payload.email || fallback).trim() || fallback;
}

export function buildOwnerOtpPayload({ email, otp } = {}) {
  return {
    email: String(email || '').trim(),
    otp: String(otp || '').trim(),
  };
}

function shouldFallbackToQueryOtp(error) {
  const status = error?.response?.status;
  return status === 400 || status === 404 || status === 415;
}

export const ownerApi = {
  async createManager(payload = {}) {
    try {
      const response = await uploadClient.post(
        '/auth/owner/create-manager',
        buildOwnerUserFormData(payload)
      );
      return {
        email: payload.email,
        name: payload.name,
        message: normalizeOwnerMessage(
          response.data,
          `Manager ${entityName(payload, 'user')} created successfully`
        ),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create manager'));
    }
  },

  async createOwnerStaff(payload = {}) {
    try {
      const response = await uploadClient.post(
        '/auth/owner/create-staff',
        buildOwnerUserFormData(payload)
      );
      return {
        email: payload.email,
        name: payload.name,
        message: normalizeOwnerMessage(
          response.data,
          `Staff ${entityName(payload, 'user')} created successfully`
        ),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create staff'));
    }
  },

  async createOwnerTenant(payload = {}) {
    try {
      const response = await uploadClient.post(
        '/auth/owner/create-tenant',
        buildOwnerUserFormData(payload)
      );
      return {
        email: payload.email,
        name: payload.name,
        message: normalizeOwnerMessage(
          response.data,
          `Tenant ${entityName(payload, 'user')} created successfully`
        ),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create tenant'));
    }
  },

  async createOwnerBranch(payload = {}) {
    try {
      const response = await uploadClient.post('/branches', buildOwnerBranchFormData(payload));
      return {
        branch: normalizeOwnerBranch(response.data),
        message: `Branch ${entityName(payload, 'branch')} created successfully`,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create branch'));
    }
  },

  async verifyOwnerOtp(payload = {}) {
    const body = buildOwnerOtpPayload(payload);

    try {
      const response = await httpClient.post('/auth/owner/verify-otp', body);
      return {
        email: body.email,
        message: normalizeOwnerMessage(response.data, `OTP verified for ${body.email}`),
      };
    } catch (error) {
      if (shouldFallbackToQueryOtp(error)) {
        try {
          const fallbackResponse = await httpClient.post('/auth/owner/verify-otp', null, {
            params: body,
          });
          return {
            email: body.email,
            message: normalizeOwnerMessage(fallbackResponse.data, `OTP verified for ${body.email}`),
          };
        } catch (fallbackError) {
          throw new Error(getApiErrorMessage(fallbackError, 'Failed to verify OTP'));
        }
      }

      throw new Error(getApiErrorMessage(error, 'Failed to verify OTP'));
    }
  },

  async getOwnerDashboard() {
    try {
      const response = await httpClient.get('/auth/owner/dashboard');
      return normalizeOwnerDashboard(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load owner dashboard'));
    }
  },

  async getOwnerBranches() {
    try {
      const response = await httpClient.get('/auth/owner/branches');
      return normalizeOwnerBranches(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load owner branches'));
    }
  },

  async getOwnerBranchStats(branchId) {
    assertId(branchId, 'Branch ID');

    try {
      const response = await httpClient.get(`/auth/owner/branches/${branchId}/stats`);
      return normalizeOwnerBranchStats(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load branch stats'));
    }
  },

  async getOwnerRevenue() {
    try {
      const response = await httpClient.get('/auth/owner/revenue');
      return normalizeOwnerRevenue(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load owner revenue'));
    }
  },

  async getOwnerBedSummary() {
    try {
      const response = await httpClient.get('/auth/owner/beds/summary');
      return normalizeOwnerBedSummary(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load bed summary'));
    }
  },

  async getOwnerComplaints() {
    try {
      const response = await httpClient.get('/complaints');
      return normalizeOwnerComplaints(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load owner complaints'));
    }
  },

  async escalateOwnerComplaint(id) {
    assertId(id, 'Complaint ID');

    try {
      const result = await complaintsApi.escalate(id);
      return {
        id,
        message: result.message || 'Complaint escalated successfully',
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to escalate complaint'));
    }
  },

  async getOwnerManagers() {
    try {
      const response = await httpClient.get('/auth/owner/managers');
      return normalizeOwnerManagers(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load managers'));
    }
  },

  async getOwnerStaffCount() {
    try {
      const response = await httpClient.get('/auth/owner/staff/count');
      return normalizeOwnerCountResponse(response.data, ['totalStaff']);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load staff count'));
    }
  },

  async getOwnerCurrentFoodMenu(branchId) {
    assertId(branchId, 'Branch ID');

    try {
      const response = await httpClient.get(`/food-menu/owner/current/${branchId}`);
      return normalizeOwnerFoodMenu(response.data);
    } catch (error) {
      if (isFoodMenuEmptyError(error)) return normalizeOwnerFoodMenu({});
      throw new Error(getApiErrorMessage(error, 'Failed to load current food menu'));
    }
  },

  async getOwnerFoodMenuHistory(branchId) {
    assertId(branchId, 'Branch ID');

    try {
      const response = await httpClient.get(`/food-menu/owner/history/${branchId}`);
      return normalizeOwnerFoodMenuHistory(response.data);
    } catch (error) {
      if (isFoodMenuEmptyError(error)) return [];
      throw new Error(getApiErrorMessage(error, 'Failed to load food menu history'));
    }
  },

  async getOwnerTenantsCount() {
    try {
      const response = await httpClient.get('/auth/owner/tenants/count');
      return normalizeOwnerCountResponse(response.data, ['totalTenants']);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load tenant count'));
    }
  },
};

export default ownerApi;
