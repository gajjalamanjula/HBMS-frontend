import { getApiErrorMessage, httpClient } from '../../../lib/axios/apiClient';
import {
  cleanParams,
  cleanText,
  unwrapData,
  unwrapList,
  unwrapObject,
} from '../../../lib/api/normalizeResponse';
import { mapPayment, mapPaymentList } from '../mappers/payment.mapper';
import { openSafeUrl, resolveBackendFileUrl } from '../../../lib/url/safeUrl';

function readUrl(payload) {
  const data = unwrapData(payload);

  if (typeof data === 'string') return data;
  if (data && typeof data === 'object') {
    return (
      data.url ||
      data.invoiceUrl ||
      data.fileUrl ||
      data.presignedUrl ||
      data.downloadUrl ||
      ''
    );
  }

  return '';
}

function readOrder(payload) {
  const data = unwrapData(payload);

  if (typeof data === 'string') {
    return {
      orderId: data,
      raw: data,
    };
  }

  if (data && typeof data === 'object') {
    return {
      orderId: data.orderId || data.razorpayOrderId || data.id || data.order_id || '',
      amount: Number(data.amount || 0),
      currency: data.currency || 'INR',
      paymentUrl: data.paymentUrl || data.url || '',
      raw: data,
    };
  }

  return {
    orderId: '',
    raw: data,
  };
}

export const paymentsApi = {
  async getAll(params = {}) {
    try {
      const safeParams = cleanParams(params);

      if (safeParams.tenantId) {
        return this.getTenantPayments(safeParams.tenantId);
      }

      if (safeParams.branchId) {
        return this.getPaymentDues(safeParams.branchId, safeParams);
      }

      throw new Error('tenantId or branchId is required to load payments.');
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load payments'));
    }
  },

  async getById() {
    throw new Error('Payment details are not available. Use the payment list instead.');
  },

  async getTenantPayments(tenantId) {
    try {
      if (!tenantId) throw new Error('Tenant ID is required');
      const response = await httpClient.get(`/payments/tenant/${tenantId}`);
      return mapPaymentList(unwrapList(response.data));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load tenant payments'));
    }
  },

  async getPaymentDues(branchId, params = {}) {
    try {
      if (!branchId) throw new Error('Branch ID is required');
      const response = await httpClient.get(`/payments/due/${branchId}`, {
        params: cleanParams(params),
      });
      return mapPaymentList(unwrapList(response.data));
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load payment dues'));
    }
  },

  async getPaymentSummary(branchId) {
    try {
      if (!branchId) throw new Error('Branch ID is required');
      const response = await httpClient.get(`/payments/summary/${branchId}`);
      return unwrapObject(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to load payment summary'));
    }
  },

  async recordCashPayment(values = {}) {
    try {
      const response = await httpClient.post('/payments/cash', {
        tenantId: cleanText(values.tenantId),
        amount: Number(values.amount),
        month: cleanText(values.month),
        paymentDate: cleanText(values.paymentDate),
        note: cleanText(values.note),
      });
      return unwrapObject(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to record cash payment'));
    }
  },

  async initiateOnlinePayment(values = {}) {
    try {
      const amount = Number(values.amount || values.payableNow || values.dueAmount || 0);
      if (!amount || amount <= 0) {
        throw new Error('Payment amount is required');
      }

      const response = await httpClient.post('/payments/online/initiate', {
        paymentId: cleanText(values.paymentId || values.id),
        invoiceId: cleanText(values.invoiceId),
        tenantId: cleanText(values.tenantId),
        month: cleanText(values.month || values.billingMonth),
        amount,
      });
      const order = readOrder(response.data);

      return {
        ...order,
        amount,
        message: response.data?.message || 'Online payment order created successfully',
      };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to initiate online payment'));
    }
  },

  async downloadInvoice(paymentId) {
    try {
      if (!paymentId) throw new Error('Payment ID is required');
      const response = await httpClient.get(`/payments/invoice/${paymentId}`);
      const invoiceUrl = resolveBackendFileUrl(readUrl(response.data), { allowHttp: false });

      if (!invoiceUrl) {
        throw new Error('Invoice is not available right now.');
      }

      if (!openSafeUrl(invoiceUrl, '_blank', { allowHttp: false })) {
        throw new Error('Invoice is not available right now.');
      }

      return { success: true, id: paymentId, invoiceUrl, message: 'Invoice opened successfully' };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to open invoice'));
    }
  },

  mapPayment,
};

export default paymentsApi;
