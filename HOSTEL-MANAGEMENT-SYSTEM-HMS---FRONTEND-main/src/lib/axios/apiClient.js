import axios from 'axios';
import { API_BASE_URL, REQUEST_TIMEOUT, STORAGE_KEYS } from '../../app/config/env';
import { getSafeApiErrorMessage } from '../api/getErrorMessage';
import { queryClient } from '../query/queryClient';
import { useAuthStore } from '../../store/authStore';

const ACCESS_TOKEN_KEY = STORAGE_KEYS.accessToken;
const REFRESH_TOKEN_KEY = STORAGE_KEYS.refreshToken;
const USER_KEY = STORAGE_KEYS.authUser;

const ANONYMOUS_GET_ENDPOINT_PREFIXES = [
  '/public/',
  '/branches/men-hostels',
  '/branches/women-hostels',
  '/branches/co-living-hostels',
];

const OPTIONAL_AUTH_GET_ENDPOINT_PREFIXES = [
  '/reviews/branch/',
];

const ANONYMOUS_POST_ENDPOINTS = ['/public/register'];

const ANONYMOUS_AUTH_ENDPOINTS = [
  '/auth/login',
  '/auth/forgot-password',
  '/auth/reset-password',
  '/auth/verify-otp',
];

const PRESERVE_AUTHORIZATION_ENDPOINTS = [
  '/auth/refresh-token',
  '/auth/logout',
];

const listeners = new Set();

