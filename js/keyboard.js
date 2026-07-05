// On-screen keyboard layout data and row helpers (PRD-001 R4).
// No DOM access here — app.js turns these rows into elements.

// Per-Language letter layouts: QWERTY for English, QWERTZ for German.
export const LAYOUTS = {
  en: ['qwertyuiop', 'asdfghjkl', 'zxcvbnm'],
  de: ['qwertzuiop', 'asdfghjkl', 'yxcvbnm'],
};

// Rows of key descriptors for a layout, with Enter and Backspace framing the
// bottom letter row. Each key is `{ key, label, wide }`; letter keys use the
// letter as both key and label, action keys carry a display label and the wide
// flag so the renderer can size them.
export function layoutRows(lang) {
  const rows = LAYOUTS[lang];
  if (!rows) throw new Error(`unknown layout: ${lang}`);

  return rows.map((letters, i) => {
    const keys = [...letters].map((letter) => ({ key: letter, label: letter }));
    if (i === rows.length - 1) {
      keys.unshift({ key: 'Enter', label: 'Enter', wide: true });
      keys.push({ key: 'Backspace', label: '⌫', wide: true });
    }
    return keys;
  });
}
