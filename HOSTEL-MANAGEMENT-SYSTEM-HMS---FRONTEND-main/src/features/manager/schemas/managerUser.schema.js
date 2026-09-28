import { z } from 'zod';

export const MANAGER_UPLOAD_MAX_BYTES = 5 * 1024 * 1024;
const SAFE_FILE_NAME_PATTERN = /^[\w\-. ()]+$/;
const AADHAAR_FILE_TYPES = new Set(['image/jpeg', 'image/png', 'application/pdf']);
const AADHAAR_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf'];

function getFirstFile(value) {
  if (!value) return null;
  if (typeof File !== 'undefined' && value instanceof File) return value;
  if (typeof Blob !== 'undefined' && value instanceof Blob) return value;
  if (Array.isArray(value)) return value[0] || null;
  if (typeof FileList !== 'undefined' && value instanceof FileList) return value[0] || null;
  if (typeof value === 'object' && value.name) return value;
  return null;
}

export function isAllowedManagerFile(value, allowedTypes, allowedExtensions, maxBytes = MANAGER_UPLOAD_MAX_BYTES) {
  const file = getFirstFile(value);
  if (!file) return false;

  const name = String(file.name || '').trim();
  const lowerName = name.toLowerCase();
  const type = String(file.type || '').toLowerCase();
  const size = Number(file.size || 0);

  return (
    Boolean(name) &&
    name.length <= 120 &&
    SAFE_FILE_NAME_PATTERN.test(name) &&
    allowedExtensions.some((extension) => lowerName.endsWith(extension)) &&
    (!type || allowedTypes.has(type)) &&
    size > 0 &&
    size <= maxBytes
  );
}

const aadhaarPhotoSchema = z
  .any()
  .refine((value) => Boolean(getFirstFile(value)), 'Aadhaar proof is required')
  .refine(
    (value) => isAllowedManagerFile(value, AADHAAR_FILE_TYPES, AADHAAR_EXTENSIONS),
    'Upload JPG, PNG, or PDF Aadhaar proof up to 5 MB with a safe filename'
  );

export const managerCreateUserSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().trim().regex(/^[0-9]{10}$/, 'Phone must be exactly 10 digits'),
  aadhaarNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{12}$/, 'Aadhaar must be 12 digits'),
  aadhaarPhoto: aadhaarPhotoSchema,
});

export const managerUpdateStaffSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().trim().regex(/^[0-9]{10}$/, 'Phone must be exactly 10 digits'),
});

export const managerOtpSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  otp: z.string().trim().min(1, 'Verification code is required'),
});
