import {
  getApiErrorMessage,
  httpClient,
  uploadClient,
} from '../../../lib/axios/apiClient';
import { cleanText, unwrapList, unwrapMessage, unwrapObject } from '../../../lib/api/normalizeResponse';
import { openSafeUrl } from '../../../lib/security/safeOpenUrl';
import complaintsApi from '../../complaints/api/complaints.api';
import {
  normalizeStaffComplaint,
  normalizeStaffComplaints,
  normalizeStaffFoodMenu,
  normalizeStaffFoodMenuHistory,
  normalizeStaffKyc,
  toAbsoluteStaffUrl,
} from '../mappers/staffMappers';


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

const extractFile = (value) => {
  if (!value) return null;
  if (typeof File !== 'undefined' && value instanceof File) return value;
  if (typeof FileList !== 'undefined' && value instanceof FileList) return value[0] || null;
  if (Array.isArray(value)) return value[0] || null;
  return null;
};

const buildKycFormData = ({ userId, values = {}, includeUserId = false }) => {
  const formData = new FormData();

  if (includeUserId && userId) {
    formData.append('userId', String(userId));
  }

  const aadhaarFile = extractFile(values.aadhaarFile ?? values.aadhaar_file);
  const photoFile = extractFile(values.photoFile ?? values.photo_file);

  if (aadhaarFile) formData.append('aadhaar_file', aadhaarFile);
  if (photoFile) formData.append('photo_file', photoFile);

  return formData;
};

export const openStaffFileUrl = (payload, fallbackMessage) => {
  const raw = typeof payload === 'string'
    ? payload
    : payload?.data?.url ||
      payload?.data?.fileUrl ||
      payload?.data ||
      payload?.url ||
      payload?.fileUrl ||
      '';
  const url = toAbsoluteStaffUrl(raw);

  if (!url) throw new Error(fallbackMessage);

  if (!openSafeUrl(url, '_blank', { allowHttp: false })) {
    throw new Error(fallbackMessage);
  }

  return { success: true, url };
};

export const staffApi = {
  async getAssignedComplaints() {
    try {
      const response = await httpClient.get('/staff/complaints/assigned');
      return {
        rows: normalizeStaffComplaints(unwrapList(response.data)),
        branchQueueCount: Number(response.data?.branchQueueCount ?? response.data?.data?.branchQueueCount ?? 0) || 0,
        scoped: true,
      };
    } catch (primaryError) {
      const status = primaryError?.response?.status;

      if (status && ![404, 405].includes(status)) {
        throw new Error(getApiErrorMessage(primaryError, 'Failed to load assigned staff complaints'));
      }

      try {
        const response = await httpClient.get('/complaints');
        return {
          rows: normalizeStaffComplaints(unwrapList(response.data)),
          branchQueueCount: Number(response.data?.branchQueueCount ?? response.data?.data?.branchQueueCount ?? 0) || 0,
          scoped: false,
        };
      } catch (fallbackError) {
        throw new Error(getApiErrorMessage(fallbackError, 'Failed to load staff complaints'));
      }
    }
  },

  async getComplaints() {
    const result = await staffApi.getAssignedComplaints();
    return result.rows;
  },

  async getComplaintById(complaintId) {
    try {
      if (!complaintId) throw new Error('Complaint ID is required');
      const response = await httpClient.get(`/complaints/${complaintId}`);
      return normalizeStaffComplaint(unwrapObject(response.data));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load complaint details'));
    }
  },

  async updateComplaintStatus({ id, status, resolutionNote } = {}) {
    try {
      if (!id) throw new Error('Complaint ID is required');
      const result = await complaintsApi.updateStatus({
        id,
        status: cleanText(status),
        resolutionNote: cleanText(resolutionNote),
      });

      return {
        complaint: normalizeStaffComplaint(result.complaint),
        message: result.message || `Complaint marked ${cleanText(status).replace(/_/g, ' ').toLowerCase()}`,
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update complaint status'));
    }
  },

  async getCurrentFoodMenu() {
    try {
      const response = await httpClient.get('/food-menu/current');
      return normalizeStaffFoodMenu(unwrapObject(response.data));
    } catch (error) {
      if (isFoodMenuEmptyError(error)) return normalizeStaffFoodMenu({});
      throw new Error(getApiErrorMessage(error, 'Failed to load current food menu'));
    }
  },

  async getFoodMenuHistory() {
    try {
      const response = await httpClient.get('/food-menu/history');
      return normalizeStaffFoodMenuHistory(unwrapList(response.data));
    } catch (error) {
      if (isFoodMenuEmptyError(error)) return [];
      throw new Error(getApiErrorMessage(error, 'Failed to load food menu history'));
    }
  },

  async getKyc(userId) {
    try {
      if (!userId) return {};
      const response = await httpClient.get(`/kyc/${userId}`);
      return normalizeStaffKyc(unwrapObject(response.data));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load KYC status'));
    }
  },

  async uploadKyc({ userId, values = {} } = {}) {
    try {
      if (!userId) throw new Error('User ID is required');
      const response = await uploadClient.post(
        '/kyc/upload',
        buildKycFormData({ userId, values, includeUserId: true })
      );

      return {
        success: true,
        message: unwrapMessage(response.data, 'KYC uploaded successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to upload KYC documents'));
    }
  },

  async updateKyc({ userId, values = {} } = {}) {
    try {
      if (!userId) throw new Error('User ID is required');
      const response = await uploadClient.put(
        `/kyc/${userId}`,
        buildKycFormData({ userId, values })
      );

      return {
        success: true,
        message: unwrapMessage(response.data, 'KYC updated successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update KYC documents'));
    }
  },

  async openAadhaar(userId) {
    try {
      if (!userId) throw new Error('User ID is required');
      const response = await httpClient.get(`/kyc/${userId}/aadhaar`);
      return openStaffFileUrl(response.data, 'Aadhaar file is not available');
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to open Aadhaar file'));
    }
  },

  async openPhoto(userId) {
    try {
      if (!userId) throw new Error('User ID is required');
      const response = await httpClient.get(`/kyc/${userId}/photo`);
      return openStaffFileUrl(response.data, 'Photo file is not available');
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to open photo file'));
    }
  },

  async changePassword(values = {}) {
    try {
      const response = await httpClient.put('/auth/change-password', {
        oldPassword: cleanText(values.currentPassword || values.oldPassword),
        newPassword: cleanText(values.newPassword),
      });

      return {
        success: true,
        message: unwrapMessage(response.data, 'Password updated successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update password'));
    }
  },
};

export default staffApi;