function readSessionStorage(key, fallback = '') {
  try {
    const value = sessionStorage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function writeSessionStorage(key, value) {
  try {
    if (value === null || value === undefined || value === '') {
      sessionStorage.removeItem(key);
    } else {
      sessionStorage.setItem(key, value);
    }
  } catch {
    // Session storage can be unavailable in restricted browser contexts.
  }
}

function readUserFromStorage() {
  try {
    const raw = sessionStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeUserToStorage(user) {
  try {
    if (!user) {
      sessionStorage.removeItem(USER_KEY);
    } else {
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }
  } catch {
    // Session storage can be unavailable in restricted browser contexts.
  }
}

function emitAuthChange() {
  listeners.forEach((listener) => {
    try {
      listener();
    } catch {
      // Auth session listeners should not break other listeners.
    }
  });
}

export function subscribeAuthSession(listener) {
  if (typeof listener !== 'function') return () => {};

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}

export function getStoredAccessToken() {
  return readSessionStorage(ACCESS_TOKEN_KEY, '');
}

export function getAccessToken() {
  return getStoredAccessToken();
}

export function setStoredAccessToken(token) {
  writeSessionStorage(ACCESS_TOKEN_KEY, token || '');
  delete apiClient.defaults.headers.common.Authorization;
  emitAuthChange();
}

export function setAccessToken(token) {
  setStoredAccessToken(token);
}

export function removeAccessToken() {
  setStoredAccessToken('');
}

export function getStoredRefreshToken() {
  return readSessionStorage(REFRESH_TOKEN_KEY, '');
}

export function getRefreshToken() {
  return getStoredRefreshToken();
}

export function setStoredRefreshToken(token) {
  writeSessionStorage(REFRESH_TOKEN_KEY, token || '');
  emitAuthChange();
}

export function setRefreshToken(token) {
  setStoredRefreshToken(token);
}

export function removeRefreshToken() {
  setStoredRefreshToken('');
}

export function getStoredUser() {
  return readUserFromStorage();
}

export function setStoredUser(user) {
  writeUserToStorage(user || null);
  emitAuthChange();
}

export function removeStoredUser() {
  setStoredUser(null);
}

export function hasStoredSession() {
  return Boolean(getStoredAccessToken());
}

export function setAuthSession({ accessToken = '', refreshToken = '', user } = {}) {
  writeSessionStorage(ACCESS_TOKEN_KEY, accessToken || '');
  writeSessionStorage(REFRESH_TOKEN_KEY, refreshToken || '');

  if (user !== undefined) {
    writeUserToStorage(user || null);
  }

  delete apiClient.defaults.headers.common.Authorization;
  emitAuthChange();
}

export function clearAuthSession() {
  writeSessionStorage(ACCESS_TOKEN_KEY, '');
  writeSessionStorage(REFRESH_TOKEN_KEY, '');
  writeUserToStorage(null);
  delete apiClient.defaults.headers.common.Authorization;
  emitAuthChange();
}

export function clearAuthStateAndCache() {
  clearAuthSession();
  useAuthStore.getState().clearAuth();
  queryClient.clear();
}

export function getApiErrorMessage(error, fallback = 'Something went wrong') {
  if (!error) return fallback;
  if (typeof error === 'string') return error;

  const status = error?.response?.status;

  if (!error?.response && error?.code === 'ERR_NETWORK') {
    return 'Backend is unreachable. Please try again.';
  }

  if (status === 401) return 'Session expired. Please login again.';
  if (status === 403) return 'You do not have permission to perform this action.';
  if (status === 404) return 'Requested data was not found.';
  if (status >= 500) return 'Server error. Please try again later.';

  return getSafeApiErrorMessage(error, fallback);
}


const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: false,
  timeout: REQUEST_TIMEOUT,
});

let refreshPromise = null;

function getRequestPath(url = '') {
  const rawUrl = String(url || '');

  try {
    const parsed = new URL(rawUrl, API_BASE_URL);
    return parsed.pathname.replace(/^\/api\/v\d+/i, '');
  } catch {
    return rawUrl.replace(/^\/api\/v\d+/i, '');
  }
}

function hasExplicitAuthorizationHeader(headers = {}) {
  return Boolean(headers.Authorization || headers.authorization);
}

function isAnonymousRequest(url = '', method = 'get') {
  const path = getRequestPath(url);
  const requestMethod = String(method || 'get').toLowerCase();

  if (ANONYMOUS_AUTH_ENDPOINTS.some((endpoint) => path.startsWith(endpoint))) {
    return true;
  }

  if (
    requestMethod === 'get' &&
    ANONYMOUS_GET_ENDPOINT_PREFIXES.some((endpoint) => path.startsWith(endpoint))
  ) {
    return true;
  }

  return requestMethod === 'post' && ANONYMOUS_POST_ENDPOINTS.some((endpoint) => path === endpoint);
}

function isOptionalAuthRequest(url = '', method = 'get') {
  const path = getRequestPath(url);
  const requestMethod = String(method || 'get').toLowerCase();

  return (
    requestMethod === 'get' &&
    OPTIONAL_AUTH_GET_ENDPOINT_PREFIXES.some((endpoint) => path.startsWith(endpoint))
  );
}

function shouldPreserveAuthorization(url = '') {
  const path = getRequestPath(url);
  return PRESERVE_AUTHORIZATION_ENDPOINTS.some((endpoint) => path.startsWith(endpoint));
}

function isPublicRequest(url = '', method = 'get') {
  return isAnonymousRequest(url, method) || isOptionalAuthRequest(url, method);
}

async function refreshAccessToken() {
  const refreshToken = getStoredRefreshToken();

  if (!refreshToken) {
    throw new Error('No refresh token available');
  }

  const response = await axios.post(`${API_BASE_URL}/auth/refresh-token`, null, {
    headers: {
      Authorization: `Bearer ${refreshToken}`,
    },
    withCredentials: false,
  });

  const data = response?.data ?? {};

  const nextAccessToken =
    data?.accessToken || data?.token || data?.access_token || data?.jwt || '';

  const nextRefreshToken =
    data?.refreshToken || data?.refresh_token || getStoredRefreshToken();

  if (!nextAccessToken) {
    throw new Error('Unable to refresh session');
  }

  setAuthSession({
    accessToken: nextAccessToken,
    refreshToken: nextRefreshToken,
    user: getStoredUser(),
  });

  return nextAccessToken;
}

function redirectToLoginAfterSessionExpiry() {
  if (typeof window === 'undefined') return;

  const currentPath = window.location.pathname;

  if (currentPath === '/login') return;

  window.location.assign('/login');
}

apiClient.interceptors.request.use(
  (config) => {
    const token = getStoredAccessToken();

    config.headers = config.headers || {};

    const anonymousRequest = isAnonymousRequest(config.url, config.method);
    const optionalAuthRequest = isOptionalAuthRequest(config.url, config.method);
    const preserveAuthorization = config.preserveAuthorization || shouldPreserveAuthorization(config.url);
    const hasExplicitAuthorization = hasExplicitAuthorizationHeader(config.headers);

    if (anonymousRequest && !preserveAuthorization) {
      if (!hasExplicitAuthorization) {
        delete config.headers.Authorization;
        delete config.headers.authorization;
        delete apiClient.defaults.headers.common.Authorization;
      }
    } else if ((optionalAuthRequest || !anonymousRequest) && token && !hasExplicitAuthorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    const isFormData =
      typeof FormData !== 'undefined' && config.data instanceof FormData;

    if (isFormData) {
      delete config.headers['Content-Type'];
    } else if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }

    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error?.config;

    if (!originalRequest) {
      return Promise.reject(error);
    }

    const status = error?.response?.status;
    const publicRequest = isPublicRequest(
      originalRequest?.url,
      originalRequest?.method
    );
    const optionalAuthRequest = isOptionalAuthRequest(
      originalRequest?.url,
      originalRequest?.method
    );

    const requestPath = getRequestPath(originalRequest?.url);
    const isRefreshRequest = requestPath.startsWith('/auth/refresh-token');
    const isLogoutRequest = requestPath.startsWith('/auth/logout');

    if (status !== 401 || publicRequest || optionalAuthRequest || originalRequest._retry || isLogoutRequest) {
      if (status === 401 && (isRefreshRequest || isLogoutRequest)) {
        clearAuthStateAndCache();
      }

      return Promise.reject(error);
    }

    const refreshToken = getStoredRefreshToken();

    if (!refreshToken) {
      clearAuthStateAndCache();
      redirectToLoginAfterSessionExpiry();
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    try {
      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null;
        });
      }

      const newAccessToken = await refreshPromise;

      originalRequest.headers = originalRequest.headers || {};
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      return apiClient(originalRequest);
    } catch (refreshError) {
      clearAuthStateAndCache();
      redirectToLoginAfterSessionExpiry();
      return Promise.reject(refreshError);
    }
  }
);

export default apiClient;

const httpClient = apiClient;
const uploadClient = apiClient;

export { API_BASE_URL, httpClient, uploadClient };
