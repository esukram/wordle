---
id: ADR-0001
status: accepted
scope: prd
derived-from: PRD-001
informed-by: [RES-001]
supersedes: null
date: 2026-07-05
---

# ADR-0001: Word-list sources and derivation per Language

## Context and Problem Statement

Wortex needs, per Language, two committed data files: a **valid-guess list**
(gates guess acceptance, [PRD-001](../prd/PRD-001-wortex.md) R1) and a
**solution list** (feeds the Daily Puzzle and Free Play, PRD-001 R2/R3).
Constraints from [PRD-001](../prd/PRD-001-wortex.md): every word matches
`^[a-z]{5}$`, German umlaut words are excluded rather than transliterated
(R4); the game ships as static files with zero dependencies and no
third-party game/publisher names on the product surface — provenance docs
exempt (R7); solutions may include inflected forms (Open Questions,
settled 2026-07-05). Targets from
[RES-001](../research/RES-001-word-list-sourcing.md): ≥1000 solutions and
≥5000 valid guesses per Language.

Which upstream sources do we adopt per Language, and how are the shipped
solution and valid-guess lists derived from them? The decision is hard to
reverse: the shipped solution lists anchor the deterministic date→word
schedule (PRD-001 R2, [RES-002](../research/RES-002-daily-mapping.md)) —
replacing them later changes every future Daily Puzzle. File format and
loading mechanism are out of scope (settled as not ADR-worthy in the PRD).

## Domain context

- **Dictionary (word-list data per Language)** — the context this decision
  lives in. Classified **generic/supporting**: word lists are necessary
  but not differentiating, which favors adopting off-the-shelf corpora
  over hand-building — a driver below.
- **Daily Puzzle** — **core** subdomain; downstream consumer of the
  solution list. The relationship is **customer–supplier**: the Daily
  Puzzle's determinism requirement (stable, frozen ordering base) flows
  upstream as a constraint on how lists are derived and changed.
- The derivation pipeline (lowercase → `^[a-z]{5}$` filter → intersect →
  curate) acts as an **anticorruption layer** between upstream corpus
  models (capitalized German nouns, umlauts, proper-noun homographs) and
  the game's Language model (A–Z-only lowercase five-letter words).
- **Statistics** and **Free Play** are untouched beyond consuming the same
  lists. No tactical patterns are decision-relevant.

## Decision Drivers

- **D1 — License compliance and R7 purity** (PRD-001 R7): obligations must
  be dischargeable without naming any game/publisher on the product
  surface; noncommercial-restricted sources are out.
- **D2 — R4 conformance**: A–Z only, `^[a-z]{5}$`, umlaut words excluded
  not transliterated.
- **D3 — Size targets** (RES-001): ≥1000 solutions, ≥5000 guesses per
  Language, with headroom.
- **D4 — Solution quality**: solutions should be words a player can
  plausibly land on; guess lists may be generous, solution lists must not
  contain obscure Scrabble-only words or subtitle-corpus proper-noun noise.
- **D5 — Curation effort**: a dependency-free hobby-scale project; manual
  curation must stay a bounded one-time pass, not an ongoing editorial job.
- **D6 — Schedule stability** (PRD-001 R2, RES-002): the committed solution
  lists are the anchor of the Daily Puzzle schedule; the derivation must be
  reproducible and the shipped lists frozen (append-only at most).

## Considered Options

1. **Frequency-intersected solutions over PD/CC0 guess lists** — English:
   ENABLE guesses, ENABLE ∩ FrequencyWords-top-50k solutions; German:
   enz/german-wordlist guesses, enz ∩ FrequencyWords-top-50k solutions;
   CC-BY-SA attribution note for the derived solution lists (RES-001's
   recommendation).
2. **Public-domain-only stack** — avoid CC-BY-SA entirely: English guesses
   ENABLE ∪ SGB, solutions from Knuth's SGB list; German guesses enz,
   solutions hand-curated from the enz-derived guess list.
3. **Union-of-sources maximal lists** — guesses ENABLE ∪ SGB (English) and
   enz ∪ atebits (German); solutions = the full filtered guess lists, no
   separate frequency signal or curation.

