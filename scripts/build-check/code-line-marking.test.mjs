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

test('a built recipe codeblock holds both added and removed rows', () => {
  const html = readFileSync(join(root, 'build/vector-apps/recipes/add-page-and-permission/index.html'), 'utf8');
  const blocks = [...html.matchAll(/<pre\b[\s\S]*?<\/pre>/g)].map(([block]) => block);
  const marked = blocks.filter((block) => /token-line[^"]*code-line-added/.test(block) && /token-line[^"]*code-line-removed/.test(block));
  assert.ok(marked.length >= 1, 'a codeblock with both an added and a removed row');
  assert.doesNotMatch(marked.join(''), /(?:added|removed)-(?:next-line|start|end)/, 'the marker comments are not shown');
});
