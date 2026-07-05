// Deterministic date → daily solution mapping (PRD-001 R2, ADR-0002).
//
// Pure function of (local date, Language): no network, no storage, no DOM.
// The epoch is a local-midnight Date constructor form, never a fixed-ms
// value (ADR-0002 binds this). Day index uses Math.round so 23/25-hour DST
// days still advance by exactly one.

import { SOLUTIONS_EN } from '../data/solutions-en.js';
import { SOLUTIONS_DE } from '../data/solutions-de.js';

// Local midnight 2026-07-01.
export const EPOCH = new Date(2026, 6, 1);

const LISTS = { en: SOLUTIONS_EN, de: SOLUTIONS_DE };

// Whole local days between EPOCH and the local midnight of `now`.
export function dayIndex(now = new Date()) {
  const localMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((localMidnight - EPOCH) / 864e5);
}

// The daily solution for a Language ('en' | 'de'). The ((i % N) + N) % N
// normalization is required because JS % takes the dividend's sign; the
// modulo wrap is the accepted exhaustion backstop.
export function dailySolution(language, now = new Date()) {
  const list = LISTS[language];
  if (!list) throw new Error(`unknown language: ${language}`);
  const n = list.length;
  const i = dayIndex(now);
  return list[((i % n) + n) % n];
}
