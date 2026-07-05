# CONTEXT — Wortex Glossary

Canonical vocabulary for the Wortex project. Use these terms exactly; avoid the listed near-synonyms.

## Daily Puzzle

The single word-guessing round per calendar date per Language, its solution derived deterministically client-side from the date (no server). The only mode that affects Statistics.
Avoid: daily word, word of the day, daily challenge.

## Free Play

Unlimited practice rounds against randomly chosen solutions. Never affects Statistics.
Avoid: practice mode, endless mode, random mode.

## Language

One of the two supported game languages: English or German. Each Language has its own dictionary, its own keyboard layout (QWERTY / QWERTZ), and its own Statistics. Both dictionaries are A–Z only (German words containing ä, ö, ü, or ß are excluded).
Avoid: locale, dialect.

## Statistics

The per-Language record of Daily Puzzle outcomes persisted in localStorage: games played, wins, losses, current streak, maximum streak, and guess distribution. Free Play never writes to Statistics.
Avoid: stats, history, score.

## Wortex

The game's name, used in the page title and header. The product, its code, and its docs reference no third-party games or publishers.
Avoid: naming any existing commercial word game.
