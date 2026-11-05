import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-apps/how-a-vector-app-works.md');
const text = readFileSync(file, 'utf8');
const glossary = readFileSync(resolve(docs, 'vector-apps/glossary.md'), 'utf8');

const headings = (level) => [...text.matchAll(new RegExp(`^${'#'.repeat(level)} (.+)$`, 'gm'))].map((m) => m[1]);
const tableRows = (body) =>
  body
    .split('\n')
    .filter((l) => l.startsWith('|'))
    .slice(2)
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
const plain = (cell) => cell.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

test('the page runs parts, lifecycle, token kinds, next steps', () => {
  assert.deepEqual(headings(2), ['The parts of an app', 'The lifecycle', 'The six token kinds', 'Where to go next']);
});

test('the page embeds the apps diagram once, in the parts section, as Fig. 1', () => {
  assert.match(text, /^import IsoDiagram from '@site\/src\/components\/IsoDiagram';$/m);
  assert.match(text, /^import \{ appsOverview \} from '@site\/src\/diagrams\/apps-overview\.ts';$/m);
  assert.equal(section(text, 'The parts of an app').match(/<IsoDiagram diagram=\{appsOverview\} figure=\{1\} \/>/g)?.length, 1);
  assert.equal(text.match(/<IsoDiagram/g)?.length, 1);
});

test('the lifecycle runs build, register, activate, configure, update, deprovision, in a table and in sections', () => {
  const steps = ['Build', 'Register', 'Activate', 'Configure', 'Update', 'Deprovision'];
  const rows = tableRows(section(text, 'The lifecycle'));
  assert.deepEqual(rows.map(([step]) => step), steps);
  for (const [, who] of rows) assert.ok(who.length > 0);
  assert.deepEqual(headings(3), steps);
});

test('the six token kinds are named in the table', () => {
  assert.deepEqual(
    tableRows(section(text, 'The six token kinds')).map(([kind]) => plain(kind)),
    ['User token', 'Provisioning token', 'A2A token', 'MCP token', 'App token', 'Events token'],
  );
});

test('table cells hold 15 words or fewer', () => {
  for (const row of [...tableRows(section(text, 'The lifecycle')), ...tableRows(section(text, 'The six token kinds'))]) {
    for (const cell of row) assert.ok(plain(cell).split(/\s+/).length <= 15, cell);
  }
});

test('every link resolves, and the page links the quickstart, the app definition and the Vector Apps glossary', () => {
  const links = linksOf(text);
  for (const link of links) {
    const [path, anchor] = link.split('#');
    assert.ok(existsSync(resolve(dirname(file), path)), link);
    if (anchor && path.endsWith('glossary.md')) assert.ok(glossary.split('\n').some((l) => l.startsWith('### ') && l.slice(4).toLowerCase().replaceAll(' ', '-') === anchor), link);
  }
  for (const target of ['./quickstart.md', '../sdk/app-definition.md', './glossary.md']) assert.ok(links.includes(target), target);
});

test('the page follows the voice checks', () => assert.deepEqual(voiceViolations(text), []));

test('the page names no placeholder example app and no master doc', () => {
  assert.doesNotMatch(text, /\b(Hiring|SDR|CSR)\b/);
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|APPS|GLOSSARY)\.md/);
});
