import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderStats } from '../js/statsview.js';
import { emptyStats } from '../js/stats.js';

test('renders summary numbers and one bar per bucket with correct counts', () => {
  const stats = {
    played: 10,
    wins: 8,
    losses: 2,
    currentStreak: 3,
    maxStreak: 5,
    dist: [0, 1, 4, 2, 1, 0],
    lastDayIndex: 20,
  };
  const html = renderStats(stats);
  assert.match(html, /stat-played">10</);
  assert.match(html, /stat-wins">8</);
  assert.match(html, /stat-losses">2</);
  assert.match(html, /stat-streak">3</);
  assert.match(html, /stat-maxstreak">5</);
  assert.match(html, /stat-winpct">80</);

  const counts = [...html.matchAll(/dist-count">(\d+)</g)].map((m) => Number(m[1]));
  assert.deepEqual(counts, [0, 1, 4, 2, 1, 0], 'one bar per bucket 1..6 with its count');
});

test('zero stats render without division-by-zero artifacts', () => {
  const html = renderStats(emptyStats());
  assert.match(html, /stat-played">0</);
  assert.match(html, /stat-winpct">0</);
  assert.doesNotMatch(html, /NaN|Infinity/);

  const widths = [...html.matchAll(/width:(\d+)%/g)].map((m) => Number(m[1]));
  assert.deepEqual(widths, [0, 0, 0, 0, 0, 0], 'all bars empty on zero stats');
});
