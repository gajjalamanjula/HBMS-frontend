import { z } from 'zod';
import {
  commonSchemas,
  DOCUMENT_TYPES,
  fileSchema,
} from '../../../lib/validation/commonSchemas';
 
export const createOwnerSchema = z.object({
  name: commonSchemas.name,
 
  email: commonSchemas.email,
 
  phone: commonSchemas.phone,
 
  aadhaarNumber: commonSchemas.aadhaarNumber,
 
  branchId: z
    .string()
    .trim()
    .optional()
    .or(z.literal('')),
 
  aadhaarPhoto: fileSchema({
    required: false,
    label: 'Aadhaar photo',
    maxSizeMB: 5,
    allowedTypes: DOCUMENT_TYPES,
  }),
});
 
export const updateOwnerSchema = z.object({
  name: commonSchemas.name,
 
  phone: commonSchemas.phone,
});
 
export const verifyOwnerOtpSchema = z.object({
  email: commonSchemas.email,
 
  otp: z
    .string()
    .trim()
    .min(4, 'Verification code is required')
    .max(8, 'Verification code is too long'),
});
 
