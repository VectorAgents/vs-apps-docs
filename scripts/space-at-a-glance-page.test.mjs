import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/vector-space-at-a-glance.md');
const text = readFileSync(file, 'utf8');

const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

test('the page runs building blocks, what the picture leaves out, where code plugs in, roles, next steps', () => {
  assert.deepEqual(headings, ['The building blocks', 'What the picture leaves out', 'Where code plugs in', 'Roles', 'Where to go next']);
});

test('the page embeds the space diagram once, in the building blocks section, as Fig. 1', () => {
  assert.match(text, /^import IsoDiagram from '@site\/src\/components\/IsoDiagram';$/m);
  assert.match(text, /^import \{ spaceOverview \} from '@site\/src\/diagrams\/space-overview\.ts';$/m);
  assert.equal(section(text, 'The building blocks').match(/<IsoDiagram diagram=\{spaceOverview\} figure=\{1\} \/>/g)?.length, 1);
  assert.equal(text.match(/<IsoDiagram/g)?.length, 1);
});

test('the roles are members, Organization admin, space managers, staff and machines, in that order', () => {
  assert.deepEqual([...section(text, 'Roles').matchAll(/^- \*\*(.+?)\*\*/gm)].map((m) => m[1]), ['members', 'Organization admin', 'space managers', 'staff', 'machines']);
});

test('governance and Vector Modules sit in text, and the module list is linked and never copied', () => {
  const left = section(text, 'What the picture leaves out');
  assert.match(left, /^### Governance$/m);
  assert.match(left, /^### Vector Modules$/m);
  assert.ok(linksOf(left).includes('../sdk/reference/platform-limits.md#first-party-vector-modules'));
  assert.doesNotMatch(text, /\b(omnibox|contacts|calendar)\b/i);
});

test('the page names the three plug-in kinds and links no page for A2A, MCP, Governance, Security or FAQ', () => {
  const plugs = section(text, 'Where code plugs in');
  for (const term of ['Vector App', 'A2A agent', 'MCP connector']) assert.ok(plugs.includes(term), term);
  assert.deepEqual(linksOf(text).filter((l) => /security|faq|governance/i.test(l)), []);
});

test('every link resolves, and the page links Why Vector Apps, Choose your path and the Vector Space glossary', () => {
  const links = linksOf(text);
  for (const link of links) {
    const [path, anchor] = link.split('#');
    assert.ok(existsSync(resolve(dirname(file), path)), link);
    if (anchor && path.endsWith('.md')) {
      const body = readFileSync(resolve(dirname(file), path), 'utf8');
      const ids = body.split('\n').filter((l) => /^#{2,3} /.test(l)).map((l) => l.replace(/^#+ /, '').toLowerCase().replaceAll(' ', '-'));
      assert.ok(ids.includes(anchor), link);
    }
  }
  for (const target of ['../vector-apps/why-vector-apps.md', '../sdk/choose-your-path.md', './glossary.md']) assert.ok(links.includes(target), target);
});

test('the page names no placeholder example app and no master doc', () => {
  assert.doesNotMatch(text, /\b(Hiring|SDR|CSR)\b/);
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|APPS|GLOSSARY|README)\.md/);
});

test('the page writes Vector Space for the platform, space for the place, and never workspace', () => {
  assert.doesNotMatch(text, /workspace/i);
  assert.doesNotMatch(text, /(?<!Vector )\bSpace\b/);
});

test('the page follows the voice checks', () => assert.deepEqual(voiceViolations(text), []));
