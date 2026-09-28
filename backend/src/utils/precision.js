/**
 * Money precision utilities
 * Avoids binary floating-point inaccuracies by operating on cents/paisa or standard rounding.
 */

// Convert human monetary float/string (e.g. 250.50) to integer minor units (e.g. 25050 paisa/cents)
const toMinorUnits = (amount) => {
  if (typeof amount !== 'number' && typeof amount !== 'string') return 0;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
};

// Convert integer minor units back to standard float rounded to 2 decimal places
const fromMinorUnits = (minorUnits) => {
  if (typeof minorUnits !== 'number') return 0;
  return Number((minorUnits / 100).toFixed(2));
};

// Round float or numeric string directly to 2 decimal places safely
const roundCurrency = (amount) => {
  if (amount === undefined || amount === null) return 0.00;
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return 0.00;
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

// Format currency for display (e.g., 2500 -> "₹2,500.00")
const formatCurrencyDisplay = (amount, currencyCode = 'INR') => {
  const rounded = roundCurrency(amount);
  try {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: currencyCode,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(rounded);
  } catch {
    return `${currencyCode} ${rounded.toFixed(2)}`;
  }
};

module.exports = {
  toMinorUnits,
  fromMinorUnits,
  roundCurrency,
  formatCurrencyDisplay
};
