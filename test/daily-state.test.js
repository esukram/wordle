import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  createRound,
  submitGuess,
  restoreRound,
  serializeRound,
  isFreshDaily,
} from '../js/game.js';

const guessSet = new Set(['crane', 'slate', 'plate', 'brick', 'aaaaa', 'bbbbb']);

test('restoreRound rebuilds marks, status and attempts (in-progress)', () => {
  const round = restoreRound(['slate', 'plate'], 'crane', guessSet);
  assert.equal(round.status, 'playing');
  assert.equal(round.guesses.length, 2);
  assert.deepEqual(round.guesses[0].marks, submitGuess(createRound('crane', guessSet), 'slate').round.guesses[0].marks);
});

test('restoreRound rebuilds a won round from stored words', () => {
  const round = restoreRound(['slate', 'crane'], 'crane', guessSet);
  assert.equal(round.status, 'won');
  assert.equal(round.guesses.length, 2);
});

test('restoreRound rebuilds a lost round from six stored words', () => {
  const words = ['slate', 'plate', 'brick', 'aaaaa', 'bbbbb', 'slate'];
  const round = restoreRound(words, 'crane', guessSet);
  assert.equal(round.status, 'lost');
  assert.equal(round.guesses.length, 6);
});

test('serializeRound round-trips through restoreRound', () => {
  let round = createRound('crane', guessSet);
  round = submitGuess(round, 'slate').round;
  round = submitGuess(round, 'plate').round;

  const stored = serializeRound(round, 42);
  assert.deepEqual(stored, { dayIndex: 42, guesses: ['slate', 'plate'], status: 'playing' });

  const restored = restoreRound(stored.guesses, 'crane', guessSet);
  assert.equal(restored.status, round.status);
  assert.equal(restored.guesses.length, round.guesses.length);
  assert.deepEqual(restored.guesses, round.guesses);
});

test('isFreshDaily: stale date is not restored, matching date is', () => {
  assert.equal(isFreshDaily({ dayIndex: 41, guesses: [], status: 'playing' }, 42), false);
  assert.equal(isFreshDaily({ dayIndex: 42, guesses: [], status: 'playing' }, 42), true);
  assert.equal(isFreshDaily(null, 42), false);
});
