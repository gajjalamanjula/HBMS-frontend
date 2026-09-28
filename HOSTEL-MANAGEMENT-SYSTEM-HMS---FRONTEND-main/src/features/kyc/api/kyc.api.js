import { httpClient, uploadClient } from '../../../lib/axios/apiClient';
import { unwrapObject } from '../../../lib/api/normalizeResponse';
import { isAllowedBlob } from '../../../lib/url/safeUrl';
import { DOCUMENT_MIME_TYPES, IMAGE_MIME_TYPES } from '../../../lib/files/uploadRules';

function mapKyc(raw = {}) {
  const source = unwrapObject(raw);

  return {
    id: source?.id || source?.kycId || '',
    status: source?.status || source?.kycStatus || source?.verificationStatus || '',
    aadhaarFileName: source?.aadhaarFileName || source?.aadhaarName || '',
    photoFileName: source?.photoFileName || source?.profilePhotoName || '',
    aadhaarUrl: source?.aadhaarUrl || source?.aadhaarFileUrl || '',
    photoUrl: source?.photoUrl || source?.profilePhotoUrl || '',
    verified: source?.verified === true || source?.verified === 'true' || source?.verified === 1,
    raw: source,
  };
}

async function getBlob(endpoint, allowedTypes, fallbackFilename) {
  const response = await httpClient.get(endpoint, { responseType: 'blob' });

  if (!isAllowedBlob(response.data, allowedTypes)) {
    throw new Error(`${fallbackFilename} is empty or has an unsupported file type`);
  }

  return response.data;
}

export const kycApi = {
  async upload({ userId, aadhaarFile, photoFile }) {
    if (!userId) throw new Error('User ID is required');

    const formData = new FormData();
    formData.append('userId', userId);

    if (aadhaarFile) {
      formData.append('aadhaar_file', aadhaarFile);
    }

    if (photoFile) {
      formData.append('photo_file', photoFile);
    }

    const response = await uploadClient.post('/kyc/upload', formData);
    return mapKyc(response.data);
  },

  async getByUserId(userId) {
    if (!userId) throw new Error('User ID is required');

    const response = await httpClient.get(`/kyc/${userId}`);
    return mapKyc(response.data);
  },

  async getAadhaar(userId) {
    if (!userId) throw new Error('User ID is required');

    return getBlob(
      `/kyc/${userId}/aadhaar`,
      DOCUMENT_MIME_TYPES,
      'aadhaar-document'
    );
  },

  async getPhoto(userId) {
    if (!userId) throw new Error('User ID is required');

    return getBlob(
      `/kyc/${userId}/photo`,
      IMAGE_MIME_TYPES,
      'profile-photo'
    );
  },

  async update({ userId, aadhaarFile, photoFile }) {
    if (!userId) throw new Error('User ID is required');

    const formData = new FormData();
    formData.append('userId', userId);

    if (aadhaarFile) {
      formData.append('aadhaar_file', aadhaarFile);
    }

    if (photoFile) {
      formData.append('photo_file', photoFile);
    }

    const response = await uploadClient.post('/kyc/upload', formData);
    return mapKyc(response.data);
  },
};

export default kycApi;