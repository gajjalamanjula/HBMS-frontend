import { describe, expect, it } from 'vitest';
import {
  maskAadhaarNumber,
  normalizeOwner,
  resolveSuperAdminImageUrl,
  toBoolean,
} from './superAdminMappers';

describe('superAdminMappers', () => {
  it('parses backend boolean-like values safely', () => {
    expect(toBoolean('true')).toBe(true);
    expect(toBoolean('false')).toBe(false);
    expect(toBoolean('ACTIVE')).toBe(true);
    expect(toBoolean('inactive')).toBe(false);
    expect(toBoolean(undefined, true)).toBe(true);
  });

  it('normalizes owner boolean fields without treating string false as true', () => {
    const owner = normalizeOwner({
      id: 'owner-1',
      email: 'owner@example.com',
      role: 'OWNER',
      active: 'false',
      verified: 'false',
      kycVerified: 'false',
    });

    expect(owner.active).toBe(false);
    expect(owner.verified).toBe(false);
    expect(owner.kycVerified).toBe(false);
  });

  it('masks Aadhaar numbers before display', () => {
    expect(maskAadhaarNumber('123456789012')).toBe('xxxx-xxxx-9012');
    expect(maskAadhaarNumber('1234 5678 9012')).toBe('xxxx-xxxx-9012');
    expect(maskAadhaarNumber('')).toBe('—');
  });

  it('preserves upload paths when resolving admin image URLs', () => {
    const result = resolveSuperAdminImageUrl('/uploads/images/branch.png');
    expect(result).toContain('/uploads/images/branch.png');
  });
});
