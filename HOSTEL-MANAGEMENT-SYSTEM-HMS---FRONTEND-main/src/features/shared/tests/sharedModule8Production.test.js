import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cwd } from 'node:process';

import { normalizeNotification } from '../../communication/utils/communicationMappers';
import { mapBranch } from '../../branches/mappers/branch.mapper';
import { mapReview } from '../../reviews/api/review.mapper';
import { isOwnReview } from '../../reviews/utils/reviewOwnership';
import { isSafeHttpUrl, resolveBackendFileUrl } from '../../../lib/url/safeUrl';
import { uploadRules } from '../../../lib/files/uploadRules';

const readSource = (sourcePath) => readFileSync(join(cwd(), 'src', sourcePath), 'utf8');

describe('Module 8 shared business production rules', () => {
  it('parses notification read=false safely instead of treating string false as true', () => {
    expect(normalizeNotification({ id: 1, read: 'false' }).isRead).toBe(false);
    expect(normalizeNotification({ id: 2, isRead: '0' }).isRead).toBe(false);
    expect(normalizeNotification({ id: 3, read: 'true' }).isRead).toBe(true);
  });

  it('blocks unsafe file URLs and resolves backend file paths through the API origin', () => {
    expect(resolveBackendFileUrl('javascript:alert(1)')).toBe('');
    expect(resolveBackendFileUrl('data:text/html,<script>alert(1)</script>')).toBe('');
    expect(resolveBackendFileUrl('/uploads/menu.pdf')).toContain('/uploads/menu.pdf');
    expect(isSafeHttpUrl('https://example.com/invoice.pdf')).toBe(true);
    expect(isSafeHttpUrl('file:///tmp/invoice.pdf')).toBe(false);
  });

  it('keeps shared upload rules consistent across Aadhaar, photos, menus, branch images, and room images', () => {
    expect(uploadRules.aadhaar.maxSizeMB).toBe(5);
    expect(uploadRules.profilePhoto.allowedTypes).not.toContain('application/pdf');
    expect(uploadRules.foodMenu.allowedTypes).toContain('application/pdf');
    expect(uploadRules.branchImage.allowedTypes).not.toContain('application/pdf');
    expect(uploadRules.roomImage.allowedTypes).not.toContain('application/pdf');
  });

  it('calculates branch occupancy from real bed totals instead of returning a static zero', () => {
    const branch = mapBranch({ totalBeds: 20, occupiedBeds: 7 });
    expect(branch.occupancyPercentage).toBe(35);
  });

  it('uses reliable review ownership fields and does not allow email/name fallback to expose actions', () => {
    expect(isOwnReview(mapReview({ userId: 10 }), { id: 10 })).toBe(true);
    expect(isOwnReview(mapReview({ canEdit: true }), { id: 99 })).toBe(true);
    expect(isOwnReview(mapReview({ userEmail: 'same@example.com' }), { id: 99, email: 'same@example.com' })).toBe(false);
  });

  it('removes broad root invalidation from shared room, bed, KYC, and communication hooks', () => {
    const roomsHook = readSource('features/rooms/hooks/useRooms.js');
    const bedsHook = readSource('features/beds/hooks/useBeds.js');
    const kycHook = readSource('features/kyc/hooks/useKyc.js');
    const communicationHook = readSource('features/communication/hooks/useCommunication.js');

    expect(roomsHook).not.toContain('queryKeys.manager.root');
    expect(roomsHook).not.toContain('queryKeys.owner.root');
    expect(bedsHook).not.toContain('queryKeys.manager.root');
    expect(bedsHook).not.toContain('queryKeys.owner.root');
    expect(kycHook).not.toContain('queryKeys.tenant.root');
    expect(communicationHook).not.toContain('communicationKeys.all');
  });

  it('uses branch-scoped room loading when a branchId is supplied', () => {
    const roomsHook = readSource('features/rooms/hooks/useRooms.js');
    const roomsApi = readSource('features/rooms/api/rooms.api.js');

    expect(roomsHook).toContain('roomsApi.getByBranch(branchId)');
    expect(roomsApi).toContain('/branches/${branchId}/rooms');
  });

  it('separates available beds from all beds for status management', () => {
    const bedsApi = readSource('features/beds/api/beds.api.js');
    const bedsHook = readSource('features/beds/hooks/useBeds.js');

    expect(bedsApi).toContain("'/auth/manager/beds'");
    expect(bedsHook).toContain('useAllBeds');
    expect(bedsHook).toContain('bedsApi.getAll()');
  });

  it('narrows booking reject invalidation and keeps rejected status distinct from cancelled', () => {
    const rejectHook = readSource('features/bookings/hooks/useRejectBooking.js');

    expect(rejectHook).toContain("status: 'REJECTED'");
    expect(rejectHook).not.toContain("status: 'CANCELLED'");
    expect(rejectHook).not.toContain('managerKeys.rooms()');
    expect(rejectHook).not.toContain('managerKeys.beds()');
  });

  it('requires payment context for online payment and validates invoice URLs before opening', () => {
    const paymentsApi = readSource('features/payments/api/payments.api.js');

    expect(paymentsApi).toContain('paymentId: cleanText(values.paymentId || values.id)');
    expect(paymentsApi).toContain('month: cleanText(values.month || values.billingMonth)');
    expect(paymentsApi).toContain('resolveBackendFileUrl(readUrl(response.data), { allowHttp: false })');
  });
});
