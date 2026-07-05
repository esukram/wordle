// Pure round state machine for the core guessing gameplay (PRD-001 R1).
// No DOM access here — the browser wiring lives in app.js.

import { score } from './scoring.js';

export const MAX_GUESSES = 6;

// Fresh round. `guessSet` is a Set of valid lowercase 5-letter guesses.
export function createRound(solution, guessSet) {
  return { solution, guesses: [], guessSet, status: 'playing' };
}

// Pick a random solution from a list for Free Play (PRD-001 R3). DOM-free; the
// rng is injectable so tests stay deterministic.
export function randomSolution(list, rng = Math.random) {
  return list[Math.floor(rng() * list.length)];
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

// Rebuild a full round from a stored word list by replaying each word through
// submitGuess, so marks and status are recomputed rather than trusted from
// storage. Pure and DOM-free (PRD-001 R2, R6).
export function restoreRound(words, solution, guessSet) {
  let round = createRound(solution, guessSet);
  for (const word of words) {
    round = submitGuess(round, word).round;
  }
  return round;
}

// Round → the stored daily shape { dayIndex, guesses: [word...], status }.
export function serializeRound(round, dayIndex) {
  return {
    dayIndex,
    guesses: round.guesses.map((g) => g.word),
    status: round.status,
  };
}

// A stored daily state is worth restoring only when it belongs to today's
// puzzle; a differing (stale) dayIndex means a new date has begun.
export function isFreshDaily(stored, todayIndex) {
  return stored != null && stored.dayIndex === todayIndex;
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
