function numericValues(value, out=[]) {
  if (typeof value === 'number' && Number.isFinite(value)) out.push(value);
  else if (Array.isArray(value)) value.forEach(v=>numericValues(v,out));
  else if (value && typeof value === 'object') Object.values(value).forEach(v=>numericValues(v,out));
  return out;
}
const normalize = n => Number(Number(n).toFixed(2));
export function summaryNumbersAreSupported(summary, plan, tolerance=0.02) {
  if (typeof summary !== 'string') return false;
  const allowed = numericValues(plan).map(normalize);
  const tokens = summary.match(/(?<![A-Za-z])[-+]?\d[\d,]*(?:\.\d+)?/g) || [];
  return tokens.every(token => {
    const n = Number(token.replace(/,/g,''));
    return !Number.isFinite(n) || allowed.some(a => Math.abs(a-normalize(n)) <= tolerance || Math.abs(a-Math.round(n)) <= tolerance);
  });
}
export function guardSummary(summary, plan, fallback) { return summaryNumbersAreSupported(summary,plan) ? summary : fallback; }
