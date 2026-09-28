import { getApiErrorMessage, httpClient } from '../../../lib/axios/apiClient';
import { unwrapList, unwrapMessage } from '../../../lib/api/normalizeResponse';
import { buildReviewPayload, mapReviewList } from './review.mapper';

const EMPTY_REVIEW_PATTERNS = [/no\s+reviews?/i, /reviews?\s+not\s+found/i, /no\s+data\s+found/i];

function assertId(value, label) {
  if (!String(value || '').trim()) {
    throw new Error(`${label} is required`);
  }
}

function readErrorMessage(error) {
  const payload = error?.response?.data;

  if (typeof payload === 'string') return payload;
  if (payload && typeof payload === 'object') {
    return payload.message || payload.error || payload.details || payload.title || '';
  }

  return error?.message || '';
}

function isSoftPublicReviewError(error) {
  const status = error?.response?.status;
  if (status === 403) return true;

  if (status !== 404) return false;

  const message = String(readErrorMessage(error) || '').trim();
  if (!message) return true;

  return EMPTY_REVIEW_PATTERNS.some((pattern) => pattern.test(message));
}

function throwReviewApiError(error, fallback) {
  const reviewError = new Error(getApiErrorMessage(error, fallback));
  reviewError.status = error?.response?.status;
  reviewError.originalError = error;
  throw reviewError;
}

export const reviewsApi = {
  async getByBranch(branchId, options = {}) {
    try {
      assertId(branchId, 'Branch ID');
      const response = await httpClient.get(`/reviews/branch/${branchId}`);
      return mapReviewList(unwrapList(response.data));
    } catch (error) {
      if (options.softFailPublicErrors && isSoftPublicReviewError(error)) {
        return [];
      }

      throwReviewApiError(error, 'Unable to load reviews');
    }
  },

  async addReview(data) {
    try {
      const response = await httpClient.post('/reviews', buildReviewPayload(data));
      return unwrapMessage(response.data, 'Review added successfully');
    } catch (error) {
      throwReviewApiError(error, 'Failed to add review');
    }
  },

  async updateReview(id, data) {
    try {
      assertId(id, 'Review ID');
      const response = await httpClient.put(`/reviews/${id}`, buildReviewPayload(data));
      return unwrapMessage(response.data, 'Review updated successfully');
    } catch (error) {
      throwReviewApiError(error, 'Failed to update review');
    }
  },

  async deleteReview(id) {
    try {
      assertId(id, 'Review ID');
      const response = await httpClient.delete(`/reviews/${id}`);
      return unwrapMessage(response.data, 'Review deleted successfully');
    } catch (error) {
      throwReviewApiError(error, 'Failed to delete review');
    }
  },
};

export function reviewError(error, fallback) {
  return getApiErrorMessage(error, fallback);
}

export default reviewsApi;
