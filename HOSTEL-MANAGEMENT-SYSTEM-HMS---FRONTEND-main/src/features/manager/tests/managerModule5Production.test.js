import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

import {
  buildUpdateStaffPayload,
  maskManagerAadhaar,
  normalizeManagerStaff,
  normalizeManagerTenant,
} from '../utils/managerMappers';
import { managerCreateUserSchema } from '../schemas/managerUser.schema';
import { managerFoodMenuUploadSchema } from '../schemas/managerFoodMenu.schema';
import { managerRoomSchema } from '../schemas/managerRoom.schema';
import { getAssignedBranchFromRows } from '../hooks/useManagerBranch';

function testFile(name, type, size = 1024) {
  return { name, type, size };
}

describe('Manager Module 5 production hardening', () => {
  it('does not poll manager notifications or branch reviews', () => {
    const topbar = readFileSync('src/features/manager/components/ManagerTopbar.jsx', 'utf8');
    const reviewsHook = readFileSync('src/features/manager/hooks/useManagerBranchReviews.js', 'utf8');

    expect(topbar).not.toContain('refetchInterval: 15000');
    expect(reviewsHook).not.toContain('refetchInterval: 5000');
    expect(topbar).toContain('refetchOnWindowFocus: true');
    expect(reviewsHook).toContain('staleTime: 5 * 60 * 1000');
  });

  it('selects manager assigned branch by auth profile branchId, not first branch row', () => {
    const branch = getAssignedBranchFromRows(
      { branchId: 'b2', branchName: 'Assigned' },
      [
        { id: 'b1', name: 'Wrong branch' },
        { id: 'b2', name: 'Correct branch' },
      ]
    );

    expect(branch.id).toBe('b2');
    expect(branch.name).toBe('Correct branch');
  });

  it('parses string false as inactive and masks Aadhaar values', () => {
    expect(normalizeManagerStaff({ id: 's1', active: 'false', aadhaarNumber: '123456789012' }).active).toBe(false);
    expect(normalizeManagerTenant({ id: 't1', active: '0', aadhaarNumber: '987654321234' }).active).toBe(false);
    expect(maskManagerAadhaar('123456789012')).toBe('xxxx-xxxx-9012');
  });

  it('updates staff with only editable fields', () => {
    expect(buildUpdateStaffPayload({ name: 'Ravi', phone: '9999999999', email: '', aadhaarNumber: '123456789012' })).toEqual({
      name: 'Ravi',
      phone: '9999999999',
    });
  });

  it('rejects invalid Aadhaar, room, and food menu uploads', () => {
    expect(managerCreateUserSchema.safeParse({
      email: 'staff@example.com',
      name: 'Staff',
      phone: '9876543210',
      aadhaarNumber: '123456789012',
      aadhaarPhoto: testFile('aadhaar.exe', 'application/x-msdownload'),
    }).success).toBe(false);

    expect(managerRoomSchema.safeParse({
      roomNumber: '101',
      floor: 1,
      roomType: 'Sharing',
      totalBeds: 4,
      image: testFile('room.gif', 'image/gif'),
    }).success).toBe(false);

    expect(managerFoodMenuUploadSchema.safeParse({
      weekStartDate: '2026-06-22',
      file: testFile('menu.pdf', 'application/pdf', 6 * 1024 * 1024),
    }).success).toBe(false);
  });

  it('uses exact payment invalidation and avoids managerKeys.all', () => {
    const paymentHook = readFileSync('src/features/manager/hooks/useManagerPayments.js', 'utf8');
    expect(paymentHook).not.toContain('managerKeys.all');
    expect(paymentHook).toContain('managerKeys.paymentsDue(branchId)');
    expect(paymentHook).toContain('managerKeys.paymentsSummary(branchId)');
  });

  it('uses rejected optimistic booking status for reject action', () => {
    const rejectHook = readFileSync('src/features/bookings/hooks/useRejectBooking.js', 'utf8');
    expect(rejectHook).toContain("status: 'REJECTED'");
    expect(rejectHook).not.toContain("status: 'CANCELLED'");
  });
});
