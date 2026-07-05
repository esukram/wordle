// Pure guess-scoring for the core guessing gameplay (PRD-001 R1).
//
// `score(guess, solution)` takes two lowercase 5-letter strings and returns
// five marks, one per guess letter, each 'correct' | 'present' | 'absent'.
//
// Two-pass counting rule: first mark exact-position hits 'correct' and consume
// those solution letters; then, left to right, mark a guess letter 'present'
// only while unconsumed occurrences of it remain in the solution, consuming one
// per mark. A letter is thus marked present at most as many times as it occurs
// unmatched in the solution.
export function score(guess, solution) {
  const marks = new Array(5).fill('absent');
  const remaining = {};

  for (let i = 0; i < 5; i++) {
    if (guess[i] === solution[i]) {
      marks[i] = 'correct';
    } else {
      remaining[solution[i]] = (remaining[solution[i]] ?? 0) + 1;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (marks[i] === 'correct') continue;
    const letter = guess[i];
    if (remaining[letter] > 0) {
      marks[i] = 'present';
      remaining[letter]--;
    }
  }

  return marks;
}
