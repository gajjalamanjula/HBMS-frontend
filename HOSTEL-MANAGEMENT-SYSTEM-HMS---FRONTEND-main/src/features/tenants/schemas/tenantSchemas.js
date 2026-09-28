import { z } from 'zod';
import {
  commonSchemas,
  DOCUMENT_TYPES,
  fileSchema,
  getFirstFile,
  IMAGE_TYPES,
} from '../../../lib/validation/commonSchemas';

const KYC_MAX_SIZE_MB = 5;

export const createTenantComplaintSchema = z.object({
  category: z.string().trim().min(2, 'Category is required').max(60, 'Category is too long'),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH'], { required_error: 'Priority is required' }),
  description: z.string().trim().min(10, 'Please describe the issue clearly').max(500, 'Description is too long'),
});

const aadhaarKycFileSchema = ({ required = true } = {}) =>
  fileSchema({
    required,
    label: 'Aadhaar file',
    maxSizeMB: KYC_MAX_SIZE_MB,
    allowedTypes: DOCUMENT_TYPES,
  });

const photoKycFileSchema = ({ required = true } = {}) =>
  fileSchema({
    required,
    label: 'Photo file',
    maxSizeMB: KYC_MAX_SIZE_MB,
    allowedTypes: IMAGE_TYPES,
  });

export const uploadTenantKycSchema = z.object({
  aadhaarFile: aadhaarKycFileSchema(),
  photoFile: photoKycFileSchema(),
});

export const changeTenantPasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] })
  .refine((values) => values.currentPassword !== values.newPassword, { message: 'New password must be different from current password', path: ['newPassword'] });

export const updateTenantKycSchema = z
  .object({
    aadhaarFile: aadhaarKycFileSchema({ required: false }),
    photoFile: photoKycFileSchema({ required: false }),
  })
  .refine(
    (values) => Boolean(getFirstFile(values.aadhaarFile) || getFirstFile(values.photoFile)),
    {
      message: 'Upload at least one KYC document',
      path: ['aadhaarFile'],
    }
  );
