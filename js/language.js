// Language config and default detection (PRD-001 R4). DOM-free: it only
// assembles the data/layout imports so app.js switches through one object.

import { GUESSES_EN } from '../data/words-en.js';
import { GUESSES_DE } from '../data/words-de.js';
import { SOLUTIONS_EN } from '../data/solutions-en.js';
import { SOLUTIONS_DE } from '../data/solutions-de.js';
import { LAYOUTS } from './keyboard.js';

// First-visit default: German for a `de*` browser language (case-insensitive,
// e.g. `de`, `de-AT`), English otherwise.
export function defaultLanguage(navLang) {
  return typeof navLang === 'string' && navLang.toLowerCase().startsWith('de')
    ? 'de'
    : 'en';
}

// Per-Language wiring: valid-guess dictionary, Free Play / Daily solutions,
// and on-screen keyboard layout.
export const LANGUAGES = {
  en: { guesses: GUESSES_EN, solutions: SOLUTIONS_EN, layout: LAYOUTS.en },
  de: { guesses: GUESSES_DE, solutions: SOLUTIONS_DE, layout: LAYOUTS.de },
};