## Decision Outcome

Chosen option: **Option 1 — frequency-intersected solutions over PD/CC0
guess lists**, because it is the only option that satisfies D4 (solution
quality via an objective frequency signal) for **both** Languages at D5's
bounded effort, while its sole license obligation — a CC-BY-SA 4.0
attribution note naming a subtitle corpus, not any game or publisher —
discharges D1 within R7's rules
[VERIFIED: docs/research/RES-001-word-list-sourcing.md, confidence: HIGH].

**Adopted sources and derivation, per Language:**

- **English valid-guess list**: ENABLE, public domain, filtered
  `^[a-z]{5}$` → 8,636 words
  [VERIFIED: docs/research/RES-001-word-list-sourcing.md, confidence: HIGH].
- **German valid-guess list**: enz/german-wordlist, CC0, **lowercased
  first** then filtered `^[a-z]{5}$` (the filter itself drops all
  ä/ö/ü/ß words, satisfying R4's exclude-don't-transliterate rule) →
  8,062 words
  [VERIFIED: docs/research/RES-001-word-list-sourcing.md, confidence: HIGH].
- **Solution lists**: per Language, guess list ∩ the FrequencyWords top-50k
  list (lowercased, same filter) → 3,791 English / 2,561 German candidates
  [VERIFIED: docs/research/RES-001-word-list-sourcing.md, confidence: HIGH],
  followed by **one manual curation pass** removing proper-noun homographs
  and offensive words, then frozen and committed. Solutions are a subset of
  the valid-guess list by construction.
- **Provenance**: a `WORD-LISTS-LICENSE` file carries the CC-BY-SA 4.0
  notice for the FrequencyWords-derived solution lists (FrequencyWords is
  MIT for code but CC-BY-SA 4.0 for list content
  [VERIFIED: docs/research/RES-001-word-list-sourcing.md, confidence: HIGH]);
  ENABLE/enz need no attribution. The notice names a corpus, never a game
  or publisher, so R7's product-surface grep stays clean.
- **Stability**: the derivation is a one-time build step whose output is
  committed; shipped lists change append-only at most (ordering and wrap
  policy are settled separately per
  [RES-002](../research/RES-002-daily-mapping.md), not in this ADR).
- Excluded: DeReKo/DeReWo frequency data (CC BY-NC 3.0, noncommercial
  restriction violates D1)
  [VERIFIED: docs/research/RES-001-word-list-sourcing.md, confidence: HIGH].
  atebits/Words (CC0, 5,352 German forms; union with enz → 9,023) is noted
  as a compatible future append source but not adopted now — targets are
  met without it
  [VERIFIED: docs/research/RES-001-word-list-sourcing.md, confidence: HIGH].

**Confirmation:** the `node --test` list checks pass (`^[a-z]{5}$` over
both shipped lists, PRD-001 R4); shipped counts meet D3's targets; the R7
product-surface grep returns no third-party game/publisher hits; and the
first weeks of Daily Puzzles surface no obscure or proper-noun solutions —
any that slip through are removed in a follow-up curation commit **before**
launch freezes the schedule.

### Consequences

- Good, because both Languages meet the size targets from verified counts
  with a symmetric, reproducible pipeline — no per-Language special-casing
  beyond German lowercasing.
- Good, because the frequency intersection gives an objective commonness
  signal, keeping the manual pass a light diff review instead of curating
  ~1000 words from scratch.
- Good, because guess lists stay attribution-free (PD/CC0) and the only
  obligation is one corpus-naming notice file.
- Bad, because the derived solution lists carry a **CC-BY-SA 4.0
  share-alike obligation** — the project is no longer uniformly
  public-domain, and anyone reusing the solution-list files inherits that
  license. This is the honest cost of buying solution quality with a
  licensed frequency signal.
- Bad, because the FrequencyWords lists come from subtitle corpora, which
  are noisy: proper-noun homographs and informal forms sit in the top-50k,
  so shipping quality still depends on the manual curation pass —
  [ASSUMED, confidence: LOW] that one bounded pass over 3,791 + 2,561
  candidates suffices.

