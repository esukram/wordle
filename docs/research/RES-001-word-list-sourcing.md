---
id: RES-001
prd: PRD-001
status: answered
questions:
  - "Word list sourcing: which freely licensed sources provide (a) an English 5-letter solution list + larger valid-guess list, and (b) a German equivalent after excluding ä/ö/ü/ß words? What license attribution do they require, and are the umlaut-free German lists still large enough (target: ≥1000 solutions, ≥5000 valid guesses per Language)?"
created: 2026-07-05
---

# RES-001: Word list sourcing for both Languages

Research for [PRD-001](../prd/PRD-001-wortex.md) (PRD-001-R1, PRD-001-R4, PRD-001-R7).

## Q1: Word list sourcing (English + German, licenses, sizes)

### Findings

Human ruling (2026-07-05): solution words **may include inflected forms**
(plurals, conjugations); valid-guess lists include them in any case. This
makes the German target reachable.

**English.** Two public-domain guess-list candidates exist: ENABLE
(8,636 five-letter words, formally released into the public domain) and
Knuth's Stanford GraphBase `sgb-words.txt` (exactly 5,757 five-letter
words, public domain). Both ship without naming any game or publisher.
For solutions, intersecting ENABLE with the FrequencyWords English
top-50k yields 3,791 common five-letter words — well over the ≥1000
target, with margin for further curation (e.g. a tighter frequency
cutoff to drop proper-noun homographs). SCOWL remains a fallback
(MIT-like notice-preservation license), but its custom-list web service
returned an error stub when exercised, and it is not needed.

**German.** No ready-made compliant list exists; derive one. The CC0
`enz/german-wordlist` full-form list, lowercased and filtered to
`^[a-z]{5}$` (which drops all ä/ö/ü/ß words, satisfying PRD-001-R4),
yields 8,062 valid guesses — over the ≥5000 target from this single
source. Lowercasing first is essential: German nouns are capitalized in
the source (291,430 capitalized lines), and filtering without
lowercasing yields only 3,720. For solutions, intersecting with the
FrequencyWords German top-50k yields 2,561 common forms — over the
≥1000 target. Lemma-only sources are demonstrably too small (an
OpenThesaurus-derived project got only 2,412 guesses / 808 solutions
even with transliterated umlaut words). The CC0 `atebits/Words` `de.txt`
is a usable supplement (5,352 lowercased five-letter forms; union with
enz: 9,023) and stores umlauts raw (1,667 `grün` substring matches, zero
exact `gruen`), so the `^[a-z]{5}$` filter excludes rather than admits
transliterations — but it is not required to meet the targets.

**Licenses.** ENABLE, SGB, enz, atebits: public domain / CC0 — no
attribution required, nothing third-party-branded. FrequencyWords:
MIT for code, **CC-BY-SA 4.0 for the frequency-list content** — the
derived solution lists need an attribution + license note (e.g. in a
`WORD-LISTS-LICENSE` file), which names a corpus, not any game or
publisher, so PRD-001-R7 is satisfied. Avoid DeReKo/DeReWo frequency
data (CC BY-NC 3.0, noncommercial restriction).

### Evidence

- [VERIFIED: https://www-cs-faculty.stanford.edu/~knuth/sgb.html] "Public-domain sources … freely available"; "sgb-words.txt, the 5757 five-letter words of English". Local count confirms: `grep -cE '^[a-z]{5}$' sgb-words.txt` → 5757.
- [VERIFIED: https://raw.githubusercontent.com/en-wl/wordlist/master/scowl/Copyright] ENABLE "formally released into the Public Domain"; SCOWL notice-preservation terms.
- [VERIFIED: enable1.txt local count] `grep -cE '^[a-z]{5}$' enable1.txt` → 8636.
- [VERIFIED: local experiment 2026-07-05] ENABLE ∩ FrequencyWords `en_50k.txt` (lowercased, `^[a-z]{5}$`) → 3791 English solution candidates.
- [VERIFIED: https://github.com/enz/german-wordlist] License CC0-1.0. Local counts on the raw `words` file: 291,430 capitalized lines; lowercased `^[a-z]{5}$` → 8062; without lowercasing → 3720.
- [VERIFIED: local experiment 2026-07-05] enz (lowercased) ∩ FrequencyWords `de_50k.txt` → 2561 German solution candidates.
- [VERIFIED: https://github.com/atebits/Words] CC0-1.0. Local checks on `de.txt`: raw umlauts present (`grep -c "grün"` → 1667), no exact `gruen` line → no transliteration; lowercased `^[a-z]{5}$` → 5352; union with enz → 9023.
- [VERIFIED: https://github.com/hermitdave/FrequencyWords] MIT (code) + CC-BY-SA 4.0 (list content), derived from OpenSubtitles corpora.
- [VERIFIED: https://github.com/klamann/diceware-dereko] DeReKo/DeReWo frequency data is CC BY-NC 3.0 (noncommercial) — excluded.
- [CITED: https://github.com/darwinbecker/wordle] OpenThesaurus-derived German clone: 2,412 five-letter guesses / 808 solutions even with umlaut transliteration — negative evidence on lemma-only sources.
- [VERIFIED: local experiment 2026-07-05] SCOWL web service (`app.aspell.net/create?max_size=35…`) returned a 112-byte error stub — SCOWL tier counts unverified, and moot.

### Answer

English: valid guesses = ENABLE (public domain, 8,636 words); solutions =
ENABLE ∩ FrequencyWords English top-50k (3,791 candidates, curate down as
desired). German: valid guesses = enz/german-wordlist (CC0), lowercased and
filtered to `^[a-z]{5}$` (8,062 words); solutions = that set ∩ FrequencyWords
German top-50k (2,561 candidates). Both targets (≥1000 solutions, ≥5000
guesses) are met per Language with verified counts. Only attribution
obligation: a CC-BY-SA 4.0 notice for the FrequencyWords-derived solution
lists, naming no game or publisher.

**Confidence:** HIGH

## Assumptions Log

None. (The scout's original A1–A3 count assumptions were resolved by local
experiments on 2026-07-05: A1 superseded — enz meets the guess target once
lowercased; A2 verified — 2,561 ≥ 1000 under the accepted inflected-forms
ruling; A3 moot — SCOWL is not needed for the solution list.)
