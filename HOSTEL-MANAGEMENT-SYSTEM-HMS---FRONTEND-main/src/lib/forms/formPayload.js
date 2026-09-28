export function trimString(value) {
  return typeof value === 'string' ? value.trim() : value;
}

export function emptyToUndefined(value) {
  const trimmed = trimString(value);
  return trimmed === '' ? undefined : trimmed;
}

export function cleanObjectPayload(values = {}, options = {}) {
  const { removeEmpty = true } = options;
  return Object.entries(values).reduce((payload, [key, value]) => {
    if (value instanceof File || (typeof FileList !== 'undefined' && value instanceof FileList)) {
      payload[key] = value;
      return payload;
    }
    const cleaned = typeof value === 'string' ? value.trim() : value;
    if (removeEmpty && (cleaned === '' || cleaned === undefined)) return payload;
    payload[key] = cleaned;
    return payload;
  }, {});
}

export function appendIfPresent(formData, key, value) {
  if (value === undefined || value === null || value === '') return;
  formData.append(key, value);
}
