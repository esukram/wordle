---
id: ADR-0002
status: accepted
scope: prd
derived-from: PRD-001
informed-by: [RES-002]
supersedes: null
date: 2026-07-05
---

# ADR-0002: Daily Puzzle solution selection — epoch anchoring, list order, and wrap policy

## Context and Problem Statement

[PRD-001](../prd/PRD-001-wortex.md) R2 requires the Daily Puzzle's solution
to be a pure function of (local date, Language), computed entirely
client-side, with consecutive dates yielding different indexes into the
solution list, per-Language independence, and no replay of a completed
date. R7 forbids any server: the whole scheme must live in static files.

The epoch date is a settled input: **2026-07-01**, accepted 2026-07-05 by
human (recorded in [PRD-001](../prd/PRD-001-wortex.md) Open Questions and
[RES-002](../research/RES-002-daily-mapping.md) A1). This ADR does not
re-decide it. What remains open, and what this ADR decides:

1. **Day-index construction** — how (local date − epoch) becomes an integer
   index.
2. **Solution-list ordering** — what order the committed list is in and how
   the index selects from it.
3. **Wrap/exhaustion policy** — what happens when the day index reaches the
   list length N.

## Domain context

- **Daily Puzzle** (core subdomain): the shared per-date ritual is
  Wortex's differentiator; the date→word mapping decided here is the heart
  of that context and is, per R2, a pure function — named here because the
  mapping *is* the decision, not as implementation guidance.
- **Language** (supporting): each Language owns its solution list; the
  mapping function and epoch constant form a small **shared kernel**
  between the English and German Daily Puzzle instances, while the two
  lists themselves go **separate ways** (per-Language independence, R2).
- **Statistics** (supporting): a downstream **customer–supplier** consumer
  of Daily Puzzle outcomes keyed by *date*, not word — so a wrapped repeat
  of a word years later does not perturb streaks or distributions.
- **Free Play** (generic): selects solutions randomly; untouched by this
  decision (**separate ways**).

## Decision Drivers

- **D1 — Determinism (R2):** same (local date, Language) twice yields the
  same word, testable via `node --test`.
- **D2 — Adjacent-day difference by construction (R2):** the acceptance
  criterion "two consecutive dates yield different indexes" must hold
  always, not probabilistically.
- **D3 — Local-date semantics (R2):** the puzzle flips at the *player's*
  local midnight, correct in every timezone and across DST transitions.
- **D4 — Per-Language independence (R2):** English and German words of the
  same date are unrelated.
- **D5 — Spoiler resistance within R7's ceiling:** every fully client-side
  scheme is derivable by anyone reading the shipped files — proven by
  complete future-answer extraction from the genre-original
  [VERIFIED: docs/research/RES-002-daily-mapping.md, confidence: HIGH] —
  so the achievable bar is resisting the casual glance, no more.
- **D6 — Schedule stability under list growth:** appending solutions must
  not change any already-played or scheduled future date's word.
- **D7 — Simplicity (R7):** static files, no build step, no dependencies;
  the mapping should be a handful of lines.
- **D8 — Longevity:** no player-visible degradation for years at the
  verified list-size floor of ≥1000 solutions per Language
  [VERIFIED: docs/research/RES-001-word-list-sourcing.md, confidence: HIGH
  — 3,791 English / 2,561 German solution candidates against a ≥1000
  target].

## Considered Options

1. **Local-midnight epoch + `Math.round` day index; shuffled-once
   committed play order; normalized modulo wrap**
2. **Alphabetical list + coprime-stride index arithmetic**
3. **Per-day seeded PRNG selection**
4. **Fixed-milliseconds epoch constant + `Math.floor` day index**
5. **Hard end at list exhaustion**
6. **Append-only growth as the sole exhaustion policy (no wrap)**

Options 1–4 compete on the index/ordering axes; options 5–6 compete with
option 1's wrap clause.

## Decision Outcome

Chosen option: **Option 1 — local-midnight epoch + `Math.round` day index,
shuffled-once committed play order, normalized modulo wrap**, because it is
the only combination that satisfies D2 by construction, D3 exactly, and D6
until the first wrap, while staying within D7's few-lines budget.

