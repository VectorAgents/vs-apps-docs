import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/organizations-and-spaces.md');
const text = readFileSync(file, 'utf8');
const body = text.replace(/^---\n[\s\S]*?\n---\n/, '');
const prose = body.replace(/^import .*$/gm, '').replace(/<(?:FigurePlaceholder|StructureFigure)[^>]*\/>/g, '');
const plain = prose.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
const slotsIn = (s) => [...s.matchAll(/<StructureFigure data=\{(\w+)\} \/>/g)].map((m) => m[1]);

test('the page runs lead, Example, three detail sections, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [
    'Example',
    'The organization as the tenant',
    'The space as the unit of work',
    'Resources that belong to one space',
    'Where to go next',
  ]);
});

test('the lead defines organization and space before the first H2', () => {
  const lead = body.split(/^## /m)[0];
  assert.match(lead, /\[organization\]\(\.\/glossary\.md#organization\)/);
  assert.match(lead, /\[space\]\(\.\/glossary\.md#space\)/);
});

test('the page is 500 to 800 words with no table', () => {
  const words = plain.split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 500 && words <= 800, `${words} words`);
  assert.equal((text.match(/^\| ?-{3}/gm) ?? []).length, 0, 'tables');
});

test('the slot organization-structure appears once, in "The organization as the tenant"', () => {
  assert.deepEqual(slotsIn(text), ['organizationStructure']);
  assert.deepEqual(slotsIn(section(text, 'The organization as the tenant')), ['organizationStructure']);
});

test('every link resolves, every glossary anchor exists, and Where to go next links its three pages and the glossary', () => {
  for (const link of linksOf(text)) {
    const [path, anchor] = link.split('#');
    assert.ok(existsSync(resolve(dirname(file), path)), link);
    if (anchor && path.endsWith('glossary.md')) {
      const terms = readFileSync(resolve(dirname(file), path), 'utf8').split('\n').filter((l) => l.startsWith('### '));
      assert.ok(terms.some((l) => l.slice(4).toLowerCase().replaceAll(' ', '-') === anchor), link);
    }
  }
  assert.deepEqual(linksOf(section(text, 'Where to go next')), ['./what-a-space-holds.md', './who-can-do-what.md', './one-access-model.md', './glossary.md']);
});

test('the page says each resource belongs to one space and never that spaces share nothing', () => {
  assert.match(text, /Each resource belongs to one space/);
  assert.doesNotMatch(text, /share nothing|nothing is shared|shares nothing/i);
});

test('the page says AI provider accounts belong to the organization and reach every space by default', () => {
  assert.match(plain, /AI provider accounts belong to the organization/);
  assert.match(plain, /every space by default/);
});

test('the page leaves out distributors, customers, licences and space deletion', () => {
  assert.doesNotMatch(prose, /distributor|customer|licen[cs]e|delet|deprovision/i);
});

test('the page names no master doc, implementation name, banned term, vendor or use case', () => {
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|RESOURCES|SPACES|README)\.md/);
  assert.doesNotMatch(prose, /AuthZEN|Yjs|operating system|resource pool|actor stamp|\bplane\b|black-box|\bgrant\b/i);
  assert.doesNotMatch(prose, /\b(Apollo|Exa|BrightData|Hiring|SDR|CSR)\b/);
  assert.doesNotMatch(prose, /\b(support|hiring)\b/i);
  assert.doesNotMatch(prose, /(?<!Vector )\bSpace\b/);
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(prose, /TypeScript|Node|React/));

test('the page follows the voice checks and no sentence passes 25 words', () => {
  assert.deepEqual(voiceViolations(text), []);
  for (const sentence of plain.replace(/^#.*$/gm, '').split(/(?<=[.!?])\s+/)) assert.ok(sentence.trim().split(/\s+/).length <= 25, sentence);
});
