import { describe, expect, it } from 'vitest';
import {
  buildStatusActionCopy,
  getStatusActionBlockReason,
  isSameUserRecord,
} from './superAdminPermissions';

describe('superAdminPermissions', () => {
  it('blocks changing the current Super Admin account status', () => {
    const reason = getStatusActionBlockReason(
      { id: 'u1', email: 'admin@example.com', role: 'SUPER_ADMIN' },
      { id: 'u1', email: 'admin@example.com' }
    );

    expect(reason).toContain('own account');
  });

  it('blocks other super admin status changes in the UI', () => {
    const reason = getStatusActionBlockReason(
      { id: 'u2', email: 'other-admin@example.com', role: 'SUPER_ADMIN' },
      { id: 'u1', email: 'admin@example.com' }
    );

    expect(reason).toContain('Super admin');
  });

  it('allows normal owner status changes and builds confirmation copy', () => {
    const owner = { id: 'owner-1', name: 'Owner One', email: 'owner@example.com', role: 'OWNER', active: true };

    expect(getStatusActionBlockReason(owner, { id: 'admin-1', email: 'admin@example.com' })).toBe('');

    const copy = buildStatusActionCopy(owner, 'owner');
    expect(copy.title).toBe('Disable account?');
    expect(copy.confirmLabel).toBe('Disable account');
    expect(copy.tone).toBe('danger');
    expect(copy.details.some(([label, value]) => label === 'Email' && value === 'owner@example.com')).toBe(true);
  });

  it('matches the current user by either id or email', () => {
    expect(isSameUserRecord({ id: 'a' }, { id: 'a' })).toBe(true);
    expect(isSameUserRecord({ email: 'admin@example.com' }, { email: 'ADMIN@example.com' })).toBe(true);
  });
});
