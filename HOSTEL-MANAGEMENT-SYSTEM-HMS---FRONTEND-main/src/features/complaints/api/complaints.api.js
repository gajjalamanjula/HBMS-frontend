import { getApiErrorMessage, httpClient } from '../../../lib/axios/apiClient';
import {
  cleanParams,
  cleanText,
  unwrapList,
  unwrapObject,
  unwrapMessage,
} from '../../../lib/api/normalizeResponse';
import { mapComplaint, mapComplaintList } from '../mappers/complaint.mapper';

export const complaintsApi = {
  async getAll(params = {}) {
    try {
      const response = await httpClient.get('/complaints', {
        params: cleanParams(params),
      });

      return mapComplaintList(unwrapList(response.data));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load complaints'));
    }
  },

  async getById(complaintId) {
    try {
      if (!complaintId) throw new Error('Complaint ID is required');

      const response = await httpClient.get(`/complaints/${complaintId}`);

      return mapComplaint(unwrapObject(response.data));
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to load complaint details')
      );
    }
  },

  async create(payload = {}) {
    try {
      const response = await httpClient.post('/complaints', {
        category: cleanText(payload.category),
        priority: cleanText(payload.priority),
        description: cleanText(payload.description || payload.title),
      });

      return mapComplaint(unwrapObject(response.data));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create complaint'));
    }
  },

  async confirmClose(complaintId) {
    try {
      if (!complaintId) throw new Error('Complaint ID is required');

      const response = await httpClient.post(
        `/complaints/${complaintId}/confirm-close`
      );

      return {
        success: true,
        id: complaintId,
        message: unwrapMessage(
          response.data,
          'Complaint close confirmed successfully'
        ),
      };
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to confirm complaint close')
      );
    }
  },

  async assign(complaintId, staffId) {
    try {
      if (!complaintId) throw new Error('Complaint ID is required');
      if (!staffId) throw new Error('Staff ID is required');

      const response = await httpClient.put(
        `/complaints/${complaintId}/assign`,
        null,
        {
          params: { staffId },
        }
      );

      return {
        complaint: mapComplaint(unwrapObject(response.data)),
        message: unwrapMessage(
          response.data,
          'Complaint assigned successfully'
        ),
      };
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to assign complaint')
      );
    }
  },

  async updateStatus({ id, status, resolutionNote } = {}) {
    try {
      if (!id) throw new Error('Complaint ID is required');

      const response = await httpClient.put(
        `/complaints/${id}/status`,
        {
          status: cleanText(status),
          resolutionNote: cleanText(resolutionNote),
        }
      );

      return {
        complaint: mapComplaint(unwrapObject(response.data)),
        message: unwrapMessage(
          response.data,
          'Complaint status updated successfully'
        ),
      };
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to update complaint status')
      );
    }
  },

  async escalate(complaintId) {
    try {
      if (!complaintId) throw new Error('Complaint ID is required');

      const response = await httpClient.put(
        `/complaints/${complaintId}/escalate`
      );

      return {
        id: complaintId,
        message: unwrapMessage(
          response.data,
          'Complaint escalated successfully'
        ),
      };
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to escalate complaint')
      );
    }
  },

  mapComplaint,
};

export default complaintsApi;