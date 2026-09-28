import { describe, expect, it } from 'vitest';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { buildOwnerOtpPayload } from '../api/owner.api';
import { OWNER_TOPBAR_UNREAD_QUERY_OPTIONS } from '../components/ownerTopbarOptions';
import { ownerBranchSchema } from '../schemas/ownerBranch.schema';
import { ownerUserSchema } from '../schemas/ownerUser.schema';
import {
  isKnownOwnerRevenuePlaceholder,
  maskOwnerAadhaar,
  normalizeOwnerRevenue,
  toSafeOwnerExternalUrl,
} from '../utils/ownerMappers';

function createFile(name, size, type) {
  return new File(['x'.repeat(size)], name, { type });
}

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');

function sourceFile(relativePath) {
  return fs.readFileSync(path.join(projectRoot, relativePath), 'utf8');
}

describe('Owner Module 4 production hardening', () => {
  it('does not poll unread notification count from OwnerTopbar', () => {
    expect(OWNER_TOPBAR_UNREAD_QUERY_OPTIONS.refetchOnWindowFocus).toBe(true);
    expect(OWNER_TOPBAR_UNREAD_QUERY_OPTIONS.refetchInterval).toBeUndefined();

    const source = sourceFile('src/features/owner/components/OwnerTopbar.jsx');
    expect(source).not.toContain('refetchInterval');
  });

  it('keeps Manager and Create User pages off the broad dashboard hook', () => {
    const managersPage = sourceFile('src/pages/dashboards/owner/OwnerManagersPage.jsx');
    const createUserPage = sourceFile('src/pages/dashboards/owner/OwnerCreateUserPage.jsx');

    expect(managersPage).not.toContain('useOwnerDashboard');
    expect(createUserPage).not.toContain('useOwnerDashboard');
  });

  it('does not invalidate all communication queries after branch creation', () => {
    const source = sourceFile('src/features/owner/hooks/useCreateOwnerBranch.js');

    expect(source).not.toContain('communicationKeys.all');
    expect(source).not.toContain('ownerKeys.managers()');
  });

  it('builds Owner OTP verification as a JSON payload first', () => {
    expect(buildOwnerOtpPayload({ email: ' owner@example.com ', otp: ' 123456 ' })).toEqual({
      email: 'owner@example.com',
      otp: '123456',
    });
  });

  it('validates Aadhaar upload type and 5MB size', () => {
    const validInput = {
      userType: 'MANAGER',
      email: 'manager@example.com',
      name: 'Manager User',
      phone: '9876543210',
      aadhaarNumber: '123456789012',
      branchId: 'branch-1',
      aadhaarPhoto: createFile('aadhaar.pdf', 1024, 'application/pdf'),
    };

    expect(ownerUserSchema.safeParse(validInput).success).toBe(true);
    expect(ownerUserSchema.safeParse({
      ...validInput,
      aadhaarPhoto: createFile('aadhaar.exe', 1024, 'application/x-msdownload'),
    }).success).toBe(false);
    expect(ownerUserSchema.safeParse({
      ...validInput,
      aadhaarPhoto: createFile('aadhaar.pdf', 6 * 1024 * 1024, 'application/pdf'),
    }).success).toBe(false);
  });

  it('validates branch image type, 5MB size, and HTTPS map URLs', () => {
    const validInput = {
      hostelName: 'Green Stay',
      location: 'Hyderabad',
      monthlyRent: 8000,
      hostelType: 'MALE',
      fullAddress: 'Road 1, Hyderabad',
      mapLocationUrl: 'https://maps.google.com/example',
      image: createFile('branch.webp', 1024, 'image/webp'),
    };

    expect(ownerBranchSchema.safeParse(validInput).success).toBe(true);
    expect(ownerBranchSchema.safeParse({ ...validInput, mapLocationUrl: 'javascript:alert(1)' }).success).toBe(false);
    expect(ownerBranchSchema.safeParse({ ...validInput, mapLocationUrl: 'http://example.com/map' }).success).toBe(false);
    expect(ownerBranchSchema.safeParse({ ...validInput, image: createFile('branch.gif', 1024, 'image/gif') }).success).toBe(false);
    expect(ownerBranchSchema.safeParse({ ...validInput, image: createFile('branch.png', 6 * 1024 * 1024, 'image/png') }).success).toBe(false);
  });

  it('masks Aadhaar and rejects unsafe stored external URLs', () => {
    expect(maskOwnerAadhaar('1234 5678 9012')).toBe('xxxx-xxxx-9012');
    expect(toSafeOwnerExternalUrl('https://maps.google.com/example')).toBe('https://maps.google.com/example');
    expect(toSafeOwnerExternalUrl('javascript:alert(1)')).toBe('');
    expect(toSafeOwnerExternalUrl('data:text/html,<script>alert(1)</script>')).toBe('');
  });

  it('filters known backend placeholder revenue rows before display', () => {
    expect(isKnownOwnerRevenuePlaceholder({ month: 'JAN', revenue: 50000 })).toBe(true);
    expect(normalizeOwnerRevenue([{ month: 'JAN', revenue: 50000 }])).toEqual([]);
    expect(normalizeOwnerRevenue([{ month: 'FEB', revenue: 12000 }])).toEqual([
      expect.objectContaining({ month: 'FEB', revenue: 12000 }),
    ]);
  });
});
