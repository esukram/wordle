# Architecture bedrock

<!-- Derived digest — do NOT hand-edit. One entry per accepted ADR,
     maintained by /hive:waggle on acceptance/supersede. The full ADRs in
     docs/adr/ are the source of truth; this file is regenerable from the
     accepted ADR set at any time. -->

## ADR-0001: Word-list sources and derivation per Language
[ADR-0001](docs/adr/ADR-0001-word-list-sources.md)
**Decision:** English lists derive from ENABLE (guesses) ∩ FrequencyWords top-50k (solutions); German lists from enz/german-wordlist lowercased (guesses) ∩ FrequencyWords top-50k (solutions), each `^[a-z]{5}$`-filtered, solution candidates manually curated once, then frozen; CC-BY-SA 4.0 notice in `WORD-LISTS-LICENSE`.
**Binds:** Shipped word lists change append-only at most; solution lists stay a subset of the guess lists; any new data source or derivation change requires superseding this ADR; the attribution notice file must ship with the lists.

## ADR-0002: Daily Puzzle solution selection
[ADR-0002](docs/adr/ADR-0002-daily-word-selection.md)
**Decision:** Day index = `Math.round((localMidnightToday − new Date(2026, 6, 1)) / 864e5)`; each Language's solution list is committed in shuffled-once play order and indexed `list[((dayIndex % N) + N) % N]`; modulo wrap is the exhaustion backstop.
**Binds:** The epoch constant is local-midnight 2026-07-01 (never a fixed-ms value); committed solution lists must never be reordered or have insertions — append-only before the first wrap; changing the mapping scheme requires superseding this ADR.
