import {
  getApiErrorMessage,
  httpClient,
  uploadClient,
} from '../../../lib/axios/apiClient';
import { cleanText, unwrapList, unwrapMessage, unwrapObject } from '../../../lib/api/normalizeResponse';
import { openSafeUrl, resolveBackendFileUrl } from '../../../lib/url/safeUrl';

const extractFile = (value) => {
  if (!value) return null;
  if (typeof File !== 'undefined' && value instanceof File) return value;
  if (typeof FileList !== 'undefined' && value instanceof FileList) return value[0] || null;
  if (Array.isArray(value)) return value[0] || null;
  return null;
};

const toAbsoluteFileUrl = (value = '') => resolveBackendFileUrl(value, { allowHttp: true });

const readFileUrl = (payload) => {
  if (typeof payload === 'string') return toAbsoluteFileUrl(payload);

  const data = payload?.data ?? payload?.payload ?? payload?.result ?? payload;

  if (typeof data === 'string') return toAbsoluteFileUrl(data);
  if (data && typeof data === 'object') {
    return toAbsoluteFileUrl(
      data.url || data.fileUrl || data.aadhaarUrl || data.photoUrl || data.invoiceUrl || ''
    );
  }

  return '';
};

const openFileUrl = (payload, fallbackMessage) => {
  const url = readFileUrl(payload);

  if (!url) throw new Error(fallbackMessage);

  if (!openSafeUrl(url, '_blank', { allowHttp: false })) {
    throw new Error(fallbackMessage);
  }

  return { success: true, url };
};

const buildKycFormData = ({ userId, values = {}, includeUserId = false }) => {
  const formData = new FormData();

  if (includeUserId && userId) {
    formData.append('userId', String(userId));
  }

  const aadhaarFile = extractFile(values.aadhaarFile ?? values.aadhaar_file);
  const photoFile = extractFile(values.photoFile ?? values.photo_file);

  if (aadhaarFile) {
    formData.append('aadhaar_file', aadhaarFile);
  }

  if (photoFile) {
    formData.append('photo_file', photoFile);
  }

  return formData;
};

export const tenantApi = {
  async getTenantPayments(tenantId) {
    try {
      if (!tenantId) return [];
      const response = await httpClient.get(`/payments/tenant/${tenantId}`);
      return unwrapList(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load tenant payments'));
    }
  },

  async downloadInvoice(paymentId) {
    try {
      if (!paymentId) throw new Error('Payment ID is required');

      const response = await httpClient.get(`/payments/invoice/${paymentId}`);

      return {
        ...openFileUrl(response?.data, 'Invoice link is not available'),
        id: paymentId,
        message: 'Invoice opened successfully',
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to open invoice'));
    }
  },

  async getComplaints() {
    try {
      const response = await httpClient.get('/complaints');
      return unwrapList(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load complaints'));
    }
  },

  async createComplaint(values = {}) {
    try {
      const response = await httpClient.post('/complaints', {
        category: cleanText(values.category),
        priority: cleanText(values.priority),
        description: cleanText(values.description),
      });

      return unwrapObject(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create complaint'));
    }
  },

  async getComplaintById(complaintId) {
    try {
      if (!complaintId) throw new Error('Complaint ID is required');
      const response = await httpClient.get(`/complaints/${complaintId}`);
      return unwrapObject(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load complaint details'));
    }
  },

  async confirmComplaintClose(complaintId) {
    try {
      if (!complaintId) throw new Error('Complaint ID is required');
      const response = await httpClient.post(`/complaints/${complaintId}/confirm-close`);

      return {
        success: true,
        id: complaintId,
        message: unwrapMessage(response.data, 'Complaint close confirmed successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to confirm complaint close'));
    }
  },

  async getKyc(userId) {
    try {
      if (!userId) return {};
      const response = await httpClient.get(`/kyc/${userId}`);
      return unwrapObject(response.data);
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

  async updateKyc(userId, values = {}) {
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

  async getAadhaarFile(userId) {
    try {
      if (!userId) throw new Error('User ID is required');
      const response = await httpClient.get(`/kyc/${userId}/aadhaar`);

      return openFileUrl(response?.data, 'Aadhaar file is not available');
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to open Aadhaar file'));
    }
  },

  async getPhotoFile(userId) {
    try {
      if (!userId) throw new Error('User ID is required');
      const response = await httpClient.get(`/kyc/${userId}/photo`);

      return openFileUrl(response?.data, 'Photo file is not available');
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to open photo file'));
    }
  },

  async getCurrentFoodMenu() {
    try {
      const response = await httpClient.get('/food-menu/current');
      return unwrapObject(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load food menu'));
    }
  },

  async getFoodMenuHistory() {
    try {
      const response = await httpClient.get('/food-menu/history');
      return unwrapList(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load food menu history'));
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

export default tenantApi;
