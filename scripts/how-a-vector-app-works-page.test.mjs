import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const docs = resolve(root, 'docs');
const file = resolve(docs, 'vector-apps/how-a-vector-app-works.md');
const text = readFileSync(file, 'utf8');

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

test('the page embeds the apps figure once, in the parts section, as Fig. 1', () => {
  assert.match(text, /^import StructureFigure from '@site\/src\/components\/StructureFigure';$/m);
  assert.match(text, /^import \{ appsOverview \} from '@site\/src\/diagrams\/figures\/apps-overview\.ts';$/m);
  assert.equal(section(text, 'The parts of an app').match(/<StructureFigure data=\{appsOverview\} figure=\{1\} \/>/g)?.length, 1);
  assert.equal(text.match(/<StructureFigure/g)?.length, 1);
});

test('the text names no numbered diagram line, and the token table says which token each call carries', () => {
  assert.doesNotMatch(text, /\bline[s]? [a-d]\b|four lines|token path/i);
  assert.match(section(text, 'The parts of an app'), /dashed/i);
});

test('no isometric diagram component, layout, data or test exists, and nothing imports one', () => {
  for (const old of ['src/components/IsoDiagram.tsx', 'src/diagrams/isoLayout.ts', 'src/diagrams/apps-overview.ts', 'scripts/iso-diagram.test.mjs', 'scripts/build-check/iso-diagram.test.mjs']) {
    assert.ok(!existsSync(resolve(root, old)), old);
  }
  const sources = readdirSync(resolve(root, 'src'), { recursive: true }).filter((f) => /\.(tsx?|mdx?|css)$/.test(f));
  for (const file of [...sources.map((f) => `src/${f}`), ...readdirSync(resolve(root, 'docs'), { recursive: true }).filter((f) => /\.mdx?$/.test(f)).map((f) => `docs/${f}`)]) {
    assert.doesNotMatch(readFileSync(resolve(root, file), 'utf8'), /IsoDiagram|isoLayout|diagrams\/apps-overview|\.iso-diagram|\.iso-badge/m, file);
  }
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

test('every link resolves, and the page links the quickstart, the SDK overview, the app definition and the Vector Apps glossary', () => {
  const links = linksOf(text);
  for (const link of links) {
    const [path, anchor] = link.split('#');
    assert.ok(existsSync(resolve(dirname(file), path)), link);
    if (anchor && path.endsWith('glossary.md')) {
      const terms = readFileSync(resolve(dirname(file), path), 'utf8').split('\n').filter((l) => l.startsWith('### '));
      assert.ok(terms.some((l) => l.slice(4).toLowerCase().replaceAll(' ', '-') === anchor), link);
    }
  }
  for (const target of ['./quickstart.md', '../sdk/overview.md', '../sdk/app-definition.md', './glossary.md']) assert.ok(links.includes(target), target);
});

test('a space admin owns the activate, configure and deprovision steps, linked to the glossary', () => {
  const lifecycle = section(text, 'The lifecycle');
  assert.match(lifecycle, /A \[space admin\]\(\.\.\/vector-space\/glossary\.md#space-admin\) owns three steps\./);
  const rows = tableRows(lifecycle).filter(([step]) => ['Activate', 'Configure', 'Deprovision'].includes(step));
  assert.equal(rows.length, 3);
  for (const [, owner, what] of rows) {
    assert.equal(owner, 'A space admin');
    assert.match(what, /^The space admin /);
  }
  assert.match(text, /The space admin also sets each \[model slot\]\(\.\/glossary\.md#model-slot\) and \[connector slot\]\(\.\/glossary\.md#connector-slot\) and attaches the resources the app may read\./);
});

test('the page follows the voice checks', () => assert.deepEqual(voiceViolations(text), []));

test('the page names no placeholder example app and no master doc', () => {
  assert.doesNotMatch(text, /\b(Hiring|SDR|CSR)\b/);
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|APPS|GLOSSARY)\.md/);
});
