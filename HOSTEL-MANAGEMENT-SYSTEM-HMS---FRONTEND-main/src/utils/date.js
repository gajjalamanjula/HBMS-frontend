import { format, parseISO, isValid } from 'date-fns';

export function formatDate(dateValue, pattern = 'dd MMM yyyy') {
  if (!dateValue) return '-';

  const parsed =
    typeof dateValue === 'string' ? parseISO(dateValue) : new Date(dateValue);

  if (!isValid(parsed)) return '-';

  return format(parsed, pattern);
}

export function formatDateTime(dateValue) {
  return formatDate(dateValue, 'dd MMM yyyy, hh:mm a');
}
