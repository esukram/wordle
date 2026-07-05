---
id: PRD-001
title: Wortex — bilingual daily word-guessing game
status: approved
created: 2026-07-05
research: [RES-001, RES-002]
adrs: []
milestones: []
---

# PRD-001: Wortex — bilingual daily word-guessing game

## Problem

Word-guessing games of the five-letter genre are popular but are typically
English-only, tied to an online service, or both. German-speaking players who
want the same daily ritual — and bilingual players who want to play in both
languages — have no single lightweight game that works entirely in the
browser, keeps their results private on their own device, and treats each
Language as a first-class experience with its own dictionary and Statistics.

Wortex fills that gap: a fully client-side, dependency-free game with a
Daily Puzzle and Free Play in both English and German.

## Goals / Non-Goals

**Goals**

- A complete, playable word-guessing game that runs from static files with no
  server component.
- One shared Daily Puzzle per date per Language, so players on the same day
  and Language solve the same word.
- English and German as equal Languages, each with its own dictionary,
  keyboard layout, and Statistics.
- All persistence (Statistics, in-progress Daily Puzzle, Language choice) in
  the browser's localStorage.

**Non-Goals**

- No sharing feature (no emoji-grid export, no links, no clipboard).
- No hard mode or other rule variants.
- No accounts, server, sync, or analytics of any kind.
- No umlaut support: German words containing ä, ö, ü, or ß are excluded
  rather than transliterated.
- No reference to any third-party game or publisher anywhere in the product,
  code, or documentation.

## Requirements

### R1: Core guessing gameplay

The player guesses a hidden 5-letter word in at most 6 attempts on a 5×6
tile grid. After each submitted guess, every tile is marked: correct letter
in the correct position, correct letter in the wrong position, or letter not
in the word. Duplicate letters are marked with the standard counting rule (a
letter is marked "present" at most as many times as it occurs unmatched in
the solution). Guesses are entered via physical keyboard or the on-screen
keyboard, whose keys mirror the best-known state of each letter. A guess
that is not in the active Language's valid-guess list is rejected without
consuming an attempt.

**Acceptance criteria**

- Submitting a word from the valid-guess list consumes an attempt and colors
  all 5 tiles — verified by `node --test` unit tests of the scoring function
  plus a manual browser round.
- The scoring function handles duplicate letters per the counting rule for
  the cases (solution `APPLE`, guess `PAPER`) and (solution `ROBOT`, guess
  `OOZES`) — verified by `node --test` unit tests.
- Submitting a string absent from the valid-guess list leaves the grid and
  attempt count unchanged and shows a visible rejection cue — verified
  manually in the browser.
- Winning (guess equals solution) and losing (6 wrong guesses, solution then
  revealed) both end the round with a visible end state — verified manually
  in the browser.

### R2: Daily Puzzle

Each calendar date and Language pair maps deterministically to one solution
word, computed client-side from the local date — every player with the same
date and Language gets the same word. A completed Daily Puzzle for the
current date cannot be replayed; the end state is shown instead until the
next date.

**Acceptance criteria**

- The date→word mapping is a pure function of (date, Language) — verified by
  `node --test`: same input twice yields the same word; two consecutive
  dates yield different indexes into the solution list.
- Reloading after finishing the day's Daily Puzzle shows the finished state,
  not a fresh grid — verified manually in the browser.
- English and German Daily Puzzles of the same date are independent words
  and can both be played on that date — verified manually in the browser.

### R3: Free Play

A Free Play mode serves unlimited rounds with a randomly chosen solution
from the active Language's solution list. Free Play rounds never write to
Statistics.

**Acceptance criteria**

- After finishing a Free Play round, a new round can be started immediately —
  verified manually in the browser.
- Statistics values are byte-identical in localStorage before and after a
  completed Free Play round — verified manually via browser devtools.

### R4: Language switching

The UI offers a switch between English and German. Switching changes the
dictionary, the on-screen keyboard layout (QWERTY for English, QWERTZ for
German), and which Statistics are shown. Both dictionaries contain only A–Z
words. The chosen Language persists in localStorage; on first visit the
Language defaults to German when the browser reports a German language
preference, otherwise English.

