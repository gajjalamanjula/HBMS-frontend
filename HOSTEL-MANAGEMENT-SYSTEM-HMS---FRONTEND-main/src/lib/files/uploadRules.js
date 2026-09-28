export const MAX_UPLOAD_SIZE_MB = 5;
export const MAX_UPLOAD_SIZE_BYTES = MAX_UPLOAD_SIZE_MB * 1024 * 1024;

export const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const DOCUMENT_MIME_TYPES = [...IMAGE_MIME_TYPES, 'application/pdf'];
export const MENU_MIME_TYPES = [...IMAGE_MIME_TYPES, 'application/pdf'];

export const uploadRules = {
  aadhaar: {
    label: 'Aadhaar file',
    maxSizeMB: MAX_UPLOAD_SIZE_MB,
    allowedTypes: DOCUMENT_MIME_TYPES,
  },
  profilePhoto: {
    label: 'Profile photo',
    maxSizeMB: MAX_UPLOAD_SIZE_MB,
    allowedTypes: IMAGE_MIME_TYPES,
  },
  foodMenu: {
    label: 'Food menu file',
    maxSizeMB: MAX_UPLOAD_SIZE_MB,
    allowedTypes: MENU_MIME_TYPES,
  },
  branchImage: {
    label: 'Branch image',
    maxSizeMB: MAX_UPLOAD_SIZE_MB,
    allowedTypes: IMAGE_MIME_TYPES,
  },
  roomImage: {
    label: 'Room image',
    maxSizeMB: MAX_UPLOAD_SIZE_MB,
    allowedTypes: IMAGE_MIME_TYPES,
  },
};

export function isAllowedUploadFile(file, rule) {
  if (!file) return false;
  const safeRule = rule || {};
  const allowedTypes = safeRule.allowedTypes || [];
  const maxBytes = (safeRule.maxSizeMB || MAX_UPLOAD_SIZE_MB) * 1024 * 1024;
  return file.size > 0 && file.size <= maxBytes && allowedTypes.includes(file.type);
}

export function sanitizeUploadFilename(name = 'file') {
  return String(name || 'file')
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_+/g, '_')
    .slice(0, 120);
}
