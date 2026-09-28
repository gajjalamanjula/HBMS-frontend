export const OWNER_UPLOAD_LIMIT_BYTES = 5 * 1024 * 1024;
export const OWNER_AADHAAR_FILE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'application/pdf',
]);
export const OWNER_BRANCH_IMAGE_TYPES = new Set([
  'image/jpeg',
  'image/jpg',
  'image/png',
  'image/webp',
]);

export function getSingleUploadFile(value) {
  if (!value) return null;
  if (typeof File !== 'undefined' && value instanceof File) return value;
  if (typeof FileList !== 'undefined' && value instanceof FileList) return value[0] || null;
  if (Array.isArray(value)) return value[0] || null;
  return null;
}

export function getFileExtension(name = '') {
  const match = String(name || '').toLowerCase().match(/\.([a-z0-9]+)$/);
  return match ? match[1] : '';
}

export function isAllowedUploadFile(value, allowedTypes, allowedExtensions = []) {
  const file = getSingleUploadFile(value);
  if (!file) return false;

  const typeAllowed = allowedTypes.has(String(file.type || '').toLowerCase());
  const extensionAllowed = allowedExtensions.includes(getFileExtension(file.name));

  return typeAllowed && extensionAllowed;
}

export function isWithinOwnerUploadLimit(value) {
  const file = getSingleUploadFile(value);
  if (!file) return false;
  return Number(file.size || 0) <= OWNER_UPLOAD_LIMIT_BYTES;
}

export function hasSafeUploadFilename(value) {
  const file = getSingleUploadFile(value);
  if (!file) return false;
  const name = String(file.name || '').trim();
  return name.length > 0 && name.length <= 180 && !/[\\/]/.test(name);
}
