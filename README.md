# Wortex

Wortex is a browser word-guessing game shipped as static, dependency-free
HTML/CSS/JS. It offers two modes per **Language** (English or German):

- **Daily Puzzle** — one round per calendar date per Language, its solution
  derived deterministically client-side from the date. The only mode that
  affects **Statistics**.
- **Free Play** — unlimited practice rounds against randomly chosen
  solutions. Never affects Statistics.

**Statistics** are the per-Language record of Daily Puzzle outcomes
(games played, wins, losses, current streak, maximum streak, and guess
distribution) persisted in `localStorage`.

## Run it

Wortex needs no build step and no dependencies. Serve the repo root over a
static HTTP server and open it in a browser:

```sh
python3 -m http.server
```

Then open <http://localhost:8000/>.

## Run the tests

Tests use the Node.js built-in test runner (no dependencies):

```sh
node --test test/
```
