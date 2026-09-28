import { API_BASE_URL, IS_DEV } from '../../app/config/env';

const UNSAFE_PROTOCOL_PATTERN = /^(javascript|data|vbscript|file|chrome):/i;
const LOCAL_HTTP_HOSTS = new Set(['localhost', '127.0.0.1', '0.0.0.0']);

export function getBackendOrigin() {
  return API_BASE_URL.replace(/\/api\/v\d+$/i, '').replace(/\/+$/, '');
}

export function isUnsafeProtocol(value = '') {
  return UNSAFE_PROTOCOL_PATTERN.test(String(value || '').trim());
}

export function isLocalHttpUrl(value = '') {
  try {
    const url = new URL(String(value || '').trim());
    return url.protocol === 'http:' && LOCAL_HTTP_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function isSafeHttpUrl(value = '', { allowHttp = false, allowLocalHttp = true } = {}) {
  try {
    const url = new URL(String(value || '').trim());
    if (url.protocol === 'https:') return true;
    if (url.protocol !== 'http:') return false;
    if (allowHttp) return true;
    return allowLocalHttp && IS_DEV && LOCAL_HTTP_HOSTS.has(url.hostname);
  } catch {
    return false;
  }
}

export function isSafeBlobUrl(value = '') {
  return String(value || '').trim().startsWith('blob:');
}

export function isSafeFileUrl(value = '', options = {}) {
  const raw = String(value || '').trim();
  if (!raw || isUnsafeProtocol(raw)) return false;
  if (isSafeBlobUrl(raw)) return options.allowBlob === true;
  if (/^https?:\/\//i.test(raw)) return isSafeHttpUrl(raw, options);
  return !/^\/\//.test(raw);
}

export function resolveBackendFileUrl(value = '', options = {}) {
  const raw = String(value || '').trim();
  if (!raw || isUnsafeProtocol(raw)) return '';
  if (isSafeBlobUrl(raw)) return options.allowBlob === true ? raw : '';

  if (/^https?:\/\//i.test(raw)) {
    return isSafeHttpUrl(raw, options) ? raw : '';
  }

  if (/^\/\//.test(raw)) return '';

  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) return '';

  const normalized = raw
    .replace(/^\/+/, '')
    .replace(/^api\/v\d+\//i, '');

  if (!normalized || isUnsafeProtocol(normalized)) return '';

  return `${backendOrigin}/${normalized}`;
}

export function openSafeUrl(value = '', target = '_blank', options = {}) {
  const safeUrl = resolveBackendFileUrl(value, options);
  if (!safeUrl || typeof window === 'undefined') return false;

  window.open(safeUrl, target, 'noopener,noreferrer');
  return true;
}

export function isAllowedBlob(blob, allowedMimeTypes = []) {
  if (!blob || typeof blob.size !== 'number') return false;
  if (blob.size <= 0) return false;
  if (!allowedMimeTypes.length) return true;
  return allowedMimeTypes.includes(blob.type);
}

export function openSafeBlob(blob, fallbackFilename = 'document', allowedMimeTypes = []) {
  if (!isAllowedBlob(blob, allowedMimeTypes)) {
    return { opened: false, reason: 'File is empty or has an unsupported file type.' };
  }

  const objectUrl = URL.createObjectURL(blob);
  window.open(objectUrl, '_blank', 'noopener,noreferrer');
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 60_000);

  return { opened: true, url: objectUrl, filename: String(fallbackFilename || 'document') };
}
