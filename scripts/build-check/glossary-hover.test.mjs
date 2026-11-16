import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { slugOf } from '../glossary-index.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const sections = ['vector-space', 'vector-apps', 'sdk'];
const index = JSON.parse(readFileSync(join(root, 'docs-gen', 'glossary-index.json'), 'utf8'));
const built = (url) => readFileSync(join(root, 'build', url, 'index.html'), 'utf8');

const headings = (section) =>
  [...readFileSync(join(root, 'docs', section, 'glossary.md'), 'utf8').matchAll(/^### (.+?)(?: \{#(\S+)\})?$/gm)].map((m) => m[2] ?? slugOf(m[1]));

for (const section of sections) {
  test(`the index has an entry for every heading of the ${section} glossary`, () => {
    for (const slug of headings(section)) assert.ok(index[`${section}#${slug}`]?.definition, `${section}#${slug}`);
  });
}

test('the index holds no entry that is not a glossary heading', () => {
  const expected = sections.flatMap((s) => headings(s).map((slug) => `${s}#${slug}`));
  assert.deepEqual(Object.keys(index).sort(), expected.sort());
});

test('a sample page links to a glossary entry the index defines', () => {
  const page = built('vector-space/organizations-and-spaces');
  const keys = [...page.matchAll(/href="[^"]*\/(vector-space|vector-apps|sdk)\/glossary#([^"]+)"/g)].map((m) => `${m[1]}#${m[2]}`);
  assert.ok(keys.length > 0, 'the sample page has glossary links');
  for (const key of keys) assert.ok(index[key], key);
});

test('the definitions ship in the client bundle and stay out of the search index', () => {
  const probe = Object.values(index)[0].definition;
  const dir = join(root, 'build', 'assets', 'js');
  const bundled = readdirSync(dir).some((f) => f.endsWith('.js') && readFileSync(join(dir, f), 'utf8').includes(probe));
  assert.ok(bundled, 'a bundle holds the definitions');
  for (const file of ['docs-gen/site/glossary-index.json', 'build/glossary-index.json']) assert.equal(existsSync(join(root, file)), false, file);
});
