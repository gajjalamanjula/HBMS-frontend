import { describe, expect, it } from 'vitest';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';

function source(path) {
  return readFileSync(path, 'utf8');
}

const forbiddenVisibleTechnicalWords = [
  /returned by backend/i,
  /backend data/i,
  /api status/i,
  /public api flow/i,
  /backend service/i,
  /not returned by backend/i,
];

describe('Final UI QA production coverage', () => {
  it('keeps auth error and helper wording customer-friendly', () => {
    const authMessages = source('src/features/auth/utils/authErrorMessages.js');
    const loginPage = source('src/pages/auth/LoginPage.jsx');
    const forgotPasswordPage = source('src/pages/auth/ForgotPasswordPage.jsx');

    expect(authMessages).toContain('Invalid email or password.');
    expect(authMessages).toContain('If an account exists, reset instructions will be sent.');
    expect(loginPage).not.toMatch(/backend|endpoint|returned by backend/i);
    expect(forgotPasswordPage).not.toMatch(/backend|endpoint|returned by backend/i);
  });

  it('keeps critical public discovery components free of internal wording', () => {
    const publicSources = [
      'src/features/public/components/PublicHomeHero.jsx',
      'src/features/public/components/BranchSearch.jsx',
      'src/features/public/components/BranchGrid.jsx',
      'src/features/public/components/BranchCard.jsx',
      'src/features/public/components/PublicRoomsPanel.jsx',
      'src/features/public/components/PublicBedsPanel.jsx',
      'src/features/public/components/PublicBookingForm.jsx',
      'src/pages/public/BranchDetailPage.jsx',
    ].map(source).join('\n');

    forbiddenVisibleTechnicalWords.forEach((pattern) => {
      expect(publicSources).not.toMatch(pattern);
    });
    expect(publicSources).toContain('Search by area, city, or hostel name');
    expect(publicSources).toContain('Compare rooms, rent, amenities, and availability.');
  });

  it('locks public no-room and no-bed empty states to friendly wording', () => {
    const roomsPanel = source('src/features/public/components/PublicRoomsPanel.jsx');
    const branchDetailPage = source('src/pages/public/BranchDetailPage.jsx');

    expect(roomsPanel).toContain('No rooms have been added for this hostel yet.');
    expect(branchDetailPage).toContain('No beds are available for this hostel right now.');
    expect(branchDetailPage).toContain('No beds are available in this room right now.');
    expect(roomsPanel).toContain('<PublicEmptyState');
    expect(roomsPanel).toContain('title="No rooms added yet"');
  });

  it('keeps shared button variants semantic and focusable', () => {
    const button = source('src/components/ui/Button.jsx');

    expect(button).toContain("success: 'bg-emerald-600");
    expect(button).toContain("danger: 'bg-red-600");
    expect(button).toContain("warning: 'bg-amber-600");
    expect(button).toContain("info: 'bg-sky-600");
    expect(button).toContain('focus-visible:ring-2');
    expect(button).toContain('disabled:cursor-not-allowed');
  });

  it('keeps badge status classes readable and semantic', () => {
    const badge = source('src/components/ui/Badge.jsx');

    expect(badge).toContain("success: 'border-emerald-200 bg-emerald-50 text-emerald-700");
    expect(badge).toContain("warning: 'border-amber-200 bg-amber-50 text-amber-700");
    expect(badge).toContain("danger: 'border-red-200 bg-red-50 text-red-700");
    expect(badge).toContain("info: 'border-sky-200 bg-sky-50 text-sky-700");
    expect(badge).toContain('children');
  });

  it('maps confirm dialog business actions to safe visual variants', () => {
    const confirmDialog = source('src/components/ui/ConfirmDialog.jsx');

    expect(confirmDialog).toContain("delete: 'danger'");
    expect(confirmDialog).toContain("deactivate: 'danger'");
    expect(confirmDialog).toContain("reject: 'danger'");
    expect(confirmDialog).toContain("approve: 'success'");
    expect(confirmDialog).toContain("paid: 'success'");
    expect(confirmDialog).toContain("assign: 'primary'");
    expect(confirmDialog).toContain("confirmVariant === 'danger' ? 'alertdialog' : 'dialog'");
  });

  it('keeps review ownership controls scoped to the tenant owner', () => {
    const reviewPanel = source('src/features/reviews/components/BranchReviewsPanel.jsx');
    const reviewOwnership = source('src/features/reviews/utils/reviewOwnership.js');

    expect(reviewPanel).toContain('isOwnReview(review, user)');
    expect(reviewPanel).toContain('Delete review?');
    expect(reviewPanel).not.toContain('window.confirm');
    expect(reviewOwnership).not.toMatch(/email|name/i);
  });

  it('keeps tenant and staff KYC open-file buttons disabled when files are missing', () => {
    const tenantKycPage = source('src/pages/dashboards/tenant/TenantKycPage.jsx');
    const staffKycPage = source('src/pages/dashboards/staff/StaffKycPage.jsx');

    expect(tenantKycPage).toContain('disabled={loading || !hasFile}');
    expect(tenantKycPage).toContain('disabled:border-slate-200 disabled:bg-slate-50 disabled:text-slate-500');
    expect(staffKycPage).toContain('disabled={!hasAadhaarFile || openAadhaar.isPending}');
    expect(staffKycPage).toContain('disabled={!hasPhotoFile || openPhoto.isPending}');
  });

  it('does not include console logging or debugger statements in app UI source', () => {
    const uiSources = [
      'src/pages',
      'src/features',
      'src/components',
      'src/layouts',
    ].map((path) => sourceList(path)).join('\n');

    expect(uiSources).not.toMatch(/console\.log|debugger/);
  });
});

function sourceList(path) {
  const entries = readdirSync(path);

  return entries.map((entry) => {
    const fullPath = join(path, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) return sourceList(fullPath);
    if (!/\.(js|jsx)$/.test(entry) || /\.test\.(js|jsx)$/.test(entry)) return '';
    return source(fullPath);
  }).join('\n');
}
