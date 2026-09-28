import { z } from 'zod';
import {
  commonSchemas,
  DOCUMENT_TYPES,
  IMAGE_TYPES,
  fileSchema,
  getFirstFile,
} from '../../../lib/validation/commonSchemas';

export const staffComplaintStatusSchema = z
  .object({
    status: z.enum(['IN_PROGRESS', 'RESOLVED'], {
      required_error: 'Select status',
    }),
    resolutionNote: z.string().trim().max(500, 'Resolution note is too long').optional(),
  })
  .superRefine((values, ctx) => {
    if (values.status === 'RESOLVED' && !String(values.resolutionNote || '').trim()) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['resolutionNote'],
        message: 'Resolution note is required when resolving a complaint',
      });
    }
  });

export const staffKycUploadSchema = z.object({
  aadhaarFile: fileSchema({ label: 'Aadhaar file', maxSizeMB: 5, allowedTypes: DOCUMENT_TYPES }),
  photoFile: fileSchema({ label: 'Profile photo', maxSizeMB: 5, allowedTypes: IMAGE_TYPES }),
});

export const staffKycUpdateSchema = z
  .object({
    aadhaarFile: fileSchema({
      label: 'Aadhaar file',
      required: false,
      maxSizeMB: 5,
      allowedTypes: DOCUMENT_TYPES,
    }),
    photoFile: fileSchema({
      label: 'Profile photo',
      required: false,
      maxSizeMB: 5,
      allowedTypes: IMAGE_TYPES,
    }),
  })
  .superRefine((values, ctx) => {
    if (!getFirstFile(values.aadhaarFile) && !getFirstFile(values.photoFile)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['aadhaarFile'],
        message: 'Upload at least one KYC document to update',
      });
    }
  });

export const staffChangePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((values) => values.newPassword === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })
  .refine((values) => values.currentPassword !== values.newPassword, {
    message: 'New password must be different from current password',
    path: ['newPassword'],
  });
