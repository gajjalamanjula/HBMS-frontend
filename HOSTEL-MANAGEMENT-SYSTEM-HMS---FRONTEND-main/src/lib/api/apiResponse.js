export function unwrapApiResponse(payload) {
  if (!payload || typeof payload !== 'object') return payload;

  if ('success' in payload && 'data' in payload) {
    return payload.data;
  }

  return payload.data ?? payload.payload ?? payload.result ?? payload;
}

export function resolveAxiosResponse(response) {
  return response && Object.prototype.hasOwnProperty.call(response, 'data')
    ? response.data
    : response;
}

export function getCleanData(responseOrPayload) {
  return unwrapApiResponse(resolveAxiosResponse(responseOrPayload));
}

export function asArray(responseOrPayload) {
  const data = getCleanData(responseOrPayload);

  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.items)) return data.items;
  if (Array.isArray(data?.records)) return data.records;
  if (Array.isArray(data?.rows)) return data.rows;

  return [];
}

export function asObject(responseOrPayload) {
  const data = getCleanData(responseOrPayload);

  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data;
  }

  return {};
}

export function asPage(responseOrPayload, defaults = {}) {
  const data = getCleanData(responseOrPayload);

  if (!data || typeof data !== 'object' || Array.isArray(data)) {
    return {
      content: [],
      totalElements: 0,
      totalPages: 0,
      number: defaults.number ?? 0,
      size: defaults.size ?? 10,
      first: true,
      last: true,
    };
  }

  return {
    ...data,
    content: Array.isArray(data.content) ? data.content : [],
    totalElements: Number(data.totalElements || 0),
    totalPages: Number(data.totalPages || 0),
    number: Number(data.number ?? data.pageable?.pageNumber ?? defaults.number ?? 0),
    size: Number(data.size ?? data.pageable?.pageSize ?? defaults.size ?? 10),
    first: Boolean(data.first),
    last: Boolean(data.last),
  };
}

export function asMessage(responseOrPayload, fallback = 'Success') {
  const data = getCleanData(responseOrPayload);

  if (typeof data === 'string') return data;
  if (typeof data?.message === 'string') return data.message;
  if (typeof responseOrPayload?.message === 'string') return responseOrPayload.message;
  if (typeof responseOrPayload?.data === 'string') return responseOrPayload.data;

  return fallback;
}

export function cleanText(value) {
  return typeof value === 'string' ? value.trim() : String(value ?? '').trim();
}

export function cleanParams(params = {}) {
  return Object.fromEntries(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null && value !== ''
    )
  );
}

export function requireId(value, label = 'ID') {
  const safeValue = cleanText(value);

  if (!safeValue) {
    throw new Error(`${label} is required`);
  }

  return safeValue;
}
