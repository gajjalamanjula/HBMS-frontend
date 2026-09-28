import { z } from 'zod';
import { isAllowedManagerFile, MANAGER_UPLOAD_MAX_BYTES } from './managerUser.schema';

const MENU_FILE_TYPES = new Set(['application/pdf', 'image/jpeg', 'image/png']);
const MENU_FILE_EXTENSIONS = ['.pdf', '.jpg', '.jpeg', '.png'];

const fileSchema = z
  .any()
  .refine((value) => {
    if (!value) return false;
    if (typeof File !== 'undefined' && value instanceof File) return true;
    if (typeof FileList !== 'undefined' && value instanceof FileList) return value.length > 0;
    if (Array.isArray(value)) return value.length > 0;
    if (typeof value === 'object' && value.name) return true;
    return false;
  }, 'Menu file is required')
  .refine(
    (value) => isAllowedManagerFile(value, MENU_FILE_TYPES, MENU_FILE_EXTENSIONS, MANAGER_UPLOAD_MAX_BYTES),
    'Upload PDF, JPG, or PNG menu file up to 5 MB with a safe filename'
  );

export const managerFoodMenuUploadSchema = z.object({
  weekStartDate: z.string().trim().min(1, 'Week start date is required'),
  file: fileSchema,
});
