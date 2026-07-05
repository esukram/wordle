---
id: RES-002
prd: PRD-001
status: open
questions:
  - "Daily Puzzle epoch: which fixed start date anchors the date→word mapping (affects puzzle numbering and list cycling)?"
  - "Solution-list ordering: shuffled-once fixed order (spoiler-resistant, committed) vs. index arithmetic over an alphabetical list (predictable)?"
created: 2026-07-05
---

# RES-002: Daily Puzzle epoch and solution-list ordering

Research for [PRD-001](../prd/PRD-001-wortex.md) (PRD-001-R2, PRD-001-R7).

## Q1: Daily Puzzle epoch

### Findings

No external authority constrains the date — it is a pure project decision.
Ecosystem practice anchors the epoch at the game's own launch date,
constructed as **local midnight** (`new Date(Y, M, D)`), with
day index = `Math.round((localToday − epoch) / 864e5)` and puzzle number =
index + 1. `Math.round` (not `floor`) absorbs DST transitions, which make
some local days 23 or 25 hours long. Constraints for Wortex: the epoch must
be on or before the first release date (or the index goes negative — JS `%`
takes the dividend's sign, so a negative index needs `((i % N) + N) % N`);
reusing the genre-original's launch date would violate the PRD's
no-third-party-reference Non-Goal; one shared epoch for both Languages
suffices, since per-date independence comes from the two separate solution
lists.

Anti-pattern to avoid: a widely forked clone template hardcodes the epoch
as a fixed **milliseconds** constant plus `Math.floor` — that is midnight
in one specific timezone only and yields wrong local-date behavior
elsewhere, breaking PRD-001-R2's local-date semantics.

### Evidence

- [CITED: https://reichel.dev/blog/reverse-engineering-wordle] Genre-original client source: local-midnight launch-date epoch, day count `Math.round(t / 864e5)`, `wordlist[days % wordlist.length]`.
- [CITED: https://mottaquikarim.github.io/dev/posts/reverse-engineering-wordle/] Independent corroboration of the same epoch/daysBetween/modulo scheme.
- [VERIFIED: https://github.com/PavlikPolivka/wordle/blob/main/src/lib/words.ts] `const epochMs = 1641013200000;` + `Math.floor` — the fixed-ms anti-pattern, cited as what not to copy.
- [VERIFIED: node -e "console.log(-3 % 10)" → -3] JS remainder takes the dividend's sign; pre-epoch dates need index normalization.
- [VERIFIED: docs/prd/PRD-001-wortex.md] Non-Goals ban third-party references (rules out an homage epoch); R2 requires a pure function of (date, Language) with per-Language independence.
- [ASSUMED] 2026-07-01 (on/before Wortex's first release) is an acceptable epoch — backs A1.

### Answer

A free project decision bounded by: epoch ≤ first release date, local-midnight
construction (never a fixed-ms constant), `Math.round` day arithmetic, one
shared epoch for both Languages. Proposed concrete date: **2026-07-01**.

**Confidence:** HIGH for the constraint analysis; the concrete date is A1 (LOW until accepted).

## Q2: Solution-list ordering

### Findings

Recommend **shuffled-once fixed order, committed to the repo**, indexed by
`dayIndex % N` per Language. Rationale: (1) plain modulo over an
*alphabetical* list makes consecutive days alphabetically adjacent —
yesterday's answer nearly reveals today's; coprime-stride arithmetic avoids
that but reshuffles the entire future schedule whenever N changes, whereas a
committed shuffled list is stable under append-only growth until the first
wrap. (2) Incrementing modulo satisfies R2's "two consecutive dates yield
different indexes" criterion by construction (N ≥ 2); a per-day seeded-PRNG
pick (an alternative found in the ecosystem) does not — adjacent days can
collide. (3) It matches established ecosystem practice. Spoiler-resistance
framing: under R7 (static files, pure client-side) every scheme is fully
derivable by anyone reading the shipped files — proven by complete
future-answer extraction from the genre-original. A shuffled committed list
resists only the casual glance; that is the maximum achievable without a
server, which R7 forbids. With N ≥ 1000 per Language the first repeat comes
after ≥ 1000 days (~2.7 years); appending words before the first wrap
extends the runway without disturbing the schedule.

Surfaced for `/hive:waggle`: the wrap/exhaustion policy (words repeat after
N days — acceptable, or is list growth planned?) should be settled
consciously in the ADR, not by default.

### Evidence

- [CITED: https://reichel.dev/blog/reverse-engineering-wordle] Genre-original scheme: fixed committed list in play order, `wordlist[days % wordlist.length]`.
- [CITED: https://github.com/MoritzHayden/wordle-prophecy] All past and future answers extracted from the shipped client — existence proof that a committed play-order list is fully derivable client-side.
- [CITED: https://gist.github.com/cfreshman/a03ef2cba789d8cf00c08f767e0fad7b] Author re-sorted the source answers *into* alphabetical order for publication — corroborates the in-source order was play order, not alphabetical.
- [VERIFIED: https://github.com/lynn/hello/blob/main/src/util.ts] Seeded-PRNG alternative (`mulberry32(YYYYMMDD)` pick) — no guarantee consecutive days differ; fails R2's criterion by construction.
- [VERIFIED: docs/prd/PRD-001-wortex.md] R2 acceptance criterion "two consecutive dates yield different indexes into the solution list"; R7 static-files constraint.

### Answer

Shuffled-once fixed order per Language, committed to the repo, indexed
`dayIndex % N` (normalized `((i % N) + N) % N` if defensive coding is
wanted). Alphabetical + index arithmetic is rejected: adjacent-day spoilers
or schedule instability. Final sign-off belongs to the `/hive:waggle` ADR
round, together with the wrap policy.

**Confidence:** HIGH

## Assumptions Log

- **A1** (backs Q1): the Daily Puzzle epoch is **2026-07-01** (a date on or
  before Wortex's first release) — what would verify it: human acceptance
  here or in the `/hive:waggle` ADR that fixes the constant.
