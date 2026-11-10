import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bannedTermsIn, bodyOf, brokenLinks, linksOf, longSentences, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/who-can-do-what.md');
const glossaryFile = resolve(docs, 'vector-space/glossary.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text);
const plain = unlink(body);
const rows = (s) => s.split('\n').filter((l) => /^\|/.test(l) && !/^\| ?-{3}/.test(l)).slice(1).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));

test('the page runs lead, Example, two detail sections, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [
    'Example',
    'Five kinds of people and callers',
    'What Can use and Can edit mean',
    'Where to go next',
  ]);
});

test('the lead names the five kinds, each with a glossary link', () => {
  const lead = body.split(/^## /m)[0];
  for (const term of ['organization-admin', 'space-manager', 'member', 'staff', 'service-account']) {
    assert.match(lead, new RegExp(`\\]\\(\\./glossary\\.md#${term}\\)`), term);
  }
});

test('the page is 500 to 800 words with one table of the five kinds in order', () => {
  const words = plain.split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 500 && words <= 800, `${words} words`);
  assert.equal((text.match(/^\| ?-{3}/gm) ?? []).length, 1, 'tables');
  const table = rows(section(text, 'Five kinds of people and callers'));
  assert.deepEqual(table.map((r) => unlink(r[0])), ['Organization admin', 'space manager', 'member', 'staff', 'service account']);
  for (const cell of table.flat()) assert.ok(unlink(cell).split(/\s+/).length <= 15, cell);
});

test('the page has no figure slot', () => {
  assert.doesNotMatch(text, /FigurePlaceholder|StructureFigure|FlowFigure/);
});

test('every link resolves, every glossary anchor exists, and Where to go next links its two pages and the glossary', () => {
  assert.deepEqual(brokenLinks(text, file), []);
  assert.deepEqual(linksOf(section(text, 'Where to go next')), ['./one-access-model.md', './organizations-and-spaces.md', './glossary.md']);
});

test('the page says one Organization admin, and the glossary row agrees', () => {
  assert.match(plain, /one Organization admin/);
  assert.doesNotMatch(text, /every Organization admin|Organization admins/i);
  const row = readFileSync(glossaryFile, 'utf8').split(/^### /m).find((s) => s.startsWith('Organization admin'));
  assert.ok(row, 'glossary row');
  assert.doesNotMatch(row, /every Organization admin|Organization admins/i);
  assert.match(row, /\bone\b/i);
});

test('the page says a Restricted resource is closed to the Organization admin unless a share names them, and points to one-access-model', () => {
  const sentence = body.split(/(?<=[.!?])\s+/).find((s) => /Restricted/.test(s));
  assert.ok(sentence, 'a sentence on Restricted');
  assert.match(unlink(sentence), /Organization admin/);
  assert.match(unlink(sentence), /share/);
  assert.match(sentence, /\(\.\/one-access-model\.md\)/);
});

test('staff get two sentences and no claim of global reach', () => {
  const staff = rows(section(text, 'Five kinds of people and callers')).find((r) => /staff/.test(r[0]));
  const sentences = unlink(staff.slice(1).join(' ')).split(/(?<=[.!?])\s+/).filter(Boolean);
  assert.equal(sentences.length, 2, staff.join(' | '));
  assert.doesNotMatch(staff.join(' '), /global/i);
});

test('Can use and Can edit are the two roles of a share, and a role is not a set of people', () => {
  const part = section(text, 'What Can use and Can edit mean');
  for (const anchor of ['share', 'can-use', 'can-edit', 'group']) assert.match(part, new RegExp(`\\]\\(\\./glossary\\.md#${anchor}\\)`), anchor);
  assert.match(part, /not a set of people/);
  assert.match(part, /\]\(\.\/one-access-model\.md\)/);
});

test('the page has no View level, Edit level or custom roles', () => {
  assert.doesNotMatch(text, /View level|Edit level|custom role|role as a set/i);
});

test('the page names no master doc, implementation name, banned term, vendor or use case', () => {
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|RESOURCES|SPACES|README)\.md/);
  assert.deepEqual(bannedTermsIn(plain), []);
  assert.doesNotMatch(plain, /OrganizationRole|five roles/i);
  assert.doesNotMatch(plain, /\b(Apollo|Exa|BrightData|Hiring|SDR|CSR)\b/);
  assert.doesNotMatch(plain, /\b(support|hiring)\b/i);
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(plain, /TypeScript|Node|React/));

test('the page follows the voice checks and no sentence passes 25 words', () => {
  assert.deepEqual(voiceViolations(text), []);
  assert.deepEqual(longSentences(plain, { tables: false }), []);
});
