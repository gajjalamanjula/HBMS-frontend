const TECHNICAL_ERROR_PATTERNS = [
  /nullpointerexception/i,
  /sqlexception/i,
  /constraintviolationexception/i,
  /stack trace/i,
  /java\./i,
  /org\.springframework/i,
  /at\s+[\w.$]+\(/i,
];

export function isTechnicalErrorMessage(message = '') {
  return TECHNICAL_ERROR_PATTERNS.some((pattern) => pattern.test(String(message)));
}

export function getSafeApiErrorMessage(error, fallback = 'Something went wrong. Please try again.') {
  const payload = error?.response?.data;
  const message = payload?.message || payload?.error || payload?.details || payload?.title || error?.message || fallback;
  if (!message || isTechnicalErrorMessage(message)) return fallback;
  return String(message);
}

export default getSafeApiErrorMessage;
