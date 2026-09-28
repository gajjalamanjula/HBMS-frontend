import { describe, expect, it } from 'vitest';
import { publicRegisterSchema } from './publicRegister.schema';

describe('publicRegisterSchema', () => {
  it('rejects weak public registration passwords', () => {
    const result = publicRegisterSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      password: '123',
      confirmPassword: '123',
    });

    expect(result.success).toBe(false);
    expect(result.error.issues.some((issue) => issue.path.includes('password'))).toBe(true);
  });

  it('accepts valid public registration input', () => {
    const result = publicRegisterSchema.safeParse({
      name: 'Test User',
      email: 'test@example.com',
      phone: '9876543210',
      password: '12345678',
      confirmPassword: '12345678',
    });

    expect(result.success).toBe(true);
  });
});
