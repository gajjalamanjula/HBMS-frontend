import { describe, expect, it } from 'vitest';
import { createOwnerSchema } from './ownerSchemas';

function createFile(size, type = 'application/pdf') {
  return new File(['x'.repeat(size)], 'aadhaar.pdf', { type });
}

describe('ownerSchemas', () => {
  it('rejects Aadhaar uploads above the backend 5 MB limit', () => {
    const result = createOwnerSchema.safeParse({
      name: 'Owner User',
      email: 'owner@example.com',
      phone: '9876543210',
      aadhaarNumber: '123456789012',
      branchId: '',
      aadhaarPhoto: createFile(6 * 1024 * 1024),
    });

    expect(result.success).toBe(false);
    expect(result.error.issues.some((issue) => String(issue.message).includes('5MB'))).toBe(true);
  });

  it('accepts valid owner creation input with optional Aadhaar proof', () => {
    const result = createOwnerSchema.safeParse({
      name: 'Owner User',
      email: 'owner@example.com',
      phone: '9876543210',
      aadhaarNumber: '123456789012',
      branchId: '',
      aadhaarPhoto: undefined,
    });

    expect(result.success).toBe(true);
  });
});
