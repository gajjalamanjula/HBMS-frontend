import { getApiErrorMessage, httpClient } from '../../../lib/axios/apiClient';
import {
  normalizeAnnouncement,
  normalizeAnnouncements,
  normalizeCommunicationMessage,
  normalizeNotifications,
} from '../utils/communicationMappers';

function assertId(value, label) {
  if (!String(value || '').trim()) throw new Error(`${label} is required`);
}

export const communicationApi = {
  async getAnnouncements(params = {}) {
    try {
      const requestParams = {};
      if (params.branchId) requestParams.branchId = String(params.branchId);

      const response = await httpClient.get('/announcements', { params: requestParams });
      return normalizeAnnouncements(response.data);
    } catch (error) {
      const message = getApiErrorMessage(error, 'Failed to load announcements');
      if (/not assigned to branch|branch/i.test(message) && error?.response?.status === 400) return [];
      throw new Error(message);
    }
  },

  async createAnnouncement(payload = {}) {
    try {
      const body = {
        title: String(payload.title || '').trim(),
        message: String(payload.message || '').trim(),
      };

      if (payload.branchId) {
        body.branchId = String(payload.branchId);
      }

      const response = await httpClient.post('/announcements', body);

      return {
        announcement: normalizeAnnouncement({ ...payload, ...body }),
        message: normalizeCommunicationMessage(response.data, 'Announcement created successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create announcement'));
    }
  },

  async deleteAnnouncement(payload) {
    const id = typeof payload === 'object' && payload !== null ? payload.id : payload;
    const branchId = typeof payload === 'object' && payload !== null ? payload.branchId : '';
    assertId(id, 'Announcement ID');

    try {
      const response = await httpClient.delete(`/announcements/${id}`);
      return {
        id,
        branchId: response.data?.branchId || branchId,
        message: normalizeCommunicationMessage(response.data, 'Announcement deleted successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete announcement'));
    }
  },

  async getNotifications(userId) {
    assertId(userId, 'User ID');

    try {
      const response = await httpClient.get(`/notifications/${userId}`);
      return normalizeNotifications(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load notifications'));
    }
  },

  async getUnreadCount(userId) {
    assertId(userId, 'User ID');

    try {
      const response = await httpClient.get('/notifications/unread-count', {
        params: { userId },
      });

      return Number(response.data || 0);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load unread count'));
    }
  },

  async markNotificationRead(id) {
    assertId(id, 'Notification ID');

    try {
      await httpClient.put(`/notifications/${id}/read`);
      return { id, message: 'Notification marked as read' };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to mark notification as read'));
    }
  },

  async markAllNotificationsRead(userId) {
    assertId(userId, 'User ID');

    try {
      await httpClient.put('/notifications/read-all', null, {
        params: { userId },
      });

      return { message: 'All notifications marked as read' };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to mark all notifications as read'));
    }
  },

  async deleteNotification(id) {
    assertId(id, 'Notification ID');

    try {
      await httpClient.delete(`/notifications/${id}`);
      return { id, message: 'Notification deleted' };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete notification'));
    }
  },

  async clearNotifications(userId) {
    assertId(userId, 'User ID');

    try {
      await httpClient.delete('/notifications/clear-all', {
        params: { userId },
      });

      return { message: 'Notifications cleared' };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to clear notifications'));
    }
  },
};

export default communicationApi;
