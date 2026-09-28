import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';

import {
  normalizeFoodMenu,
  normalizeKyc,
  normalizeTenantUser,
  toBoolean,
  toSafeTenantFileUrl,
} from '../utils/tenantMappers';
import { updateTenantKycSchema, uploadTenantKycSchema } from '../schemas/tenantSchemas';
import { isOwnReview } from '../../reviews/utils/reviewOwnership';

function testFile(name, type, size = 1024) {
  return new File(['x'.repeat(size)], name, { type });
}

function source(relativePath) {
  return readFileSync(relativePath, 'utf8');
}

describe('Tenant Module 6 production hardening', () => {
  it('does not poll tenant unread notification count', () => {
    const layout = source('src/features/tenants/components/TenantDashboardLayout.jsx');

    expect(layout).not.toContain('refetchInterval: 15000');
    expect(layout).toContain('refetchOnWindowFocus: true');
  });

  it('uses exact tenant invalidation instead of the broad tenant root', () => {
    const complaintsHook = source('src/features/tenants/hooks/useTenantComplaints.js');
    const kycHook = source('src/features/tenants/hooks/useTenantKyc.js');

    expect(complaintsHook).not.toContain('queryKey: tenantDashboardKeys.all');
    expect(kycHook).not.toContain('queryKey: tenantDashboardKeys.all');
    expect(complaintsHook).toContain('tenantDashboardKeys.dashboard()');
    expect(kycHook).toContain('tenantKycKeys.details(userId)');
  });

  it('validates tenant KYC files with the backend 5MB limit and image-only photo files', () => {
    expect(uploadTenantKycSchema.safeParse({
      aadhaarFile: testFile('aadhaar.pdf', 'application/pdf', 5 * 1024 * 1024 + 1),
      photoFile: testFile('photo.png', 'image/png'),
    }).success).toBe(false);

    expect(uploadTenantKycSchema.safeParse({
      aadhaarFile: testFile('aadhaar.pdf', 'application/pdf'),
      photoFile: testFile('photo.pdf', 'application/pdf'),
    }).success).toBe(false);

    expect(uploadTenantKycSchema.safeParse({
      aadhaarFile: testFile('aadhaar.pdf', 'application/pdf'),
      photoFile: testFile('photo.webp', 'image/webp'),
    }).success).toBe(true);
  });

  it('allows tenant KYC update with one changed document', () => {
    expect(updateTenantKycSchema.safeParse({
      aadhaarFile: undefined,
      photoFile: testFile('photo.jpg', 'image/jpeg'),
    }).success).toBe(true);

    expect(updateTenantKycSchema.safeParse({
      aadhaarFile: undefined,
      photoFile: undefined,
    }).success).toBe(false);
  });

  it('normalizes booleans and KYC file availability safely', () => {
    expect(toBoolean('false')).toBe(false);
    expect(toBoolean('0')).toBe(false);
    expect(normalizeTenantUser({ id: 't1', active: 'false', verified: 'false', kycVerified: 'true' })).toEqual(
      expect.objectContaining({ active: false, verified: false, kycVerified: true })
    );

    const kyc = normalizeKyc({ aadhaarFileName: 'aadhaar.pdf', photoUrl: '/uploads/photo.png', verified: 'true' });
    expect(kyc.verified).toBe(true);
    expect(kyc.hasAadhaarFile).toBe(true);
    expect(kyc.hasPhotoFile).toBe(true);
  });

  it('resolves backend file URLs and rejects unsafe protocols', () => {
    expect(toSafeTenantFileUrl('/uploads/kyc/aadhaar.pdf')).toContain('/uploads/kyc/aadhaar.pdf');
    expect(toSafeTenantFileUrl('javascript:alert(1)')).toBe('');
    expect(normalizeFoodMenu({ fileUrl: 'data:text/html,<script>alert(1)</script>' }).fileUrl).toBe('');
  });

  it('shows review management only for the tenant own review and avoids browser confirm', () => {
    const sourceText = source('src/features/reviews/components/BranchReviewsPanel.jsx');

    expect(sourceText).not.toContain('forceTenantActions || isOwnReview');
    expect(sourceText).not.toContain('window.confirm');
    expect(sourceText).toContain('Delete review?');

    expect(isOwnReview({ userId: 'tenant-1' }, { id: 'tenant-1' })).toBe(true);
    expect(isOwnReview({ userId: 'tenant-2' }, { id: 'tenant-1' })).toBe(false);
  });

  it('adds tenant Pay Now flow and safe invoice handling', () => {
    const page = source('src/pages/dashboards/tenant/TenantPaymentsPage.jsx');
    const table = source('src/features/tenants/components/TenantPaymentTable.jsx');

    expect(page).toContain('useInitiateTenantOnlinePayment');
    expect(page).toContain('resolveBackendFileUrl(payment?.invoiceUrl');
    expect(table).toContain('Pay Now');
    expect(table).toContain('PENDING_STATUSES');
  });

  it('catches tenant mutateAsync failures in forms and pages', () => {
    const complaintModal = source('src/features/tenants/components/CreateTenantComplaintModal.jsx');
    const kycForm = source('src/features/tenants/components/TenantKycUploadForm.jsx');
    const complaintsPage = source('src/pages/dashboards/tenant/TenantComplaintsPage.jsx');
    const settingsPage = source('src/pages/dashboards/tenant/TenantSettingsPage.jsx');

    expect(complaintModal).toContain('try {');
    expect(kycForm).toContain('try {');
    expect(complaintsPage).toContain('Keep confirmation open');
    expect(settingsPage).toContain('try {');
  });
});
