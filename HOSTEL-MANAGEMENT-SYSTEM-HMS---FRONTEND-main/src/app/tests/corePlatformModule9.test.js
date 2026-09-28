import { describe, expect, it, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';

import { normalizeApiBaseUrl } from '../config/env';
import { resolveBackendAssetUrl } from '../../lib/images/imageDelivery';
import { openSafeUrl, resolveBackendFileUrl } from '../../lib/url/safeUrl';
import { getSanitizedLocation } from '../../lib/performance/reportWebVitals';

function source(path) {
  return readFileSync(path, 'utf8');
}

describe('Module 9 core platform production hardening', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/reset-password?email=user@example.com&otp=123456&ref=public');
  });

  it('normalizes API base URLs and fails production builds when no API URL is configured', () => {
    expect(normalizeApiBaseUrl('https://api.example.com')).toBe('https://api.example.com/api/v1');
    expect(normalizeApiBaseUrl('https://api.example.com/api')).toBe('https://api.example.com/api/v1');
    expect(normalizeApiBaseUrl('https://api.example.com/api/v2')).toBe('https://api.example.com/api/v1');
    expect(source('src/app/config/env.js')).toContain('Missing VITE_API_BASE_URL for production build');
  });

  it('keeps CI deployment behind install, lint, test, audit, and build gates', () => {
    const workflow = source('.github/workflows/deploy-frontend.yml');

    expect(workflow).toContain('npm ci --include=optional');
    expect(workflow).toContain('npm run lint');
    expect(workflow).toContain('npm test -- --run');
    expect(workflow).toContain('npm audit --omit=dev');
    expect(workflow.indexOf('npm run lint')).toBeLessThan(workflow.indexOf('npm run build'));
  });

  it('keeps optional auth endpoints from stripping token context and preserves refresh/logout authorization', () => {
    const apiClient = source('src/lib/axios/apiClient.js');
    const authApi = source('src/features/auth/api/auth.api.js');

    expect(apiClient).toContain('OPTIONAL_AUTH_GET_ENDPOINT_PREFIXES');
    expect(apiClient).toContain("'/reviews/branch/'");
    expect(apiClient).toContain('PRESERVE_AUTHORIZATION_ENDPOINTS');
    expect(apiClient).toContain('preserveAuthorization');
    expect(authApi).toContain('preserveAuthorization: true');
  });

  it('keeps ProtectedRoute from clearing auth on non-401 session check errors', () => {
    const protectedRoute = source('src/app/guards/ProtectedRoute.jsx');

    expect(protectedRoute).toContain('status === 401');
    expect(protectedRoute).toContain('Your login was not cleared');
    expect(protectedRoute).not.toContain('if (currentUserQuery.isError) {\n      clearAuthStateAndCache();');
  });

  it('preserves uploads paths and blocks backend-provided data URLs for images and files', () => {
    expect(resolveBackendAssetUrl('/uploads/branch/a.jpg')).toContain('/uploads/branch/a.jpg');
    expect(resolveBackendAssetUrl('uploads/branch/a.jpg')).toContain('/uploads/branch/a.jpg');
    expect(resolveBackendAssetUrl('data:image/svg+xml,<svg></svg>')).toBe('');
    expect(resolveBackendFileUrl('javascript:alert(1)')).toBe('');
    expect(openSafeUrl('data:text/html,<script>alert(1)</script>')).toBe(false);
  });

  it('sanitizes Web Vitals URL data before analytics reporting', () => {
    const location = getSanitizedLocation();
    const reporter = source('src/lib/performance/reportWebVitals.js');

    expect(location.path).toBe('/reset-password');
    expect(location.searchKeys).toEqual(['ref']);
    expect(reporter).not.toContain('window.location.href');
    expect(reporter).toContain('SENSITIVE_SEARCH_KEYS');
  });

  it('adds focus trap, focus restore, aria descriptions, and scroll lock to dialogs', () => {
    const hook = source('src/components/ui/useDialogA11y.js');
    const modal = source('src/components/ui/Modal.jsx');
    const drawer = source('src/components/ui/Drawer.jsx');

    expect(hook).toContain('document.body.style.overflow = \'hidden\'');
    expect(hook).toContain('previousFocusRef.current?.focus?.()');
    expect(hook).toContain("event.key !== 'Tab'");
    expect(modal).toContain('aria-describedby');
    expect(drawer).toContain('aria-describedby');
  });

  it('removes developer-facing API wording from public fallback route copy', () => {
    const router = source('src/app/router/AppRouter.jsx');

    expect(router).not.toContain('API is not available');
    expect(router).not.toContain('HBMS 6');
    expect(router).toContain('Booking history is available after login');
  });

  it('documents CloudFront SPA fallback for direct dashboard refreshes', () => {
    const doc = source('deployment/CLOUDFRONT_SPA_FALLBACK.md');

    expect(doc).toContain('403');
    expect(doc).toContain('404');
    expect(doc).toContain('/index.html');
    expect(doc).toContain('/manager/bookings');
  });
});
