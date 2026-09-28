import { describe, expect, it } from 'vitest';
import {
  normalizeCurrentUserResponse,
  normalizeLoginResponse,
  toBoolean,
} from './authMappers';

describe('authMappers', () => {
  it('parses boolean-like backend values safely', () => {
    expect(toBoolean(true)).toBe(true);
    expect(toBoolean(false)).toBe(false);
    expect(toBoolean('true')).toBe(true);
    expect(toBoolean('false')).toBe(false);
    expect(toBoolean(1)).toBe(true);
    expect(toBoolean(0)).toBe(false);
    expect(toBoolean(undefined, true)).toBe(true);
  });

  it('does not treat string false values as true', () => {
    const user = normalizeCurrentUserResponse({
      id: 'u1',
      email: 'tenant@example.com',
      role: 'tenant',
      active: 'false',
      verified: 'false',
      kycVerified: 'false',
      mustChangePassword: 'true',
    });

    expect(user.role).toBe('TENANT');
    expect(user.active).toBe(false);
    expect(user.verified).toBe(false);
    expect(user.kycVerified).toBe(false);
    expect(user.mustChangePassword).toBe(true);
  });

  it('normalizes mustChangePassword from login payloads', () => {
    const result = normalizeLoginResponse({
      accessToken: 'access',
      refreshToken: 'refresh',
      role: 'manager',
      must_change_password: 'true',
    });

    expect(result.role).toBe('MANAGER');
    expect(result.mustChangePassword).toBe(true);
  });
});