Concretely, per Language:

- Epoch constant constructed as local midnight — `new Date(2026, 6, 1)` —
  never as a fixed milliseconds value.
- `dayIndex = Math.round((localMidnightToday - epoch) / 864e5)`;
  `Math.round` absorbs 23/25-hour DST days
  [VERIFIED: docs/research/RES-002-daily-mapping.md, confidence: MEDIUM —
  corroborated ecosystem practice, CITED sources in RES-002].
- Each Language ships its solution list **shuffled once at build-of-list
  time and committed in play order**; the day's word is
  `list[((dayIndex % N) + N) % N]`. The normalization is required because
  JS `%` takes the dividend's sign
  [VERIFIED: docs/research/RES-002-daily-mapping.md, confidence: HIGH —
  `node -e "console.log(-3 % 10)"` → `-3`].
- **Wrap policy:** the modulo wrap is the accepted backstop — after N days
  the schedule repeats from the list's start. Appending new solutions to
  the end of a list **before its first wrap** is the sanctioned growth
  path: it extends the runway without changing any scheduled date (D6).
  Reordering or inserting into a committed list is forbidden — it silently
  rewrites the future schedule. At the verified floor of N ≥ 1000 the
  first repeat is no earlier than ~2029-03 (epoch + 1000 days), and at the
  candidate-pool sizes (2,561 German / 3,791 English) potentially ~7–10
  years out.

**Confirmation:** `node --test` cases pinned to R2's acceptance criteria —
same (date, Language) twice → same word; every pair of consecutive dates in
a sampled range → different indexes; date pairs straddling DST transitions →
indexes differ by exactly 1; a pre-epoch date → a valid in-range index;
English and German mappings for one date → independent words. Review point:
if either list is still un-grown when its computed first-wrap date is under
a year away, revisit whether the repeat is still acceptable.

### Consequences

- Good, because R2's determinism and adjacent-day criteria hold by
  construction (D1, D2) and are trivially unit-testable.
- Good, because the mapping is ~5 lines of dependency-free JS (D7) and
  behaves correctly in every timezone (D3).
- Good, because list growth is possible without disturbing the schedule
  (D6) — the wrap is a backstop, not a countdown.
