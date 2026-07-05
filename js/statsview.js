// DOM-free rendering of Statistics (PRD-001 R5) to an HTML string for
// #stats-content. No DOM / document access here — app.js injects the result.

function pct(part, whole) {
  return whole === 0 ? 0 : Math.round((part / whole) * 100);
}

export function renderStats(stats) {
  const { played, wins, losses, currentStreak, maxStreak, dist } = stats;
  const winPct = pct(wins, played);
  const max = Math.max(...dist);

  const bars = dist
    .map((count, i) => {
      // Guard the empty case so a zero max never divides — bars stay flat.
      const width = max === 0 ? 0 : Math.round((count / max) * 100);
      return (
        `<li class="dist-row">` +
        `<span class="dist-label">${i + 1}</span>` +
        `<span class="dist-bar" style="width:${width}%">` +
        `<span class="dist-count">${count}</span></span></li>`
      );
    })
    .join('');

  return (
    `<dl class="stats-summary">` +
    `<div><dt>Played</dt><dd class="stat-played">${played}</dd></div>` +
    `<div><dt>Win %</dt><dd class="stat-winpct">${winPct}</dd></div>` +
    `<div><dt>Wins</dt><dd class="stat-wins">${wins}</dd></div>` +
    `<div><dt>Losses</dt><dd class="stat-losses">${losses}</dd></div>` +
    `<div><dt>Streak</dt><dd class="stat-streak">${currentStreak}</dd></div>` +
    `<div><dt>Max streak</dt><dd class="stat-maxstreak">${maxStreak}</dd></div>` +
    `</dl>` +
    `<ol class="dist">${bars}</ol>`
  );
}
