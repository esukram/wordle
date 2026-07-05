import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createRound, submitGuess, keyStates } from '../js/game.js';

const guessSet = new Set(['crane', 'slate', 'plate', 'brick', 'aaaaa', 'bbbbb']);

test('valid guess consumes an attempt and yields five marks', () => {
  const round = createRound('crane', guessSet);
  const { round: next, rejected } = submitGuess(round, 'slate');
  assert.equal(rejected, undefined);
  assert.equal(next.guesses.length, 1);
  assert.equal(next.guesses[0].word, 'slate');
  assert.equal(next.guesses[0].marks.length, 5);
  assert.equal(next.status, 'playing');
});

test('invalid guess is rejected and leaves the round unchanged', () => {
  const round = createRound('crane', guessSet);
  const result = submitGuess(round, 'zzzzz');
  assert.equal(result.rejected, true);
  assert.equal(result.round, round);
  assert.equal(result.round.guesses.length, 0);
});

test('exact match flips status to won', () => {
  const round = createRound('crane', guessSet);
  const { round: next } = submitGuess(round, 'crane');
  assert.equal(next.status, 'won');
  assert.equal(next.guesses.length, 1);
});

test('sixth wrong guess flips status to lost', () => {
  let round = createRound('crane', guessSet);
  const wrong = ['slate', 'plate', 'brick', 'aaaaa', 'bbbbb', 'slate'];
  for (const w of wrong) {
    round = submitGuess(round, w).round;
  }
  assert.equal(round.guesses.length, 6);
  assert.equal(round.status, 'lost');
});

test('keyStates precedence: correct beats present beats absent', () => {
  const guesses = [
    // e present here, correct in the next guess -> must end up correct.
    { word: 'crane', marks: ['absent', 'absent', 'absent', 'absent', 'present'] },
    // e correct here; s present and never upgraded; t stays absent.
    { word: 'slate', marks: ['present', 'absent', 'absent', 'absent', 'correct'] },
  ];
  const states = keyStates(guesses);
  assert.equal(states.e, 'correct'); // present -> correct upgrade
  assert.equal(states.s, 'present'); // present, never correct
  assert.equal(states.a, 'absent');  // absent in both
});
