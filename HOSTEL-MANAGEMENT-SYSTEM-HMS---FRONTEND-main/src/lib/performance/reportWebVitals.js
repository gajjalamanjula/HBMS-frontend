import { onCLS, onFCP, onINP, onLCP, onTTFB } from 'web-vitals';

const WEB_VITAL_TARGETS = {
  CLS: 0.1,
  INP: 200,
  LCP: 2500,
  FCP: 1800,
  TTFB: 800,
};

const SENSITIVE_SEARCH_KEYS = new Set([
  'otp',
  'token',
  'resetToken',
  'verifyToken',
  'email',
  'password',
  'refreshToken',
  'accessToken',
]);

function getMetricRating(name, value) {
  const target = WEB_VITAL_TARGETS[name];

  if (!target) return 'unknown';

  return value <= target ? 'good' : 'needs-improvement';
}

export function getSanitizedLocation() {
  if (typeof window === 'undefined') {
    return { path: '', searchKeys: [] };
  }

  const searchParams = new URLSearchParams(window.location.search);
  const searchKeys = [];

  searchParams.forEach((_, key) => {
    const normalizedKey = String(key || '').trim();
    if (normalizedKey && !SENSITIVE_SEARCH_KEYS.has(normalizedKey)) {
      searchKeys.push(normalizedKey);
    }
  });

  return {
    path: window.location.pathname,
    searchKeys,
  };
}

function normalizeMetric(metric) {
  const location = getSanitizedLocation();

  return {
    id: metric.id,
    name: metric.name,
    value: metric.value,
    rating: metric.rating || getMetricRating(metric.name, metric.value),
    delta: metric.delta,
    navigationType: metric.navigationType,
    target: WEB_VITAL_TARGETS[metric.name] ?? null,
    path: location.path,
    searchKeys: location.searchKeys,
    userAgent: navigator.userAgent,
    timestamp: new Date().toISOString(),
  };
}

async function sendMetricToAnalytics(metric) {
  const endpoint = import.meta.env.VITE_WEB_VITALS_ENDPOINT;

  if (!endpoint) return;

  const payload = JSON.stringify(metric);

  if (navigator.sendBeacon) {
    const blob = new Blob([payload], { type: 'application/json' });
    navigator.sendBeacon(endpoint, blob);
    return;
  }

  await fetch(endpoint, {
    method: 'POST',
    body: payload,
    headers: {
      'Content-Type': 'application/json',
    },
    keepalive: true,
  });
}

function defaultReporter(metric) {
  const normalizedMetric = normalizeMetric(metric);

  if (import.meta.env.DEV) {
    console.log('[web-vitals]', normalizedMetric);
  }

  sendMetricToAnalytics(normalizedMetric).catch(() => {
    // Never break the app because performance reporting failed.
  });
}

export function reportWebVitals(onReport = defaultReporter) {
  if (typeof window === 'undefined' || typeof onReport !== 'function') return;

  onCLS(onReport);
  onINP(onReport);
  onLCP(onReport);
  onFCP(onReport);
  onTTFB(onReport);
}

export { WEB_VITAL_TARGETS };
