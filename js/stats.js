// Pure Statistics logic (PRD-001 R5). Per-Language, Daily-Puzzle-only.
// No DOM / localStorage access here — persistence lives in storage.js.

export function emptyStats() {
  return {
    played: 0,
    wins: 0,
    losses: 0,
    currentStreak: 0,
    maxStreak: 0,
    dist: [0, 0, 0, 0, 0, 0],
    lastDayIndex: null,
  };
}

// Pure: returns a new stats object, never mutates the input.
export function updateStats(stats, { won, attempts, dayIndex }) {
  const next = {
    ...stats,
    dist: [...stats.dist],
    played: stats.played + 1,
    lastDayIndex: dayIndex,
  };

  if (won) {
    next.wins = stats.wins + 1;
    next.dist[attempts - 1] += 1;
    next.currentStreak =
      stats.lastDayIndex === dayIndex - 1 ? stats.currentStreak + 1 : 1;
  } else {
    next.losses = stats.losses + 1;
    next.currentStreak = 0;
  }

  next.maxStreak = Math.max(stats.maxStreak, next.currentStreak);
  return next;
}
