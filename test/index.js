// Barrel entry for the test runner's directory form.
//
// `node --test test/` passes `test/` as a positional to the runner. Node no
// longer searches directory positionals for test files — it resolves them as a
// module specifier, so a bare directory fails with MODULE_NOT_FOUND. Providing
// this index makes `test/` resolve here, and importing every sibling
// `*.test.js` registers the whole suite so the directory form runs it all.
//
// The explicit-file form (`node --test test/<name>.test.js`) is unaffected and
// still runs a single file directly.
import { readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const here = dirname(fileURLToPath(import.meta.url));

for (const entry of readdirSync(here)) {
  if (entry.endsWith('.test.js')) {
    await import(join(here, entry));
  }
}
