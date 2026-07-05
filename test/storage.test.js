import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createStorage } from '../js/storage.js';
import { emptyStats } from '../js/stats.js';

// Map-backed localStorage stub (getItem/setItem/removeItem over strings).
function stubBackend(seed = {}) {
  const map = new Map(Object.entries(seed));
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    _map: map,
  };
}

test('language round-trips; missing language is null', () => {
  const s = createStorage(stubBackend());
  assert.equal(s.getLang(), null);
  s.setLang('de');
  assert.equal(s.getLang(), 'de');
});

test('English and German stats use separate keys and update independently', () => {
  const backend = stubBackend();
  const s = createStorage(backend);

  assert.deepEqual(s.getStats('en'), emptyStats());
  assert.deepEqual(s.getStats('de'), emptyStats());

  s.setStats('en', { ...emptyStats(), played: 3, wins: 2 });
  assert.equal(s.getStats('en').played, 3);
  assert.deepEqual(s.getStats('de'), emptyStats(), 'German untouched by English write');

  assert.ok(backend._map.has('wortex.v1.stats.en'));
  assert.ok(!backend._map.has('wortex.v1.stats.de'));
});

test('corrupt stats JSON falls back to emptyStats', () => {
  const s = createStorage(stubBackend({ 'wortex.v1.stats.en': '{not json' }));
  assert.deepEqual(s.getStats('en'), emptyStats());
});

test('daily state round-trips per language; missing is null; clear removes it', () => {
  const s = createStorage(stubBackend());
  assert.equal(s.getDaily('en'), null);

  const state = { dayIndex: 42, guesses: ['crane', 'moist'], status: 'playing' };
  s.setDaily('en', state);
  assert.deepEqual(s.getDaily('en'), state);
  assert.equal(s.getDaily('de'), null, 'German daily untouched');

  s.clearDaily('en');
  assert.equal(s.getDaily('en'), null);
});

test('corrupt daily JSON falls back to null', () => {
  const s = createStorage(stubBackend({ 'wortex.v1.daily.de': 'oops' }));
  assert.equal(s.getDaily('de'), null);
});