**Acceptance criteria**

- Every word in both shipped word lists matches `^[a-z]{5}$` — verified by a
  `node --test` check over the list files.
- Switching Language swaps the keyboard layout and the displayed Statistics —
  verified manually in the browser.
- The selected Language survives a reload — verified manually in the browser.
- With `navigator.language` starting `de` and empty localStorage, the game
  starts in German; otherwise in English — verified manually via browser
  devtools locale override.

### R5: Statistics per Language

For each Language, the game keeps Statistics in localStorage: games played,
wins, losses, current streak, maximum streak, and guess distribution (wins
per attempt count 1–6). Only Daily Puzzle results update Statistics. The
current streak increments when consecutive dates' Daily Puzzles are won and
resets to 0 on a loss or a missed date. A statistics view displays these
values for the active Language.

**Acceptance criteria**

- The Statistics update logic (win, loss, streak increment, streak reset on
  gap or loss, distribution bucket) is a pure function — verified by
  `node --test` unit tests covering each case.
- English and German Statistics are stored under separate localStorage keys
  and update independently — verified manually via browser devtools.
- Finishing a Daily Puzzle opens/updates the statistics view with the new
  values — verified manually in the browser.

### R6: In-progress persistence

An in-progress Daily Puzzle (submitted guesses and their evaluations) is
persisted in localStorage per Language and restored on reload, so a refresh
never loses or resets the day's attempt. State belonging to an older date is
discarded when a new date's Daily Puzzle begins.

**Acceptance criteria**

- Reloading mid-Daily-Puzzle restores the grid, keyboard state, and remaining
  attempts exactly — verified manually in the browser.
- Stored round state from a previous date is not restored on the next date —
  verified manually by manipulating the stored date via browser devtools.

### R7: Static, dependency-free delivery

Wortex ships as static files — HTML, CSS, and JavaScript with the word lists
as plain data files — with no build step, no runtime dependencies, and no
network requests beyond loading its own files. The product, source code, and
documentation contain no reference to any third-party game or publisher.

**Acceptance criteria**

- Opening the app via a plain static file server (`python3 -m http.server`)
  yields a fully playable game — verified manually in the browser.
- `package.json` dependencies, if the file exists at all, are empty, and the
  repository contains no lockfile with runtime dependencies — verified by
  inspection.
- The browser devtools network tab shows only same-origin requests —
  verified manually.
- A case-insensitive grep for third-party game/publisher names over the
  product surface — source code, word-list data, UI strings, README — returns
  no hits; provenance documents (`docs/research/`, `docs/audit/`) are exempt,
  as their citation URLs necessarily name upstream sources — verified by
  `grep -ri --exclude-dir=research --exclude-dir=audit` during review.

## Open Questions

- **Word list sourcing** — answered in [RES-001](../research/RES-001-word-list-sourcing.md):
  both Languages meet the targets from public-domain/CC0 sources with
  frequency-derived solution lists (only obligation: a CC-BY-SA attribution
  note naming a corpus, no game/publisher).
- **Daily Puzzle epoch** — researched in [RES-002](../research/RES-002-daily-mapping.md):
  epoch is **2026-07-01** (accepted 2026-07-05 by human).
- **Solution-list ordering** — answered in [RES-002](../research/RES-002-daily-mapping.md):
  shuffled-once fixed order per Language, committed, indexed `dayIndex % N`;
  final sign-off with the wrap policy in `/hive:waggle`.
- **Wrap/exhaustion policy** (surfaced by RES-002): after N days the
  solution list repeats — acceptable, or is append-only list growth planned?
  One sentence in the `/hive:waggle` ADR settles it.
- Settled 2026-07-05 (human): solution words may include inflected forms
  (plurals, conjugations) — lemma-only German sources miss the size target
  (see [RES-001](../research/RES-001-word-list-sourcing.md)).
- Settled 2026-07-05 (human): R7's no-third-party-reference rule covers the
  product surface only; provenance documents (`docs/research/`,
  `docs/audit/`) are exempt — R7's acceptance criterion amended accordingly.
