import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EPOCH, dayIndex, dailySolution } from '../js/daily.js';
import { SOLUTIONS_EN } from '../data/solutions-en.js';
import { SOLUTIONS_DE } from '../data/solutions-de.js';

test('epoch is the local-midnight Date constructor form', () => {
  assert.deepEqual(EPOCH, new Date(2026, 6, 1));
  assert.equal(EPOCH.getHours(), 0);
  assert.equal(EPOCH.getMinutes(), 0);
});

test('determinism: same (date, language) yields the identical word', () => {
  const d = new Date(2026, 8, 14, 13, 37);
  assert.equal(dailySolution('en', d), dailySolution('en', new Date(2026, 8, 14, 13, 37)));
  assert.equal(dailySolution('de', d), dailySolution('de', new Date(2026, 8, 14, 8, 5)));
});

test('consecutive dates advance dayIndex by exactly 1 over a >=400-day range', () => {
  let cur = new Date(2026, 0, 1);
  for (let k = 0; k < 400; k++) {
    const next = new Date(cur.getFullYear(), cur.getMonth(), cur.getDate() + 1);
    assert.equal(dayIndex(next) - dayIndex(cur), 1, `${cur} -> ${next}`);
    cur = next;
  }
});

test('DST straddle days still differ by exactly 1', () => {
  const pairs = [
    [new Date(2027, 2, 27), new Date(2027, 2, 28)], // last Sunday of March
    [new Date(2027, 9, 30), new Date(2027, 9, 31)], // last Sunday of October
  ];
  for (const [a, b] of pairs) {
    assert.equal(dayIndex(b) - dayIndex(a), 1, `${a} -> ${b}`);
  }
});

test('pre-epoch date still returns an in-range word', () => {
  const pre = new Date(2026, 5, 15);
  assert.ok(dayIndex(pre) < 0);
  assert.ok(SOLUTIONS_EN.includes(dailySolution('en', pre)));
  assert.ok(SOLUTIONS_DE.includes(dailySolution('de', pre)));
});

test('per-Language independence: each word comes from its own list', () => {
  const d = new Date(2026, 10, 3);
  assert.ok(SOLUTIONS_EN.includes(dailySolution('en', d)));
  assert.ok(SOLUTIONS_DE.includes(dailySolution('de', d)));
});
