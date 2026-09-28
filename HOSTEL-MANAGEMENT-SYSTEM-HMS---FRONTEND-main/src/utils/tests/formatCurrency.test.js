import { describe, expect, it } from 'vitest';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

describe('formatCurrency', () => {
  it('formats number into INR currency', () => {
    expect(formatCurrency(15000)).toBe('₹15,000');
  });
});
