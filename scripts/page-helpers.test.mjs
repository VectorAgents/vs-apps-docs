import assert from 'node:assert/strict';
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { after, test } from 'node:test';
import { generate } from './generate.mjs';
import { bannedTermsIn, bodyOf, brokenLinks, longSentences, rowsOf, treesOf, unlink } from './page-helpers.mjs';

const config = {
  docsRoot: 'docs',
  outDir: 'docs-gen',
  todoCap: 5,
  axes: { client: { react: 'React' }, server: { node: 'Node.js + TypeScript', nest: 'Nest.js' } },
  defaults: { client: 'react', server: 'node' },
};

const root = mkdtempSync(join(tmpdir(), 'helpers-'));
after(() => rmSync(root, { recursive: true, force: true }));
const pages = {
  'plain.md': 'PLAIN\n',
  'guides/call.md': '<!-- flavour node -->\nNODE\n<!-- /flavour -->\n<!-- flavour nest -->\nNEST\n<!-- /flavour -->\n',
  'quickstart.md':
    '<!-- flavour react -->\nREACT\n<!-- /flavour -->\n<!-- flavour node -->\nNODE\n<!-- /flavour -->\n<!-- flavour nest -->\nNEST\n<!-- /flavour -->\n',
};
for (const [path, body] of Object.entries(pages)) {
  mkdirSync(dirname(join(root, 'docs', path)), { recursive: true });
  writeFileSync(join(root, 'docs', path), body);
}
generate({ root, config });
const genDir = join(root, 'docs-gen');

test('treesOf returns one pair copy per tree of a flavoured page, labelled by its tree path', () => {
  const trees = treesOf('guides/call.md', { genDir });
  assert.deepEqual(trees.map(({ tree }) => tree), ['node', 'nest']);
  assert.match(trees[0].text, /NODE/);
  assert.match(trees[1].text, /NEST/);
});

test('treesOf names both axes for a both-axis page', () => {
  const trees = treesOf('quickstart.md', { genDir });
  assert.deepEqual(trees.map(({ tree }) => tree), ['react/node', 'react/nest']);
  assert.ok(trees.every(({ text }) => /REACT/.test(text)));
});

test('treesOf returns the single site copy of a neutral page', () => {
  const trees = treesOf('plain.md', { genDir });
  assert.deepEqual(trees, [{ tree: '', text: 'PLAIN\n' }]);
});

test('treesOf names the generator when the trees are missing', () => {
  assert.throws(() => treesOf('plain.md', { genDir: join(root, 'absent') }), /pnpm generate/);
});

test('bodyOf drops the front matter and unlink keeps the label of a link', () => {
  assert.equal(bodyOf('---\ntitle: T\n---\nText [a](./b.md) here\n'), 'Text [a](./b.md) here\n');
  assert.equal(unlink('Text [a](./b.md) and [c](d.md#e).'), 'Text a and c.');
});

test('rowsOf returns the cells of every table row, the header included, and skips the rule line', () => {
  assert.deepEqual(rowsOf('Intro\n\n| A | B |\n| --- | --- |\n| 1 | 2 |\n'), [['A', 'B'], ['1', '2']]);
});

test('brokenLinks lists a missing file and a missing glossary anchor, and passes a good link', () => {
  mkdirSync(join(root, 'pages'), { recursive: true });
  writeFileSync(join(root, 'pages', 'glossary.md'), '### Member\n\nText.\n### Vector App\n\nText.\n');
  writeFileSync(join(root, 'pages', 'other.md'), 'Other\n');
  const page = join(root, 'pages', 'page.md');
  const text = '[a](./other.md) [b](./glossary.md#member) [c](./glossary.md#vector-app) [d](./gone.md) [e](./glossary.md#nobody) [f](./other.md#any)';
  assert.deepEqual(brokenLinks(text, page), ['./gone.md', './glossary.md#nobody']);
});

test('longSentences reports a sentence over the limit, skips headings, and skips table rows only on request', () => {
  const long = Array.from({ length: 26 }, () => 'word').join(' ');
  assert.deepEqual(longSentences(`# ${long}\n\nShort one. ${long}.`), [`${long}.`]);
  assert.deepEqual(longSentences(`| ${long} |`), [`| ${long} |`]);
  assert.deepEqual(longSentences(`| ${long} |`, { tables: false }), []);
  assert.deepEqual(longSentences('A b c d.', { max: 3 }), ['A b c d.']);
});

test('bannedTermsIn finds a shared banned term, lets capability grant and Vector Space pass, and flags a bare Space or grant', () => {
  assert.deepEqual(bannedTermsIn('A capability grant lets the Vector Space app read.'), []);
  assert.deepEqual(bannedTermsIn('The operating system plane.'), ['/operating system/i', '/\\bplane\\b/i']);
  assert.deepEqual(bannedTermsIn('Each Space has a grant.'), ['/\\bgrants?\\b/i', '/(?<!Vector )\\bSpace\\b/']);
});
