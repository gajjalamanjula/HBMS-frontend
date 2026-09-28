import { z } from 'zod';
import {
  hasSafeUploadFilename,
  isAllowedUploadFile,
  isWithinOwnerUploadLimit,
  OWNER_AADHAAR_FILE_TYPES,
} from './ownerUploadValidation';

const aadhaarPhotoSchema = z
  .any()
  .refine((value) => Boolean(value), 'Aadhaar photo is required')
  .refine(
    (value) => isAllowedUploadFile(value, OWNER_AADHAAR_FILE_TYPES, ['jpg', 'jpeg', 'png', 'pdf']),
    'Aadhaar file must be JPG, PNG, or PDF'
  )
  .refine((value) => isWithinOwnerUploadLimit(value), 'Aadhaar file must be 5MB or smaller')
  .refine((value) => hasSafeUploadFilename(value), 'Aadhaar filename is invalid');

export const ownerUserSchema = z.object({
  userType: z.enum(['MANAGER', 'STAFF', 'TENANT']),
  email: z.string().trim().email('Enter a valid email'),
  name: z.string().trim().min(1, 'Name is required'),
  phone: z.string().trim().regex(/^[0-9]{10}$/, 'Phone must be exactly 10 digits'),
  aadhaarNumber: z
    .string()
    .trim()
    .regex(/^[0-9]{12}$/, 'Aadhaar must be 12 digits'),
  branchId: z.string().trim().min(1, 'Branch is required'),
  aadhaarPhoto: aadhaarPhotoSchema,
});

export const ownerOtpSchema = z.object({
  email: z.string().trim().email('Enter a valid email'),
  otp: z.string().trim().min(1, 'Verification code is required'),
});
