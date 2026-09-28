export const APP_NAME = 'Hostel Management System';

const DEV_API_BASE_URL = 'http://localhost:8080/api/v1';
const rawConfiguredApiBaseUrl = import.meta.env.VITE_API_BASE_URL || '';

export const DEFAULT_API_BASE_URL = import.meta.env.DEV ? DEV_API_BASE_URL : '';

function resolveApiBaseUrlInput(value = rawConfiguredApiBaseUrl || DEFAULT_API_BASE_URL) {
  const trimmed = String(value || '').trim();

  if (import.meta.env.PROD && !trimmed) {
    throw new Error('Missing VITE_API_BASE_URL for production build. Set it to your backend URL, for example https://api.yourdomain.com/api/v1.');
  }

  return trimmed || DEV_API_BASE_URL;
}

export function normalizeApiBaseUrl(value = rawConfiguredApiBaseUrl || DEFAULT_API_BASE_URL) {
  const trimmed = resolveApiBaseUrlInput(value);
  const withoutTrailingSlash = trimmed.replace(/\/+$/, '');

  if (/\/api\/v1$/i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash;
  }

  if (/\/api\/v\d+$/i.test(withoutTrailingSlash)) {
    return withoutTrailingSlash.replace(/\/api\/v\d+$/i, '/api/v1');
  }

  if (/\/api$/i.test(withoutTrailingSlash)) {
    return `${withoutTrailingSlash}/v1`;
  }

  return `${withoutTrailingSlash}/api/v1`;
}

export const API_BASE_URL = normalizeApiBaseUrl();

export const APP_ENV = import.meta.env.MODE || 'development';
export const IS_DEV = APP_ENV === 'development';
export const IS_PROD = import.meta.env.PROD === true;

export const STORAGE_KEYS = {
  accessToken: 'hms_access_token',
  refreshToken: 'hms_refresh_token',
  authUser: 'hms_auth_user',
};

export const DEFAULT_QUERY_STALE_TIME = 1000 * 60 * 2;
export const DEFAULT_QUERY_GC_TIME = 1000 * 60 * 10;
export const REQUEST_TIMEOUT = 20000;
