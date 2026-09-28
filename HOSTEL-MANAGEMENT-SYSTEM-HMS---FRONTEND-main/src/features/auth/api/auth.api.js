import { httpClient } from '../../../lib/axios/apiClient';
import {
  normalizeAuthMessage,
  normalizeCurrentUserResponse,
  normalizeLoginResponse,
} from '../utils/authMappers';

const withBearer = (token) => {
  const cleanToken = String(token || '').trim();
  return cleanToken ? `Bearer ${cleanToken}` : '';
};

export const authApi = {
  async login(payload) {
    const response = await httpClient.post('/auth/login', payload);
    return normalizeLoginResponse(response.data);
  },

  async refreshToken(refreshToken) {
    const response = await httpClient.post('/auth/refresh-token', null, {
      preserveAuthorization: true,
      headers: {
        Authorization: withBearer(refreshToken),
      },
    });

    return normalizeLoginResponse(response.data);
  },

  async logout(refreshToken) {
    const response = await httpClient.post('/auth/logout', null, {
      preserveAuthorization: true,
      headers: refreshToken
        ? {
            Authorization: withBearer(refreshToken),
          }
        : undefined,
    });

    return normalizeAuthMessage(response.data, 'Logged out successfully');
  },

  async forgotPassword(payload) {
    const response = await httpClient.post('/auth/forgot-password', payload);
    return normalizeAuthMessage(response.data, 'If an account exists, reset instructions will be sent.');
  },

  async resetPassword(payload) {
    const response = await httpClient.post('/auth/reset-password', payload);
    return normalizeAuthMessage(response.data, 'Password reset successful');
  },

  async changePassword(payload) {
    const response = await httpClient.put('/auth/change-password', payload);
    return normalizeAuthMessage(response.data, 'Password changed successfully');
  },

  async getCurrentUser() {
    const response = await httpClient.get('/auth/me');
    return normalizeCurrentUserResponse(response.data);
  },

  async me() {
    return authApi.getCurrentUser();
  },

  async verifyOtp({ email, otp }) {
    const response = await httpClient.post('/auth/verify-otp', null, {
      params: {
        email: String(email || '').trim(),
        otp: String(otp || '').trim(),
      },
    });

    return normalizeAuthMessage(response.data, 'Verification code confirmed');
  },
};

export default authApi;
