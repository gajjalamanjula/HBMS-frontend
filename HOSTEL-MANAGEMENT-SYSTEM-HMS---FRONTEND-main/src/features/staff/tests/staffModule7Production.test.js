import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

import {
  filterAssignedStaffComplaints,
  isSafeStaffFileUrl,
  normalizeStaffFoodMenu,
  normalizeStaffUser,
  toAbsoluteStaffUrl,
  toStaffBoolean,
} from '../mappers/staffMappers';
import { staffComplaintStatusSchema, staffKycUpdateSchema, staffKycUploadSchema } from '../schemas/staffSchemas';

function source(relativePath) {
  return readFileSync(relativePath, 'utf8');
}

function testFile(name, type, size = 1024) {
  return new File(['x'.repeat(size)], name, { type });
}

describe('Staff Module 7 production hardening', () => {
  it('does not poll staff unread notification count', () => {
    const layout = source('src/features/staff/components/StaffDashboardLayout.jsx');

    expect(layout).not.toContain('refetchInterval: 15000');
    expect(layout).toContain('refetchOnWindowFocus: true');
  });

  it('uses staff assigned complaint endpoint before legacy broad complaints fallback', () => {
    const api = source('src/features/staff/api/staff.api.js');
    const complaintsHook = source('src/features/staff/hooks/useStaffComplaints.js');
    const dashboardHook = source('src/features/staff/hooks/useStaffDashboard.js');

    expect(api).toContain("httpClient.get('/staff/complaints/assigned')");
    expect(api).toContain("httpClient.get('/complaints')");
    expect(complaintsHook).toContain('staffApi.getAssignedComplaints');
    expect(dashboardHook).toContain('staffApi.getAssignedComplaints');
  });

  it('keeps exact staff invalidation for complaint and KYC mutations', () => {
    const complaintsHook = source('src/features/staff/hooks/useStaffComplaints.js');
    const kycHook = source('src/features/staff/hooks/useStaffKyc.js');

    expect(complaintsHook).not.toContain('queryKey: staffComplaintKeys.all');
    expect(complaintsHook).not.toContain('queryKey: staffDashboardKeys.all');
    expect(complaintsHook).toContain('staffComplaintKeys.list()');
    expect(complaintsHook).toContain('staffDashboardKeys.dashboard()');
    expect(kycHook).not.toContain('queryKey: staffKycKeys.all');
    expect(kycHook).not.toContain('queryKey: staffDashboardKeys.all');
    expect(kycHook).toContain('staffKycKeys.details(variables?.userId');
  });

  it('requires confirmation and a resolution note before resolving complaints', () => {
    const page = source('src/pages/dashboards/staff/StaffComplaintsPage.jsx');

    expect(page).toContain('Update complaint status?');
    expect(page).toContain('setStatusConfirm');
    expect(page).toContain('Keep confirmation open for retry');
    expect(staffComplaintStatusSchema.safeParse({ status: 'RESOLVED', resolutionNote: '' }).success).toBe(false);
    expect(staffComplaintStatusSchema.safeParse({ status: 'RESOLVED', resolutionNote: 'Leak fixed' }).success).toBe(true);
  });

  it('validates staff KYC files with image-only photo and 5MB limits', () => {
    expect(staffKycUploadSchema.safeParse({
      aadhaarFile: testFile('aadhaar.pdf', 'application/pdf', 5 * 1024 * 1024 + 1),
      photoFile: testFile('photo.png', 'image/png'),
    }).success).toBe(false);

    expect(staffKycUploadSchema.safeParse({
      aadhaarFile: testFile('aadhaar.pdf', 'application/pdf'),
      photoFile: testFile('photo.pdf', 'application/pdf'),
    }).success).toBe(false);

    expect(staffKycUploadSchema.safeParse({
      aadhaarFile: testFile('aadhaar.pdf', 'application/pdf'),
      photoFile: testFile('photo.webp', 'image/webp'),
    }).success).toBe(true);
  });

  it('allows staff KYC update with one changed file', () => {
    expect(staffKycUpdateSchema.safeParse({
      aadhaarFile: undefined,
      photoFile: testFile('photo.jpg', 'image/jpeg'),
    }).success).toBe(true);

    expect(staffKycUpdateSchema.safeParse({
      aadhaarFile: undefined,
      photoFile: undefined,
    }).success).toBe(false);
  });

  it('disables KYC open buttons when files are missing and catches form failures', () => {
    const page = source('src/pages/dashboards/staff/StaffKycPage.jsx');

    expect(page).toContain('disabled={!hasAadhaarFile || openAadhaar.isPending}');
    expect(page).toContain('disabled={!hasPhotoFile || openPhoto.isPending}');
    expect(page).toContain('try {');
    expect(page).toContain('No profile photo uploaded');
  });

  it('rejects unsafe staff file URLs and parses boolean strings safely', () => {
    expect(toStaffBoolean('false')).toBe(false);
    expect(toStaffBoolean('0')).toBe(false);
    expect(normalizeStaffUser({ id: 's1', active: 'false', verified: 'false' })).toEqual(
      expect.objectContaining({ active: false, verified: false })
    );
    expect(toAbsoluteStaffUrl('javascript:alert(1)')).toBe('');
    expect(normalizeStaffFoodMenu({ fileUrl: 'data:text/html,<script>alert(1)</script>' }).fileUrl).toBe('');
    expect(isSafeStaffFileUrl('https://example.com/uploads/menu.pdf')).toBe(true);
  });

  it('filters assigned complaints for legacy fallback rows', () => {
    expect(filterAssignedStaffComplaints([
      { id: 'c1', assignedTo: 's1' },
      { id: 'c2', assignedTo: 's2' },
    ], 's1')).toEqual([{ id: 'c1', assignedTo: 's1' }]);
  });

  it('loads staff announcements by assigned branch and catches settings/logout mutations', () => {
    const announcements = source('src/pages/dashboards/shared/AnnouncementsPage.jsx');
    const settings = source('src/pages/dashboards/staff/StaffSettingsPage.jsx');
    const layout = source('src/features/staff/components/StaffDashboardLayout.jsx');

    expect(announcements).toContain('isStaff');
    expect(announcements).toContain('staffBranchId');
    expect(announcements).toContain('View announcements shared by your hostel team.');
    expect(settings).toContain('try {');
    expect(settings).toContain('showPasswords');
    expect(layout).toContain('try {');
  });
});
