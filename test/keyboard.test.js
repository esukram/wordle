import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LAYOUTS, layoutRows } from '../js/keyboard.js';

for (const [lang, rows] of Object.entries(LAYOUTS)) {
  test(`${lang} layout has 26 distinct a-z letters`, () => {
    const letters = rows.join('');
    assert.equal(letters.length, 26);
    assert.equal(new Set(letters).size, 26);
    assert.ok(/^[a-z]+$/.test(letters), 'only lowercase a-z letters');
  });
}

test('en top row starts qwerty, de top row starts qwertz', () => {
  assert.ok(LAYOUTS.en[0].startsWith('qwerty'));
  assert.ok(LAYOUTS.de[0].startsWith('qwertz'));
});

test('layoutRows frames the bottom row with Enter and Backspace', () => {
  const rows = layoutRows('en');
  const bottom = rows[rows.length - 1];
  assert.equal(bottom[0].key, 'Enter');
  assert.equal(bottom[bottom.length - 1].key, 'Backspace');
});
