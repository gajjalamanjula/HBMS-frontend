import { z } from 'zod';

export const MB = 1024 * 1024;
export const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
export const DOCUMENT_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

export function getFirstFile(value) {
  if (!value) return null;
  if (typeof File !== 'undefined' && value instanceof File) return value;
  if (typeof FileList !== 'undefined' && value instanceof FileList) return value[0] || null;
  if (Array.isArray(value)) return value[0] || null;
  return null;
}

export function fileSchema({ required = true, maxSizeMB = 5, allowedTypes = DOCUMENT_TYPES, label = 'File' } = {}) {
  let schema = z.any();
  schema = schema.refine((value) => {
    const file = getFirstFile(value);
    return required ? Boolean(file) : true;
  }, `${label} is required`);
  schema = schema.refine((value) => {
    const file = getFirstFile(value);
    if (!file) return true;
    return file.size <= maxSizeMB * MB;
  }, `${label} size must be less than ${maxSizeMB}MB`);
  schema = schema.refine((value) => {
    const file = getFirstFile(value);
    if (!file || !allowedTypes?.length) return true;
    return allowedTypes.includes(file.type);
  }, `Only ${allowedTypes.includes('application/pdf') ? 'JPG, PNG, WebP, or PDF' : 'JPG, PNG, or WebP'} files are allowed`);
  return schema;
}

export const commonSchemas = {
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required').min(8, 'Minimum 8 characters required'),
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(80, 'Name is too long'),
  phone: z.string().trim().regex(/^[0-9]{10}$/, 'Phone number must be exactly 10 digits'),
  aadhaarNumber: z.string().trim().regex(/^[0-9]{12}$/, 'Aadhaar number must be exactly 12 digits'),
  uuid: z.string().trim().min(1, 'Selection is required'),
  amount: z.coerce.number({ invalid_type_error: 'Amount must be a number' }).positive('Amount must be greater than 0'),
  date: z.string().trim().min(1, 'Date is required'),
  optionalText: z.string().trim().optional().or(z.literal('')),
};
