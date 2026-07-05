import { test } from 'node:test';
import assert from 'node:assert/strict';
import { GUESSES_EN } from '../data/words-en.js';
import { SOLUTIONS_EN } from '../data/solutions-en.js';

const FIVE = /^[a-z]{5}$/;

test('every guess and solution matches ^[a-z]{5}$', () => {
  for (const w of GUESSES_EN) assert.match(w, FIVE, `bad guess: ${w}`);
  for (const w of SOLUTIONS_EN) assert.match(w, FIVE, `bad solution: ${w}`);
});

test('no duplicates in either list', () => {
  assert.equal(new Set(GUESSES_EN).size, GUESSES_EN.length);
  assert.equal(new Set(SOLUTIONS_EN).size, SOLUTIONS_EN.length);
});

test('every solution is a valid guess', () => {
  const guesses = new Set(GUESSES_EN);
  for (const w of SOLUTIONS_EN) assert.ok(guesses.has(w), `solution not in guesses: ${w}`);
});

test('size floors', () => {
  assert.ok(GUESSES_EN.length >= 5000, `guesses: ${GUESSES_EN.length}`);
  assert.ok(SOLUTIONS_EN.length >= 1000, `solutions: ${SOLUTIONS_EN.length}`);
});

test('head guard: first ten solutions are the committed play order', () => {
  assert.deepStrictEqual(SOLUTIONS_EN.slice(0, 10), [
    'vines', 'bluff', 'slack', 'abhor', 'noses',
    'brock', 'meter', 'clasp', 'rungs', 'antsy',
  ]);
});

test('committed play order is not alphabetical', () => {
  assert.notDeepStrictEqual(SOLUTIONS_EN, [...SOLUTIONS_EN].sort());
});
