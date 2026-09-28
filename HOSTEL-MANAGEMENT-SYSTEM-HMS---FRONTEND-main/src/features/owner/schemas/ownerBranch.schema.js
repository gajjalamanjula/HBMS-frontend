import { z } from 'zod';
import {
  hasSafeUploadFilename,
  isAllowedUploadFile,
  isWithinOwnerUploadLimit,
  OWNER_BRANCH_IMAGE_TYPES,
} from './ownerUploadValidation';

const optionalNumber = z.preprocess(
  (value) => (value === '' || value === null || value === undefined ? undefined : Number(value)),
  z.number().positive('Value must be greater than 0').optional()
);

const optionalHttpsUrl = z.preprocess(
  (value) => {
    const text = String(value || '').trim();
    return text || undefined;
  },
  z
    .string()
    .url('Enter a valid map URL')
    .refine((value) => value.startsWith('https://'), 'Only HTTPS map links are allowed')
    .optional()
);

function getUploadFiles(value) {
  if (!value) return [];

  if (typeof File !== 'undefined' && value instanceof File) {
    return [value];
  }

  if (typeof Blob !== 'undefined' && value instanceof Blob) {
    return [value];
  }

  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof FileList !== 'undefined' && value instanceof FileList) {
    return Array.from(value).filter(Boolean);
  }

  return [];
}

const branchImagesSchema = z
  .any()
  .refine((value) => getUploadFiles(value).length > 0, 'Branch images are required')
  .refine(
    (value) =>
      getUploadFiles(value).every((file) =>
        isAllowedUploadFile(file, OWNER_BRANCH_IMAGE_TYPES, ['jpg', 'jpeg', 'png', 'webp'])
      ),
    'Branch images must be JPG, PNG, or WEBP'
  )
  .refine(
    (value) => getUploadFiles(value).every((file) => isWithinOwnerUploadLimit(file)),
    'Each branch image must be 5MB or smaller'
  )
  .refine(
    (value) => getUploadFiles(value).every((file) => hasSafeUploadFilename(file)),
    'One or more branch image filenames are invalid'
  );

export const ownerBranchSchema = z.object({
  hostelName: z.string().trim().min(2, 'Hostel name is required'),
  location: z.string().trim().min(2, 'Location is required'),
  monthlyRent: z.preprocess(
    (value) => Number(value),
    z.number().positive('Monthly rent must be greater than 0')
  ),
  hostelType: z.enum(['MALE', 'FEMALE'], { message: 'Select hostel type' }),
  city: z.string().trim().optional(),
  area: z.string().trim().optional(),
  colony: z.string().trim().optional(),
  roadNo: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
  fullAddress: z.string().trim().min(5, 'Full address is required'),
  description: z.string().trim().optional(),
  managerName: z.string().trim().optional(),
  managerPhone: z.string().trim().optional(),
  whatsappNumber: z.string().trim().optional(),
  totalFloors: optionalNumber,
  amenities: z.string().trim().optional(),
  mapLocationUrl: optionalHttpsUrl,

  images: branchImagesSchema,
});

export default ownerBranchSchema;