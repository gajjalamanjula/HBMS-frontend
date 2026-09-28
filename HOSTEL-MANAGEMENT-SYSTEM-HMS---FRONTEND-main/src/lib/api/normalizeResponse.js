export function unwrapData(payload) {
  if (!payload || typeof payload !== 'object') return payload;
  if ('success' in payload && 'data' in payload) return payload.data;
  return payload.data ?? payload.payload ?? payload.result ?? payload;
}

export function unwrapList(payload) {
  const data = unwrapData(payload);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.rows)) return data.rows;
  return [];
}

export function unwrapObject(payload) {
  const data = unwrapData(payload);
  if (data && typeof data === 'object' && !Array.isArray(data)) return data;
  return {};
}

export function unwrapPage(payload) {
  const data = unwrapData(payload);
  if (!data || typeof data !== 'object') {
    return { content: [], totalElements: 0, totalPages: 0, page: 0, size: 0 };
  }

  return {
    ...data,
    content: Array.isArray(data.content) ? data.content : unwrapList(data),
    totalElements: Number(data.totalElements ?? data.total ?? 0),
    totalPages: Number(data.totalPages ?? 0),
    page: Number(data.number ?? data.page ?? 0),
    size: Number(data.size ?? 0),
  };
}

export function unwrapMessage(payload, fallback = 'Success') {
  if (typeof payload === 'string') return payload;
  if (!payload || typeof payload !== 'object') return fallback;
  return payload.message || payload.error || payload.details || payload.title || fallback;
}

export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== null && value !== '')
  );
}

export function cleanText(value) {
  return typeof value === 'string' ? value.trim() : '';
}