- Bad, because after N days solutions repeat in the same order — a
  long-tenured player eventually sees words again, and the repeat cycle is
  as derivable as everything else (D5's ceiling).
- Bad, because the committed play order becomes **load-bearing data**: an
  accidental reorder (a well-meaning "sort this file" edit) silently
  changes every future puzzle. The list files need a do-not-reorder notice
  and, ideally, a test guarding their head entries — planner's call.
- Bad, because full spoiler-derivability is inherent: anyone reading the
  shipped files can extract every future answer. This is R7's price, not
  this option's — no client-side alternative does better
  [VERIFIED: docs/research/RES-002-daily-mapping.md, confidence: HIGH].

## Pros and Cons of the Options

### Option 1 — Local-midnight epoch + `Math.round`; shuffled committed order; normalized modulo wrap

- Good, because adjacent-day difference is structural: index increments by
  1 daily, so consecutive dates always differ (N ≥ 2) — D2 by construction.
- Good, because `Math.round` over local-midnight dates gives exact
  local-date semantics through DST (D3)
  [VERIFIED: docs/research/RES-002-daily-mapping.md, confidence: MEDIUM].
- Good, because shuffled order means yesterday's answer reveals nothing
  about today's to a casual observer — the D5 ceiling, achieved.
- Good, because appends before first wrap are schedule-stable (D6).
- Bad, because the shuffle is opaque to review: the order carries no
  meaning a reviewer can check, and corruption of the order is invisible
  in a diff unless guarded.
- Bad, because words repeat after N days (mitigated by D8's runway, not
  eliminated).

### Option 2 — Alphabetical list + coprime-stride arithmetic

Keep the list alphabetical (reviewable, mergeable) and pick
`list[(dayIndex * stride) % N]` with stride coprime to N.

- Good, because an alphabetical list is human-reviewable and produces
  clean diffs on curation.
- Good, because a coprime stride visits every word exactly once per cycle
  and avoids the naked-modulo problem of alphabetically adjacent
  consecutive answers.
- Bad, because the schedule is a function of **N**: any append changes N,
  breaks coprimality or changes the permutation, and reshuffles the entire
  future — and can re-serve recently played words (violates D6)
  [VERIFIED: docs/research/RES-002-daily-mapping.md, confidence: HIGH].
- Bad, because plain modulo without the stride — the tempting
  simplification — makes yesterday's answer nearly reveal today's (worst
  possible D5).
- **Rejected because** D6 (schedule stability under growth) outweighs its
  reviewability edge: the one maintenance operation we expect (appending
  words) is exactly the operation that breaks it.

### Option 3 — Per-day seeded PRNG selection

Seed a PRNG (e.g. `mulberry32(YYYYMMDD)`) per date and pick a random index
— a real ecosystem pattern
[VERIFIED: docs/research/RES-002-daily-mapping.md, confidence: HIGH — the
`lynn/hello` source uses exactly this].

- Good, because no committed order is needed; the list can stay
  alphabetical and grow freely without a schedule concept at all.
- Good, because it never "exhausts" — there is no wrap question.
- Bad, because adjacent days **can collide** on the same index — R2's
  "consecutive dates yield different indexes" criterion fails by
  construction, and any dedupe patch reintroduces order-dependence
  [VERIFIED: docs/research/RES-002-daily-mapping.md, confidence: HIGH].
- Bad, because growth changes N and therefore silently changes *past*
  dates' words too, breaking replay-consistency of in-progress state (R6).
- **Rejected because** it fails driver D2 outright — R2's acceptance
  criterion is a hard requirement, not a preference.

### Option 4 — Fixed-milliseconds epoch constant + `Math.floor` day index

Hardcode the epoch as a milliseconds timestamp and floor the difference —
what a widely forked clone template ships
[VERIFIED: docs/research/RES-002-daily-mapping.md, confidence: HIGH — the
constant `1641013200000` + `Math.floor` confirmed in the template source].

- Good, because it is a single constant with no `Date`-constructor
  subtleties, and it demonstrably ships (many forks run it).
- Bad, because a fixed-ms constant is midnight in **one** timezone only:
  players elsewhere get the wrong local rollover time, and
  `Math.floor` mis-buckets 23-hour DST days — violating R2's local-date
  semantics (D3) [VERIFIED: docs/research/RES-002-daily-mapping.md,
  confidence: MEDIUM].
- **Rejected because** it fails driver D3: R2 says *local* date, and this
  construction is only correct in the author's timezone.

### Option 5 — Hard end at list exhaustion

When `dayIndex ≥ N`, the Daily Puzzle shows an "out of puzzles" state.

- Good, because no word ever repeats — the purist answer to D5/D8.
- Good, because it is honest: no silent recycling.
- Bad, because it turns an unattended repo into a game that **stops
  working** on a knowable date — a landmine for a dependency-free static
  project explicitly designed to need no operation (D7's spirit).
- **Rejected because** D8 (longevity) is served far better by a wrap
  backstop: a repeat after ~3–10 years is a smaller harm than a dead game.

### Option 6 — Append-only growth as the sole exhaustion policy (no wrap)

Commit to growing the list faster than one word per day consumes it; treat
exhaustion as a maintenance failure, with undefined behavior at the end.

- Good, because with upkeep, no word ever repeats.
- Good, because it matches how the genre-original was actually operated
  (a curated forward schedule)
  [VERIFIED: docs/research/RES-002-daily-mapping.md, confidence: MEDIUM].
- Bad, because it converts a static-file game into a standing editorial
  obligation with no enforcement mechanism — and if the obligation lapses,
  behavior at `dayIndex = N` is either a crash or an accidental,
  undesigned wrap.
- **Rejected because** it is not a policy, it is a hope: D7/D8 demand
  defined behavior at exhaustion regardless of maintenance. (Its good
  part survives inside Option 1: appends before first wrap are the
  sanctioned growth path.)

## Assumptions

None.
