import { test } from 'node:test';
import assert from 'node:assert/strict';
import { emptyStats, updateStats } from '../js/stats.js';

test('win increments played, wins, distribution bucket, and streak from empty', () => {
  const next = updateStats(emptyStats(), { won: true, attempts: 3, dayIndex: 10 });
  assert.equal(next.played, 1);
  assert.equal(next.wins, 1);
  assert.equal(next.losses, 0);
  assert.deepEqual(next.dist, [0, 0, 1, 0, 0, 0]);
  assert.equal(next.currentStreak, 1);
  assert.equal(next.maxStreak, 1);
  assert.equal(next.lastDayIndex, 10);
});

test('loss increments played and losses, resets streak to 0', () => {
  const start = { ...emptyStats(), currentStreak: 4, maxStreak: 4, lastDayIndex: 9 };
  const next = updateStats(start, { won: false, attempts: 6, dayIndex: 10 });
  assert.equal(next.played, 1);
  assert.equal(next.losses, 1);
  assert.equal(next.wins, 0);
  assert.deepEqual(next.dist, [0, 0, 0, 0, 0, 0]);
  assert.equal(next.currentStreak, 0);
  assert.equal(next.maxStreak, 4);
  assert.equal(next.lastDayIndex, 10);
});

test('streak increments on consecutive dayIndex win', () => {
  const start = { ...emptyStats(), played: 1, wins: 1, currentStreak: 1, maxStreak: 1, lastDayIndex: 10 };
  const next = updateStats(start, { won: true, attempts: 2, dayIndex: 11 });
  assert.equal(next.currentStreak, 2);
  assert.equal(next.maxStreak, 2);
});

test('streak resets to 1 on win after a missed date gap', () => {
  const start = { ...emptyStats(), played: 1, wins: 1, currentStreak: 5, maxStreak: 5, lastDayIndex: 10 };
  const next = updateStats(start, { won: true, attempts: 4, dayIndex: 13 });
  assert.equal(next.currentStreak, 1);
  assert.equal(next.maxStreak, 5, 'maxStreak retained across a reset');
});

test('distribution buckets by attempt count 1..6', () => {
  let stats = emptyStats();
  for (const attempts of [1, 6, 3, 3]) {
    stats = updateStats(stats, { won: true, attempts, dayIndex: (stats.lastDayIndex ?? -1) + 1 });
  }
  assert.deepEqual(stats.dist, [1, 0, 2, 0, 0, 1]);
});

test('updateStats is pure — input object and its dist array are unmodified', () => {
  const input = emptyStats();
  const snapshot = JSON.stringify(input);
  const distRef = input.dist;
  const next = updateStats(input, { won: true, attempts: 1, dayIndex: 0 });
  assert.equal(JSON.stringify(input), snapshot, 'input unchanged');
  assert.notEqual(next.dist, distRef, 'returns a new dist array');
});
