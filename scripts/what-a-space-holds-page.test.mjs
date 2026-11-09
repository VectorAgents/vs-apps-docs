import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/what-a-space-holds.md');
const text = readFileSync(file, 'utf8');
const body = text.replace(/^---\n[\s\S]*?\n---\n/, '');
const plain = body.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

test('the page runs lead, Example, three detail sections, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [
    'Example',
    'The Context Hub',
    'Pages and widgets in a space',
    'Vector Apps and Vector Modules',
    'Where to go next',
  ]);
});

test('the lead defines the Context Hub with a glossary link before the first H2', () => {
  assert.match(body.split(/^## /m)[0], /\[Context Hub\]\(\.\/glossary\.md#context-hub\)/);
});

test('the page is 500 to 800 words with no table', () => {
  const words = plain.split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 500 && words <= 800, `${words} words`);
  assert.equal((text.match(/^\| ?-{3}/gm) ?? []).length, 0, 'tables');
});

test('the page has no figure slot and no figure component', () => {
  assert.doesNotMatch(text, /<(FigurePlaceholder|StructureFigure|FlowFigure)\b/);
});

test('the Context Hub section lists the six kinds of resource and says pages are not one of them', () => {
  const hub = section(text, 'The Context Hub');
  for (const anchor of ['connector', 'knowledge-source', 'datasource', 'skill', 'vector-module']) {
    assert.match(hub, new RegExp(`\\]\\(\\./glossary\\.md#${anchor}\\)`), anchor);
  }
  assert.match(hub, /Vector Apps/);
  assert.match(hub, /six kinds of resource/);
  assert.doesNotMatch(hub, /space page/i);
});

test('space pages and widgets sit apart from the Context Hub and say pages are not one of its kinds', () => {
  const pages = section(text, 'Pages and widgets in a space');
  assert.match(pages, /\]\(\.\/glossary\.md#space-page\)/);
  assert.match(pages, /\]\(\.\/glossary\.md#widget\)/);
  assert.match(pages, /not one of the six kinds/);
});

test('Vector Apps and Vector Modules share one section: an app is a web app that a space shows in an iframe, and the modules are omnibox, contacts and Calendar', () => {
  const apps = section(text, 'Vector Apps and Vector Modules');
  assert.match(apps, /a web app that a space shows in an iframe/);
  assert.match(apps, /\]\(\.\.\/vector-apps\/glossary\.md#app\)/);
  for (const module of ['omnibox', 'contacts', 'Calendar']) assert.match(apps, new RegExp(module));
  assert.doesNotMatch(apps, /Command Center/);
});

test('the page leaves out Command Center, the access starting state and implementation details', () => {
  assert.doesNotMatch(plain, /Command Center/);
  assert.doesNotMatch(plain, /restricted by default|starts closed|Restricted/i);
  assert.doesNotMatch(plain, /Yjs|Plate|text-to-SQL|SELECT|WidgetConfig|ModuleKey|provider/);
});

test('every link resolves, every glossary anchor exists, and Where to go next links its two pages and the glossary', () => {
  for (const link of linksOf(text)) {
    const [path, anchor] = link.split('#');
    const target = resolve(dirname(file), path);
    assert.ok(existsSync(target), link);
    if (anchor && path.endsWith('glossary.md')) {
      const terms = readFileSync(target, 'utf8').split('\n').filter((l) => l.startsWith('### '));
      assert.ok(terms.some((l) => l.slice(4).toLowerCase().replaceAll(' ', '-') === anchor), link);
    }
  }
  assert.deepEqual(linksOf(section(text, 'Where to go next')), ['./agents-in-a-space.md', './extending-a-space.md', './glossary.md']);
});

test('the page names no master doc, implementation name, banned term, vendor or use case', () => {
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|RESOURCES|SPACES|PAGES|MODULES|CATALOG|README)\.md/);
  assert.doesNotMatch(plain, /AuthZEN|operating system|resource pool|actor stamp|\bplane\b|black-box|\bgrant\b/i);
  assert.doesNotMatch(plain, /\b(Apollo|Exa|BrightData|Gmail|Google|LinkedIn|Hiring|SDR|CSR)\b/);
  assert.doesNotMatch(plain, /\b(support|hiring)\b/i);
  assert.doesNotMatch(plain.replace(/^#.*$/gm, ''), /(?<!Vector )\bSpace\b/);
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(plain, /TypeScript|Node|React/));

test('the page follows the voice checks and no sentence passes 25 words', () => {
  assert.deepEqual(voiceViolations(text), []);
  for (const sentence of plain.replace(/^#.*$/gm, '').split(/(?<=[.!?])\s+|\n/)) assert.ok(sentence.trim().split(/\s+/).length <= 25, sentence);
});
