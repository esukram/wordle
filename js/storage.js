// Versioned localStorage wrapper owning the wortex.v1.* key schema (PRD-001 R6).
// Backend is injectable (any object with getItem/setItem/removeItem) so it runs
// under node --test without a DOM.

import { emptyStats } from './stats.js';

const K = {
  lang: 'wortex.v1.lang',
  stats: (lang) => `wortex.v1.stats.${lang}`,
  daily: (lang) => `wortex.v1.daily.${lang}`,
};

function readJSON(backend, key) {
  const raw = backend.getItem(key);
  if (raw == null) return undefined;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

export function createStorage(backend = globalThis.localStorage) {
  return {
    getLang() {
      return readJSON(backend, K.lang) ?? null;
    },
    setLang(lang) {
      backend.setItem(K.lang, JSON.stringify(lang));
    },
    getStats(lang) {
      return readJSON(backend, K.stats(lang)) ?? emptyStats();
    },
    setStats(lang, stats) {
      backend.setItem(K.stats(lang), JSON.stringify(stats));
    },
    getDaily(lang) {
      return readJSON(backend, K.daily(lang)) ?? null;
    },
    setDaily(lang, state) {
      backend.setItem(K.daily(lang), JSON.stringify(state));
    },
    clearDaily(lang) {
      backend.removeItem(K.daily(lang));
    },
  };
}
