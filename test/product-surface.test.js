import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), '..');

// Banned substrings, assembled from char codes so this test file itself
// never contains them literally and stays grep-clean.
const fromCodes = (...codes) => String.fromCharCode(...codes);
const banned = [
  // the genre-original word-guessing game's name
  fromCodes(119, 111, 114, 100, 108, 101),
  // the full name of the New York newspaper company that publishes it
  fromCodes(110, 101, 119, 32, 121, 111, 114, 107, 32, 116, 105, 109, 101, 115),
  // its three-letter initialism
  fromCodes(110, 121, 116),
];

// Product surface: named root files plus css/, js/, data/ directories.
// Everything else (docs/, test/, .git/, .hive/, .claude/) is excluded.
const rootFiles = ['index.html', 'README.md', 'package.json', 'WORD-LISTS-LICENSE'];
const surfaceDirs = ['css', 'js', 'data'];

function collect() {
  const files = [];
  for (const name of rootFiles) {
    const p = join(repoRoot, name);
    if (existsSync(p)) files.push(p);
  }
  const walk = (dir) => {
    for (const entry of readdirSync(dir)) {
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) walk(p);
      else files.push(p);
    }
  };
  for (const name of surfaceDirs) {
    const p = join(repoRoot, name);
    if (existsSync(p) && statSync(p).isDirectory()) walk(p);
  }
  return files;
}

test('no banned game/publisher name on the product surface', () => {
  for (const file of collect()) {
    const content = readFileSync(file, 'utf8').toLowerCase();
    for (const bad of banned) {
      assert.ok(
        !content.includes(bad),
        `banned substring found in ${file}`,
      );
    }
  }
});

test('package.json ships zero dependencies', () => {
  const pkg = JSON.parse(readFileSync(join(repoRoot, 'package.json'), 'utf8'));
  const empty = (o) => !o || Object.keys(o).length === 0;
  assert.ok(empty(pkg.dependencies), 'dependencies must be absent or empty');
  assert.ok(empty(pkg.devDependencies), 'devDependencies must be absent or empty');
});
