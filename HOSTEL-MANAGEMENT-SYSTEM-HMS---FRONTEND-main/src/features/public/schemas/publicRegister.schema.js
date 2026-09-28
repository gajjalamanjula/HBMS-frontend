import { z } from 'zod';
import { commonSchemas } from '../../../lib/validation/commonSchemas';

export const publicRegisterSchema = z
  .object({
    name: z.string().trim().min(1, 'Name is required'),
    email: commonSchemas.email,
    phone: commonSchemas.phone,
    password: commonSchemas.password,
    confirmPassword: z.string().min(1, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });
