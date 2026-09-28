import { getApiErrorMessage, httpClient } from '../../../lib/axios/apiClient';
import {
  normalizeBookingList,
  normalizeBookingMessage,
} from '../utils/bookingMappers';

function assertBookingId(value) {
  if (!String(value || '').trim()) {
    throw new Error('Booking ID is required');
  }
}

export const bookingsApi = {
  async getManagerBookings() {
    try {
      const response = await httpClient.get('/manager/bookings');
      return normalizeBookingList(response.data);
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to load manager bookings')
      );
    }
  },

  async approveBooking(bookingId) {
    assertBookingId(bookingId);

    try {
      const response = await httpClient.put(
        `/manager/bookings/${bookingId}/approve`
      );

      return {
        bookingId,
        message: normalizeBookingMessage(
          response.data,
          'Booking approved successfully'
        ),
      };
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to approve booking')
      );
    }
  },

  async rejectBooking(bookingId) {
    assertBookingId(bookingId);

    try {
      const response = await httpClient.put(
        `/manager/bookings/${bookingId}/reject`
      );

      return {
        bookingId,
        message: normalizeBookingMessage(
          response.data,
          'Booking rejected successfully'
        ),
      };
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to reject booking')
      );
    }
  },

  async checkoutBooking(bookingId) {
    assertBookingId(bookingId);

    try {
      const response = await httpClient.patch(
        `/manager/bookings/checkout/${bookingId}`
      );

      return {
        bookingId,
        message: normalizeBookingMessage(
          response.data,
          'Booking checked out successfully'
        ),
      };
    } catch (error) {
      throw new Error(
        getApiErrorMessage(error, 'Failed to checkout booking')
      );
    }
  },
};

export default bookingsApi;