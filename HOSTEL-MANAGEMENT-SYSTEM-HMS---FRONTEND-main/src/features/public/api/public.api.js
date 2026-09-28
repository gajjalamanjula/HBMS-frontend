import { getApiErrorMessage, httpClient } from '../../../lib/axios/apiClient';
import {
  buildPublicBookingPayload,
  buildPublicRegisterPayload,
  normalizeBedResponse,
  normalizeBookingResponse,
  normalizeBranchResponse,
  normalizePaymentResponse,
  normalizePublicRegisterResponse,
  normalizeRoomAvailabilityResponse,
} from '../utils/publicMappers';

function assertId(value, label) {
  if (!String(value || '').trim()) {
    throw new Error(`${label} is required`);
  }
}

const EMPTY_LIST_PATTERNS = [
  /no\s+rooms?/i,
  /rooms?\s+not\s+found/i,
  /no\s+beds?/i,
  /beds?\s+not\s+found/i,
  /no\s+data\s+found/i,
  /not\s+available/i,
  /empty/i,
];

function readErrorMessage(error) {
  const payload = error?.response?.data;

  if (typeof payload === 'string') return payload;
  if (payload && typeof payload === 'object') {
    return (
      payload.message ||
      payload.error ||
      payload.details ||
      payload.title ||
      payload.data ||
      ''
    );
  }

  return error?.message || '';
}

function isKnownEmpty404(error) {
  if (error?.response?.status !== 404) return false;

  const message = String(readErrorMessage(error) || '').trim();
  if (!message) return false;

  return EMPTY_LIST_PATTERNS.some((pattern) => pattern.test(message));
}

function throwPublicApiError(error, fallback) {
  const publicError = new Error(getApiErrorMessage(error, fallback));
  publicError.status = error?.response?.status;
  publicError.originalError = error;
  throw publicError;
}

export const publicApi = {
  async getPublicBranches() {
    try {
      const response = await httpClient.get('/public/branches');
      return normalizeBranchResponse(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Unable to load branches'));
    }
  },

  async getPublicBranchRooms(branchId) {
    assertId(branchId, 'Branch ID');

    try {
      const response = await httpClient.get(`/public/branches/${branchId}/rooms`);
      return normalizeRoomAvailabilityResponse(response.data);
    } catch (error) {
      if (isKnownEmpty404(error)) return [];
      throwPublicApiError(error, 'Unable to load branch rooms');
    }
  },

  async getPublicBranchBeds(branchId) {
    assertId(branchId, 'Branch ID');

    try {
      const response = await httpClient.get(`/public/branches/${branchId}/beds`);
      return normalizeBedResponse(response.data);
    } catch (error) {
      if (isKnownEmpty404(error)) return [];
      throwPublicApiError(error, 'Unable to load branch beds');
    }
  },

  async getPublicRoomBeds(roomId) {
    assertId(roomId, 'Room ID');

    try {
      const response = await httpClient.get(`/public/rooms/${roomId}/beds`);
      return normalizeBedResponse(response.data);
    } catch (error) {
      if (isKnownEmpty404(error)) return [];
      throwPublicApiError(error, 'Unable to load room beds');
    }
  },

  async createPublicBooking(payload = {}) {
    try {
      const response = await httpClient.post(
        '/public/book',
        buildPublicBookingPayload(payload)
      );
      return normalizeBookingResponse(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Booking request failed'));
    }
  },

  async publicRegister(payload = {}) {
    try {
      const response = await httpClient.post(
        '/public/register',
        buildPublicRegisterPayload(payload)
      );
      return normalizePublicRegisterResponse(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Registration failed'));
    }
  },

  async payFullBooking(bookingId) {
    assertId(bookingId, 'Booking ID');

    try {
      const response = await httpClient.post(`/public/pay-full/${bookingId}`);
      return normalizePaymentResponse(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Full payment failed'));
    }
  },
};

export default publicApi;
