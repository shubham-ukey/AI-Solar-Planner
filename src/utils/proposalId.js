/** Pure SRS-format formatter. SRS example: SOL-2026-0001. */
export function formatProposalId(year, sequence) {
  if (!Number.isInteger(year) || year < 2000 || year > 9999) throw new RangeError('Year must be a four-digit year.');
  if (!Number.isSafeInteger(sequence) || sequence < 1) throw new RangeError('Sequence must be a positive safe integer.');
  return `SOL-${year}-${String(sequence).padStart(4, '0')}`;
}

/** Stateful uniqueness wrapper around the pure formatter. */
const memorySequence = new Map();
export function nextProposalId({ date = new Date(), storage = globalThis.localStorage } = {}) {
  const year = date.getFullYear();
  const key = `solar-proposal-sequence-${year}`;
  let stored = 0;
  try { stored = Number(storage?.getItem(key) || 0); } catch { /* storage may be unavailable */ }
  const previous = Math.max(Number.isSafeInteger(stored) && stored >= 0 ? stored : 0, memorySequence.get(key) || 0);
  const sequence = previous + 1;
  memorySequence.set(key, sequence);
  try { storage?.setItem(key, String(sequence)); } catch { /* in-memory fallback is still unique for this page */ }
  // Timestamp/random suffix is not used: the SRS sequence format remains stable.
  return formatProposalId(year, sequence);
}
