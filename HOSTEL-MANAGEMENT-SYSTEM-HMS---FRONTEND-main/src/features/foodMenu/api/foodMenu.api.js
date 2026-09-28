import { httpClient, uploadClient } from '../../../lib/axios/apiClient';
import { cleanText, unwrapList, unwrapObject, unwrapMessage } from '../../../lib/api/normalizeResponse';
import { getApiErrorMessage } from '../../../lib/axios/apiClient';


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
const buildFoodMenuFormData = (values = {}) => {
  const formData = new FormData();

  const branchId = values.branchId ?? values.branch?.id;
  if (branchId) formData.append('branchId', String(branchId));

  const title = cleanText(values.title || values.name || values.menuTitle);
  if (title) formData.append('title', title);

  const description = cleanText(values.description || values.note || values.notes);
  if (description) formData.append('description', description);

  const weekStartDate = cleanText(
    values.week_start_date || values.weekStartDate || values.menuDate || values.date
  );
  if (weekStartDate) formData.append('week_start_date', weekStartDate);

  const file = values.file || values.menuFile || values.image || values.menuImage;
  if (file) formData.append('file', file);

  return formData;
};

export const foodMenuApi = {
  async create(values = {}) {
    try {
      const response = await uploadClient.post('/food-menu', buildFoodMenuFormData(values));
      return unwrapObject(response.data);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to upload food menu'));
    }
  },

  async getCurrent() {
    try {
      const response = await httpClient.get('/food-menu/current');
      return unwrapObject(response.data);
    } catch (error) {
      if (isFoodMenuEmptyError(error)) return {};
      throw new Error(getApiErrorMessage(error, 'Failed to load current food menu'));
    }
  },

  async getHistory() {
    try {
      const response = await httpClient.get('/food-menu/history');
      return unwrapList(response.data);
    } catch (error) {
      if (isFoodMenuEmptyError(error)) return [];
      throw new Error(getApiErrorMessage(error, 'Failed to load food menu history'));
    }
  },

  async delete(menuId) {
    try {
      if (!menuId) throw new Error('Menu ID is required');
      const response = await httpClient.delete(`/food-menu/${menuId}`);
      return { success: true, message: unwrapMessage(response.data, 'Food menu deleted successfully') };
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Failed to delete food menu'));
    }
  },
};

export default foodMenuApi;
