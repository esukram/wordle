// Browser wiring for a playable round (PRD-001 R1, R4).
//
// This module is import-safe in Node: it reads no DOM at import time and only
// wires the page when a document is present. All game logic lives in the
// DOM-free modules game.js / keyboard.js / scoring.js.

import {
  createRound,
  submitGuess,
  keyStates,
  restoreRound,
  serializeRound,
  isFreshDaily,
  randomSolution,
  MAX_GUESSES,
} from './game.js';
import { layoutRows } from './keyboard.js';
import { dayIndex, dailySolution } from './daily.js';
import { createStorage } from './storage.js';
import { updateStats } from './stats.js';
import { renderStats } from './statsview.js';
import { defaultLanguage, LANGUAGES } from './language.js';

const WORD_LENGTH = 5;

export function init(doc) {
  const board = doc.getElementById('board');
  const keyboard = doc.getElementById('keyboard');
  const message = doc.getElementById('message');

  const modeDailyBtn = doc.getElementById('mode-daily');
  const modeFreeBtn = doc.getElementById('mode-free');
  const newRoundBtn = doc.getElementById('new-round');

  const statsButton = doc.getElementById('stats-button');
  const statsModal = doc.getElementById('stats-modal');
  const statsContent = doc.getElementById('stats-content');
  const statsClose = doc.getElementById('stats-close');

  const langToggle = doc.getElementById('lang-toggle');

  const storage = createStorage();
  const today = dayIndex();

  // Active Language: the persisted choice, else the browser default. Every
  // per-Language source (guess dictionary, Daily solution) follows it.
  const navLang = typeof navigator !== 'undefined' ? navigator.language : undefined;
  let lang = storage.getLang() ?? defaultLanguage(navLang);
  let config = LANGUAGES[lang];
  let dailyWord = dailySolution(lang);
  let guessSet = new Set(config.guesses);

  // 'daily' persists to storage and updates Statistics; 'free' (PRD-001 R3)
  // writes nothing — only the Daily flow may reach a storage writer.
  let mode = 'daily';
  let round;
  let typed = '';

  // Restore today's puzzle if a matching state is stored; a stale date's state
  // is discarded so the new day starts fresh (ADR-0002, no replay of a
  // finished puzzle before the next date).
  function loadDailyRound() {
    const stored = storage.getDaily(lang);
    if (isFreshDaily(stored, today)) {
      return restoreRound(stored.guesses, dailyWord, guessSet);
    }
    if (stored) storage.clearDaily(lang);
    return createRound(dailyWord, guessSet);
  }

  // --- Board -------------------------------------------------------------
  const rows = [];
  board.textContent = '';
  for (let r = 0; r < MAX_GUESSES; r++) {
    const row = doc.createElement('div');
    row.className = 'board-row';
    const tiles = [];
    for (let c = 0; c < WORD_LENGTH; c++) {
      const tile = doc.createElement('div');
      tile.className = 'tile';
      row.appendChild(tile);
      tiles.push(tile);
    }
    board.appendChild(row);
    rows.push({ row, tiles });
  }

  function renderBoard() {
    for (let r = 0; r < MAX_GUESSES; r++) {
      const { tiles } = rows[r];
      const played = round.guesses[r];
      for (let c = 0; c < WORD_LENGTH; c++) {
        const tile = tiles[c];
        tile.className = 'tile';
        if (played) {
          tile.textContent = played.word[c];
          tile.classList.add('filled', played.marks[c]);
        } else if (r === round.guesses.length && c < typed.length) {
          tile.textContent = typed[c];
          tile.classList.add('filled');
        } else {
          tile.textContent = '';
        }
      }
    }
  }

  // --- Keyboard ----------------------------------------------------------
  // Rebuilt on Language switch: QWERTY ↔ QWERTZ swap the letter rows.
  const keyEls = new Map();
  function buildKeyboard() {
    keyEls.clear();
    keyboard.textContent = '';
    for (const keys of layoutRows(lang)) {
      const rowEl = doc.createElement('div');
      rowEl.className = 'keyboard-row';
      for (const { key, label, wide } of keys) {
        const btn = doc.createElement('button');
        btn.type = 'button';
        btn.className = wide ? 'key wide' : 'key';
        btn.textContent = label;
        btn.addEventListener('click', () => handleKey(key));
        rowEl.appendChild(btn);
        if (key.length === 1) keyEls.set(key, btn);
      }
      keyboard.appendChild(rowEl);
    }
  }
  buildKeyboard();

  function renderKeyboard() {
    const states = keyStates(round.guesses);
    for (const [letter, btn] of keyEls) {
      btn.classList.remove('correct', 'present', 'absent');
      if (states[letter]) btn.classList.add(states[letter]);
    }
  }

  // --- Input -------------------------------------------------------------
  function showMessage(text) {
    message.textContent = text;
  }

  function announceEnd() {
    if (round.status === 'won') showMessage('You solved it!');
    else if (round.status === 'lost') {
      showMessage(`Out of guesses — the answer was ${round.solution.toUpperCase()}`);
    }
  }

  // --- Statistics --------------------------------------------------------
  function openStats(stats) {
    statsContent.innerHTML = renderStats(stats);
    statsModal.classList.remove('hidden');
  }

  function closeStats() {
    statsModal.classList.add('hidden');
  }

  // Record a finished Daily round exactly once. A restored finished round
  // never routes through here (it skips the submit path), and the
  // lastDayIndex guard stops any double-count for today.
  function recordDailyResult() {
    const stats = storage.getStats(lang);
    if (stats.lastDayIndex === today) return;
    const updated = updateStats(stats, {
      won: round.status === 'won',
      attempts: round.guesses.length,
      dayIndex: today,
    });
    storage.setStats(lang, updated);
    openStats(updated);
  }

  function reject() {
    const rowEl = rows[round.guesses.length].row;
    rowEl.classList.remove('shake');
    void rowEl.offsetWidth; // restart the animation
    rowEl.classList.add('shake');
    showMessage('Not in word list');
  }

  function handleKey(key) {
    if (round.status !== 'playing') return;

    if (key === 'Enter') {
      if (typed.length < WORD_LENGTH) {
        showMessage('Not enough letters');
        return;
      }
      const result = submitGuess(round, typed);
      if (result.rejected) {
        reject();
        return;
      }
      round = result.round;
      typed = '';
      showMessage('');
      renderBoard();
      renderKeyboard();
      // Only the Daily Puzzle persists; Free Play writes nothing (PRD-001 R3).
      if (mode === 'daily') {
        storage.setDaily(lang, serializeRound(round, today));
        // On round end, record Statistics and surface them (PRD-001 R5).
        if (round.status !== 'playing') recordDailyResult();
      }
      announceEnd();
      return;
    }

    if (key === 'Backspace') {
      typed = typed.slice(0, -1);
      showMessage('');
      renderBoard();
      return;
    }

    if (/^[a-z]$/.test(key) && typed.length < WORD_LENGTH) {
      typed += key;
      showMessage('');
      renderBoard();
    }
  }

  doc.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === 'Enter' || e.key === 'Backspace') {
      e.preventDefault();
      handleKey(e.key);
    } else if (/^[a-zA-Z]$/.test(e.key)) {
      handleKey(e.key.toLowerCase());
    }
  });

  // --- Modes -------------------------------------------------------------
  // Render whatever round is now active. `#new-round` (start another random
  // round) is offered in Free Play only.
  function refresh() {
    typed = '';
    showMessage('');
    newRoundBtn.classList.toggle('hidden', mode !== 'free');
    renderBoard();
    renderKeyboard();
    announceEnd();
  }

  function startFreeRound() {
    mode = 'free';
    round = createRound(randomSolution(config.solutions), guessSet);
    refresh();
  }

  function startDaily() {
    mode = 'daily';
    round = loadDailyRound();
    refresh();
  }

  // Flip en ↔ de: persist the choice and re-wire every per-Language source.
  // The two Daily Puzzles are independent — switching restores the other
  // Language's own daily state and Statistics; Free Play starts a fresh round
  // from the other Language's solutions.
  function switchLanguage() {
    lang = lang === 'en' ? 'de' : 'en';
    storage.setLang(lang);
    config = LANGUAGES[lang];
    dailyWord = dailySolution(lang);
    guessSet = new Set(config.guesses);
    if (langToggle) langToggle.textContent = lang.toUpperCase();
    buildKeyboard();
    if (mode === 'free') startFreeRound();
    else startDaily();
  }

  statsButton.addEventListener('click', () => openStats(storage.getStats(lang)));
  statsClose.addEventListener('click', closeStats);

  modeFreeBtn.addEventListener('click', startFreeRound);
  modeDailyBtn.addEventListener('click', startDaily);
  // In Free Play a new round can start at any time, finished round included.
  newRoundBtn.addEventListener('click', startFreeRound);
  if (langToggle) langToggle.addEventListener('click', switchLanguage);

  if (langToggle) langToggle.textContent = lang.toUpperCase();
  startDaily();
}

if (typeof document !== 'undefined') {
  init(document);
}
