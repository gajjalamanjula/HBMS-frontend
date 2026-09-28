import { getApiErrorMessage, httpClient, uploadClient } from '../../../lib/axios/apiClient';
import complaintsApi from '../../complaints/api/complaints.api';
import {
  buildAssignBedPayload,
  buildBedStatusPayload,
  buildCashPaymentPayload,
  buildCreateRoomFormData,
  buildCreateRoomPayload,
  buildFoodMenuFormData,
  buildManagerUserFormData,
  buildUpdateStaffPayload,
  normalizeManagerBedList,
  normalizeManagerBedStats,
  normalizeManagerComplaints,
  normalizeManagerCounts,
  normalizeManagerDashboard,
  normalizeManagerFoodMenu,
  normalizeManagerFoodMenuHistory,
  normalizeManagerMessage,
  normalizeManagerPaymentList,
  normalizeManagerPaymentSummary,
  normalizeManagerRooms,
  normalizeManagerStaffList,
  normalizeManagerTenants,
} from '../utils/managerMappers';


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

export const managerApi = {
  async createStaff(payload = {}) {
    try {
      const response = await uploadClient.post(
        '/auth/manager/create-staff',
        buildManagerUserFormData(payload)
      );
      return {
        email: payload.email,
        name: payload.name,
        message: normalizeManagerMessage(response.data, `Staff ${payload.name || ''} created successfully`.trim()),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create staff'));
    }
  },

  async createTenant(payload = {}) {
    try {
      const response = await uploadClient.post(
        '/auth/manager/create-tenant',
        buildManagerUserFormData(payload)
      );
      return {
        email: payload.email,
        name: payload.name,
        message: normalizeManagerMessage(response.data, `Tenant ${payload.name || ''} created successfully`.trim()),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create tenant'));
    }
  },

  async verifyManagerOtp({ email, otp } = {}) {
    const payload = {
      email: String(email || '').trim(),
      otp: String(otp || '').trim(),
    };

    try {
      let response;
      try {
        response = await httpClient.post('/auth/manager/verify-otp', payload);
      } catch {
        response = await httpClient.post('/auth/manager/verify-otp', null, {
          params: payload,
        });
      }
      return {
        email,
        message: normalizeManagerMessage(response.data, 'OTP verified successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to verify OTP'));
    }
  },

  async getManagerDashboard() {
    try {
      const response = await httpClient.get('/auth/manager/dashboard');
      return normalizeManagerDashboard(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load manager dashboard'));
    }
  },

  async getManagerCounts() {
    try {
      const response = await httpClient.get('/auth/manager/counts');
      return normalizeManagerCounts(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load manager counts'));
    }
  },

  async getManagerStaff() {
    try {
      const response = await httpClient.get('/auth/manager/staff');
      return normalizeManagerStaffList(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load manager staff'));
    }
  },

  async updateStaff(id, payload = {}) {
    assertId(id, 'Staff ID');

    try {
      const response = await httpClient.put(
        `/auth/manager/staff/${id}`,
        buildUpdateStaffPayload(payload)
      );
      return {
        id,
        name: payload.name,
        message: normalizeManagerMessage(response.data, `Staff ${payload.name || ''} updated successfully`.trim()),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update staff'));
    }
  },

  async deleteStaff(id) {
    assertId(id, 'Staff ID');

    try {
      const response = await httpClient.delete(`/auth/manager/staff/${id}`);
      return {
        id,
        message: normalizeManagerMessage(response.data, 'Staff deleted successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete staff'));
    }
  },

  async getManagerTenants() {
    try {
      const response = await httpClient.get('/auth/manager/tenants');
      return normalizeManagerTenants(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load manager tenants'));
    }
  },

  async checkoutTenant(id) {
    assertId(id, 'Tenant ID');

    try {
      const response = await httpClient.post(`/auth/manager/tenants/${id}/checkout`);
      return {
        id,
        message: normalizeManagerMessage(response.data, 'Tenant checked out successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to checkout tenant'));
    }
  },

  async getManagerRooms() {
    try {
      const response = await httpClient.get('/auth/manager/rooms');
      return normalizeManagerRooms(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load manager rooms'));
    }
  },

  async createManagerRoom(payload = {}) {
    try {
      const response = await httpClient.post(
        '/auth/manager/rooms',
        buildCreateRoomPayload(payload)
      );
      return {
        roomNumber: payload.roomNumber,
        message: normalizeManagerMessage(response.data, `Room ${payload.roomNumber || ''} created successfully`.trim()),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create manager room'));
    }
  },

  async updateManagerBedStatus(id, status) {
    assertId(id, 'Bed ID');
    assertId(status, 'Bed status');

    try {
      const response = await httpClient.patch(`/auth/manager/beds/${id}/status`, null, {
        params: { status },
      });
      return {
        id,
        status,
        message: normalizeManagerMessage(response.data, 'Bed status updated successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to update bed status'));
    }
  },

  async getManagerComplaints() {
    try {
      const response = await httpClient.get('/complaints');
      return normalizeManagerComplaints(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load manager complaints'));
    }
  },

  async assignManagerComplaint(id, staffId) {
    assertId(id, 'Complaint ID');
    assertId(staffId, 'Staff ID');

    try {
      const result = await complaintsApi.assign(id, staffId);
      return {
        id,
        staffId,
        message: result.message || 'Complaint assigned successfully',
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to assign complaint'));
    }
  },

  async getRooms() {
    try {
      const response = await httpClient.get('/rooms');
      return normalizeManagerRooms(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load rooms'));
    }
  },

  async createRoom(payload = {}) {
    try {
      const response = await uploadClient.post('/rooms', buildCreateRoomFormData(payload));
      return {
        roomNumber: payload.roomNumber,
        message: normalizeManagerMessage(response.data, `Room ${payload.roomNumber || ''} created successfully`.trim()),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to create room'));
    }
  },

  async getAvailableBeds() {
    try {
      const response = await httpClient.get('/beds/available');
      return normalizeManagerBedList(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load available beds'));
    }
  },

  async assignBed(payload = {}) {
    try {
      const response = await httpClient.post('/beds/assign', buildAssignBedPayload(payload));
      return {
        bedId: payload.bedId,
        tenantId: payload.tenantId,
        message: normalizeManagerMessage(response.data, 'Bed assigned successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to assign bed'));
    }
  },

  async updateBedStatus(id, status) {
  assertId(id, 'Bed ID');
  assertId(status, 'Bed status');

  try {
    const response = await httpClient.patch(
      `/auth/manager/beds/${id}/status`,
      null,
      {
        params: {
          status,
        },
      }
    );

    return {
      id,
      status,
      message: normalizeManagerMessage(
        response.data,
        'Bed status updated successfully'
      ),
    };
  } catch (error) {
    throw new Error(
      getApiErrorMessage(error, 'Failed to update bed status')
    );
  }
},

  async getBedStats() {
    try {
      const response = await httpClient.get('/beds/stats');
      return normalizeManagerBedStats(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load bed stats'));
    }
  },

  async uploadFoodMenu(payload = {}) {
    try {
      const response = await uploadClient.post('/food-menu', buildFoodMenuFormData(payload));
      return {
        message: normalizeManagerMessage(response.data, 'Food menu uploaded successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to upload food menu'));
    }
  },

  async getCurrentFoodMenu() {
    try {
      const response = await httpClient.get('/food-menu/current');
      return normalizeManagerFoodMenu(response.data);
    } catch (error) {
      if (isFoodMenuEmptyError(error)) return normalizeManagerFoodMenu({});
      throw new Error(getApiErrorMessage(error, 'Failed to load current food menu'));
    }
  },

  async getFoodMenuHistory() {
    try {
      const response = await httpClient.get('/food-menu/history');
      return normalizeManagerFoodMenuHistory(response.data);
    } catch (error) {
      if (isFoodMenuEmptyError(error)) return [];
      throw new Error(getApiErrorMessage(error, 'Failed to load food menu history'));
    }
  },

  async deleteFoodMenu(id) {
    assertId(id, 'Food menu ID');

    try {
      const response = await httpClient.delete(`/food-menu/${id}`);
      return {
        id,
        message: normalizeManagerMessage(response.data, 'Food menu deleted successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete food menu'));
    }
  },

  async recordCashPayment(payload = {}) {
    try {
      const response = await httpClient.post('/payments/cash', buildCashPaymentPayload(payload));
      return {
        tenantId: payload.tenantId,
        branchId: payload.branchId,
        amount: payload.amount,
        message: normalizeManagerMessage(response.data, 'Cash payment recorded successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to record cash payment'));
    }
  },

  async getPaymentDues(branchId) {
    assertId(branchId, 'Branch ID');

    try {
      const response = await httpClient.get(`/payments/due/${branchId}`);
      return normalizeManagerPaymentList(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load payment dues'));
    }
  },

  async getPaymentSummary(branchId) {
    assertId(branchId, 'Branch ID');

    try {
      const response = await httpClient.get(`/payments/summary/${branchId}`);
      return normalizeManagerPaymentSummary(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load payment summary'));
    }
  },

  async getInvoice(id) {
    assertId(id, 'Payment ID');

    try {
      const response = await httpClient.get(`/payments/invoice/${id}`);
      return {
        id,
        invoice: response.data,
        message: normalizeManagerMessage(response.data, 'Invoice loaded successfully'),
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load invoice'));
    }
  },
};

export default managerApi;