## Pros and Cons of the Options

### Option 1: Frequency-intersected solutions over PD/CC0 guess lists

- Good, because all counts are verified and exceed targets with headroom:
  8,636/3,791 English, 8,062/2,561 German
  [VERIFIED: docs/research/RES-001-word-list-sourcing.md, confidence: HIGH].
- Good, because the frequency signal solves German solution quality — the
  one place no public-domain alternative exists (DeReKo is CC BY-NC)
  [VERIFIED: docs/research/RES-001-word-list-sourcing.md, confidence: HIGH].
- Good, because solutions ⊆ guesses holds by construction.
- Bad, because of the CC-BY-SA share-alike obligation on the derived
  solution lists; [ASSUMED, confidence: LOW] the share-alike scope is
  confined to the solution-list data files and does not reach the game
  code — a plausible but unverified license-scoping reading.
- Bad, because subtitle-corpus noise (proper nouns, informal forms) means
  the raw intersection is not shippable without the curation pass.

### Option 2: Public-domain-only stack

- Good, because zero attribution obligations anywhere — the whole data
  stack is PD/CC0, maximally clean under D1.
- Good, because English is nearly free: SGB's 5,757 five-letter words are
  public domain and verified
  [VERIFIED: docs/research/RES-001-word-list-sourcing.md, confidence: HIGH].
- Bad, because SGB is not curated for commonness as a puzzle-solution pool
  — it contains obscure entries a player cannot plausibly land on
  [ASSUMED, confidence: LOW], so English quality (D4) would still need a
  manual pass.
- Bad, because German has **no** public-domain frequency signal (DeReKo is
  NC-restricted
  [VERIFIED: docs/research/RES-001-word-list-sourcing.md, confidence: HIGH]),
  so ≥1000 German solutions must be hand-curated from the 8,062-word guess
  list — an unbounded editorial job violating D5, with quality resting on
  one person's judgment.
- **Rejected because** driver D5 (bounded curation effort) and D4 (German
  solution quality) outweigh the zero-attribution purity; D1 is already
  satisfied by Option 1's corpus-naming notice, so purity buys nothing R7
  actually requires.

### Option 3: Union-of-sources maximal lists

- Good, because it is the simplest derivation — no frequency dependency,
  no intersection step, all sources PD/CC0 (no attribution), and the most
  generous guess acceptance (German union: 9,023 forms
  [VERIFIED: docs/research/RES-001-word-list-sourcing.md, confidence: HIGH]).
- Good, because maximal solution counts push the Daily Puzzle wrap horizon
  out the furthest (D6 runway).
- Bad, because solutions drawn from the full guess lists fail D4 badly:
  ENABLE is a Scrabble-style competition list full of words unknown to
  ordinary players, and the enz full-form list is similarly uncurated —
  frequent unguessable Daily Puzzles would hollow out the daily ritual the
  PRD exists to serve.
- Bad, because fixing that post-hoc means hand-pruning thousands of words
  — worse than Option 2's curation burden.
- **Rejected because** driver D4 (solution quality) is the core of the
  player experience and outweighs both the derivation simplicity and the
  attribution-free purity; a generous guess list is desirable, but that
  half of the option survives in Option 1 anyway (guess lists are already
  the full filtered sources).

## Assumptions

- One bounded manual curation pass over the 3,791 English + 2,561 German
  frequency-intersected candidates suffices to remove proper-noun
  homographs and offensive words — verified by performing the pass and by
  the confirmation review of the first weeks of Daily Puzzles.
- CC-BY-SA 4.0 share-alike scope extends only to the derived solution-list
  data files, not to the game code that loads them — verified by reading
  the CC-BY-SA 4.0 legal code's adaptation/collection definitions or a
  license-compatibility reference; if wrong, the fallback is Option 2's
  public-domain-only stack.
- Knuth's SGB list, while public domain, is not curated for puzzle-solution
  commonness and contains obscure entries — verified by sampling the list
  against a frequency reference (only material to rejected Option 2).
