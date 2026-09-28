import { z } from 'zod';
import { isAllowedManagerFile, MANAGER_UPLOAD_MAX_BYTES } from './managerUser.schema';

const ROOM_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const ROOM_IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.webp'];

const optionalRoomImageSchema = z
  .any()
  .optional()
  .refine(
    (value) => {
      if (!value) return true;
      if (Array.isArray(value) && value.length === 0) return true;
      if (typeof FileList !== 'undefined' && value instanceof FileList && value.length === 0) return true;
      return isAllowedManagerFile(value, ROOM_IMAGE_TYPES, ROOM_IMAGE_EXTENSIONS, MANAGER_UPLOAD_MAX_BYTES);
    },
    'Upload JPG, PNG, or WEBP room image up to 5 MB with a safe filename'
  );

export const managerRoomSchema = z.object({
  roomNumber: z.string().trim().min(1, 'Room number is required').max(20, 'Room number is too long'),
  floor: z.coerce
    .number({ invalid_type_error: 'Floor is required' })
    .int('Floor must be a whole number')
    .min(0, 'Floor cannot be negative'),
  roomType: z.string().trim().min(1, 'Room type is required').max(40, 'Room type is too long'),
  totalBeds: z.coerce
    .number({ invalid_type_error: 'Total beds is required' })
    .int('Total beds must be a whole number')
    .min(1, 'At least 1 bed is required')
    .max(10, 'Max 10 beds allowed'),
  image: optionalRoomImageSchema,
});

export const managerAssignBedSchema = z.object({
  bedId: z.string().trim().min(1, 'Bed ID is required'),
  bedNumber: z.string().trim().optional(),
  tenantId: z.string().trim().min(1, 'Tenant ID is required'),
});

export const managerBedStatusSchema = z.object({
  bedId: z.string().trim().min(1, 'Bed ID is required'),
  status: z.enum(['AVAILABLE', 'OCCUPIED', 'MAINTENANCE', 'RESERVED']),
});
