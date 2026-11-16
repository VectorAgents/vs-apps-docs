import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const assets = (folder, extension) =>
  readdirSync(join(root, 'build/assets', folder))
    .filter((file) => file.endsWith(extension))
    .map((file) => readFileSync(join(root, 'build/assets', folder, file), 'utf8'));

test('the built styles colour an added and a removed codeblock line', () => {
  const css = assets('css', '.css').join('\n');
  assert.match(css, /\.code-line-added\{[^}]*background:[^}]*box-shadow:/);
  assert.match(css, /\.code-line-removed\{[^}]*background:[^}]*box-shadow:/);
});

test('the client bundle holds the copy button that drops removed lines', () => {
  const bundles = assets('js', '.js');
  assert.ok(bundles.some((code) => code.includes('code-line-removed') && code.includes('.token-line')), 'copy override');
});
