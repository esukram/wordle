// Pure round state machine for the core guessing gameplay (PRD-001 R1).
// No DOM access here — the browser wiring lives in app.js.

import { score } from './scoring.js';

export const MAX_GUESSES = 6;

// Fresh round. `guessSet` is a Set of valid lowercase 5-letter guesses.
export function createRound(solution, guessSet) {
  return { solution, guesses: [], guessSet, status: 'playing' };
}

// Pure: returns a new round, never mutates the input.
//
// An invalid guess (not in the guess set) never consumes an attempt — the round
// is returned unchanged with `rejected: true`. A valid guess appends
// `{ word, marks }`, flips status to 'won' on an exact match, or to 'lost' once
// the sixth wrong guess is spent.
export function submitGuess(round, word) {
  if (round.status !== 'playing') return { round, rejected: true };
  if (!round.guessSet.has(word)) return { round, rejected: true };

  const marks = score(word, round.solution);
  const guesses = [...round.guesses, { word, marks }];

  let status = 'playing';
  if (word === round.solution) status = 'won';
  else if (guesses.length >= MAX_GUESSES) status = 'lost';

  return { round: { ...round, guesses, status } };
}

// Best-known state per letter across all guesses, for coloring the on-screen
// keyboard. Precedence: correct beats present beats absent.
const RANK = { absent: 0, present: 1, correct: 2 };

export function keyStates(guesses) {
  const states = {};
  for (const { word, marks } of guesses) {
    for (let i = 0; i < word.length; i++) {
      const letter = word[i];
      const mark = marks[i];
      if (!(letter in states) || RANK[mark] > RANK[states[letter]]) {
        states[letter] = mark;
      }
    }
  }
  return states;
}
