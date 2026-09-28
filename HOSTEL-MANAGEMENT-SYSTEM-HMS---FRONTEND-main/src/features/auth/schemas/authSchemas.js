import { z } from 'zod';
import { commonSchemas } from '../../../lib/validation/commonSchemas';

export const loginSchema = z.object({
  email: commonSchemas.email,
  password: commonSchemas.password,
});

export const forgotPasswordSchema = z.object({ email: commonSchemas.email });

export const resetPasswordSchema = z
  .object({
    email: commonSchemas.email,
    otp: z.string().trim().min(1, 'Verification code is required'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((value) => value.newPassword === value.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords do not match',
  });

export const verifyOtpSchema = z.object({
  email: commonSchemas.email,
  otp: z.string().trim().min(1, 'Verification code is required'),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z.string().min(1, 'Current password is required'),
    newPassword: commonSchemas.password,
    confirmPassword: z.string().min(1, 'Confirm password is required'),
  })
  .refine((value) => value.newPassword === value.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' })
  .refine((value) => value.oldPassword !== value.newPassword, { path: ['newPassword'], message: 'New password must be different from current password' });

export const registerSchema = z.object({
  email: commonSchemas.email,
  otp: z
    .string()
    .trim()
    .min(4, 'Verification code is required')
    .max(8, 'Verification code is too long')
    .optional()
    .or(z.literal('')),
  password: commonSchemas.password.optional().or(z.literal('')),
});
