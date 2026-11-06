/** Match either the stored property ID or its per-Base display name. */
export function isAmountProperty(property, displayName = '') {
  return [property, displayName].some(name => {
    const normalized = name.trim().replace(/^(formula|note)\./i, '').toLowerCase();
    return normalized.startsWith('amount') || normalized.endsWith('amount') || /[€$]/u.test(normalized);
  });
}

export function parseNumber(text) {
  const normalized = text.trim().replace(/\u00a0/gu, '');
  if (!/^-?\d+(?:[.,]\d+)?$/u.test(normalized)) return null;
  const value = Number(normalized.replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}
