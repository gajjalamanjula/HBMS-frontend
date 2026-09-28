import { getSafeApiErrorMessage } from '../api/getErrorMessage';

const FIELD_ALIASES = {
  email: ['email', 'mail'],
  phone: ['phone', 'mobile', 'contact'],
  password: ['password'],
  newPassword: ['new password', 'newpassword'],
  oldPassword: ['old password', 'current password', 'oldpassword'],
  name: ['name'],
  branchId: ['branch', 'branchid'],
  aadhaarNumber: ['aadhaar', 'aadhar', 'aadhaar number', 'aadharnumber'],
  aadhaarPhoto: ['aadhaar photo', 'aadhaar file', 'aadhaarphoto'],
  amount: ['amount', 'payment'],
};

function normalize(value) {
  return String(value || '').toLowerCase().replace(/[_-]+/g, ' ').trim();
}

function extractFieldErrors(payload) {
  if (!payload || typeof payload !== 'object') return [];
  if (Array.isArray(payload.errors)) {
    return payload.errors.map((item) => ({ field: item.field || item.name || item.path, message: item.message || item.defaultMessage || item.error })).filter((item) => item.field && item.message);
  }
  if (payload.fieldErrors && typeof payload.fieldErrors === 'object') {
    return Object.entries(payload.fieldErrors).map(([field, message]) => ({ field, message: Array.isArray(message) ? message[0] : message }));
  }
  if (payload.errors && typeof payload.errors === 'object') {
    return Object.entries(payload.errors).map(([field, message]) => ({ field, message: Array.isArray(message) ? message[0] : message }));
  }
  return [];
}

export function mapServerErrorsToForm(error, setError, fieldNames = []) {
  const payload = error?.response?.data;
  const fieldErrors = extractFieldErrors(payload);
  let mapped = false;

  fieldErrors.forEach(({ field, message }) => {
    if (fieldNames.includes(field)) {
      setError(field, { type: 'server', message: String(message) });
      mapped = true;
    }
  });

  const safeMessage = getSafeApiErrorMessage(error, 'Unable to submit form. Please try again.');
  const normalizedMessage = normalize(safeMessage);

  if (!mapped && normalizedMessage) {
    for (const fieldName of fieldNames) {
      const aliases = FIELD_ALIASES[fieldName] || [fieldName];
      if (aliases.some((alias) => normalizedMessage.includes(normalize(alias)))) {
        setError(fieldName, { type: 'server', message: safeMessage });
        mapped = true;
        break;
      }
    }
  }

  return { mapped, message: safeMessage };
}

export function setFormLevelError(setError, message) {
  setError('root.server', { type: 'server', message });
}
