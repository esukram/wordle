import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRound, submitGuess, randomSolution } from '../js/game.js';

const list = ['apple', 'brick', 'crane'];

test('randomSolution returns a list member at rng boundaries', () => {
  assert.equal(randomSolution(list, () => 0), 'apple');
  assert.equal(randomSolution(list, () => 0.999999), 'crane');
});

test('randomSolution honors an injected deterministic rng', () => {
  // floor(0.5 * 3) === 1
  assert.equal(randomSolution(list, () => 0.5), 'brick');
});

test('a new Free Play round after a finished one is independent and playing', () => {
  const guessSet = new Set(['crane', 'apple']);
  let round = createRound('crane', guessSet);
  round = submitGuess(round, 'crane').round;
  assert.equal(round.status, 'won');

  const next = createRound(randomSolution(list, () => 0), guessSet);
  assert.equal(next.status, 'playing');
  assert.equal(next.guesses.length, 0);
  assert.notEqual(next, round);
});
