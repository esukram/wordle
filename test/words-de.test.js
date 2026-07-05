import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GUESSES_DE } from '../data/words-de.js';
import { SOLUTIONS_DE } from '../data/solutions-de.js';

const FIVE = /^[a-z]{5}$/;

test('every guess and solution matches ^[a-z]{5}$', () => {
  for (const w of GUESSES_DE) assert.match(w, FIVE, `bad guess: ${w}`);
  for (const w of SOLUTIONS_DE) assert.match(w, FIVE, `bad solution: ${w}`);
});

test('no duplicates in either list', () => {
  assert.equal(new Set(GUESSES_DE).size, GUESSES_DE.length);
  assert.equal(new Set(SOLUTIONS_DE).size, SOLUTIONS_DE.length);
});

test('every solution is a valid guess', () => {
  const guesses = new Set(GUESSES_DE);
  for (const w of SOLUTIONS_DE) assert.ok(guesses.has(w), `solution not in guesses: ${w}`);
});

test('size floors', () => {
  assert.ok(GUESSES_DE.length >= 5000, `guesses: ${GUESSES_DE.length}`);
  assert.ok(SOLUTIONS_DE.length >= 1000, `solutions: ${SOLUTIONS_DE.length}`);
});

test('head guard: first ten solutions are the committed play order', () => {
  assert.deepStrictEqual(SOLUTIONS_DE.slice(0, 10), [
    'bonds', 'kluft', 'folie', 'tisch', 'hegen',
    'wenns', 'speed', 'unten', 'shake', 'infos',
  ]);
});

test('committed play order is not alphabetical', () => {
  assert.notDeepStrictEqual(SOLUTIONS_DE, [...SOLUTIONS_DE].sort());
});
