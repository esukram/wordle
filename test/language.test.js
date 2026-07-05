import { test } from 'node:test';
import assert from 'node:assert/strict';
import { defaultLanguage, LANGUAGES } from '../js/language.js';
import { GUESSES_EN } from '../data/words-en.js';
import { GUESSES_DE } from '../data/words-de.js';
import { SOLUTIONS_EN } from '../data/solutions-en.js';
import { SOLUTIONS_DE } from '../data/solutions-de.js';
import { LAYOUTS } from '../js/keyboard.js';

test('defaultLanguage returns de for any de* browser language', () => {
  for (const nav of ['de', 'de-AT', 'DE-de']) {
    assert.equal(defaultLanguage(nav), 'de');
  }
});

test('defaultLanguage returns en otherwise', () => {
  for (const nav of ['en-US', 'fr', undefined]) {
    assert.equal(defaultLanguage(nav), 'en');
  }
});

test('config map wires de to German sources and QWERTZ', () => {
  assert.equal(LANGUAGES.de.guesses, GUESSES_DE);
  assert.equal(LANGUAGES.de.solutions, SOLUTIONS_DE);
  assert.equal(LANGUAGES.de.layout, LAYOUTS.de);
});

test('config map wires en to English sources and QWERTY', () => {
  assert.equal(LANGUAGES.en.guesses, GUESSES_EN);
  assert.equal(LANGUAGES.en.solutions, SOLUTIONS_EN);
  assert.equal(LANGUAGES.en.layout, LAYOUTS.en);
});
