import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bannedTermsIn, bodyOf, brokenLinks, linksOf, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/what-a-space-holds.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text);
const plain = unlink(body);

test('the page runs lead, the scene, three detail sections, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [
    'A lead search in a team\'s space',
    'The Context Hub',
    'Pages and widgets',
    'Vector Apps and Vector Modules',
    'Where to go next',
  ]);
});

test('the lead defines the Context Hub with a glossary link before the first H2', () => {
  assert.match(body.split(/^## /m)[0], /\[Context Hub\]\(\.\/glossary\.md#context-hub\)/);
});

test('the description and lead say what the team works with, in two bullets, with no count', () => {
  assert.match(text, /^description: The Context Hub with its Vector Apps and Vector Modules, and pages with widgets\.$/m);
  const lead = body.split(/^## /m)[0];
  assert.match(lead, /^A \[space\]\(\.\/glossary\.md#space\) holds what its team works with:$/m);
  assert.deepEqual(lead.match(/^- .+$/gm), [
    '- **[Context Hub](./glossary.md#context-hub)**: the area where the space lists what it can reach, including its [Vector Apps](../vector-apps/glossary.md#app) and [Vector Modules](./glossary.md#vector-module).',
    '- **[Pages](./glossary.md#page)**: grids of widgets that show data.',
  ]);
  assert.match(lead, /\nMembers and agents use them to read data, show it and act on it\.\n/);
  assert.doesNotMatch(text, /four parts|these parts/);
});

test('the scene is the first H2, names no Example and says a team\'s space', () => {
  assert.equal(text.match(/^## (.+)$/m)[1], 'A lead search in a team\'s space');
  assert.doesNotMatch(text, /^#+ .*Example/m);
  assert.doesNotMatch(plain, /the sales space/i);
  const scene = section(text, 'A lead search in a team\'s space');
  assert.match(scene, /\nAcme's sales team has a space/);
  assert.match(scene, /messaging channels and a customer-contact system/);
});

test('the page has no figure slot and no figure component', () => {
  assert.doesNotMatch(text, /<(FigurePlaceholder|StructureFigure|FlowFigure)\b/);
});

test('the Context Hub section names the six kinds of resource and links the Context Hub page', () => {
  const hub = section(text, 'The Context Hub');
  for (const [kind, link] of [
    ['contexts', './glossary.md#context'], ['knowledge sources', './glossary.md#knowledge-source'], ['datasources', './glossary.md#datasource'],
    ['skills', './glossary.md#skill'], ['Vector Apps', '../vector-apps/glossary.md#app'], ['Vector Modules', './glossary.md#vector-module'],
  ]) assert.ok(hub.includes(`[${kind}](${link})`), kind);
  assert.match(hub, /six kinds of resource/);
  assert.match(hub, /\]\(\.\/context-hub\.md\)/);
  assert.doesNotMatch(hub, /connector/i);
});

test('pages and widgets get their own section', () => {
  const pages = section(text, 'Pages and widgets');
  assert.match(pages, /\]\(\.\/glossary\.md#page\)/);
  assert.match(pages, /\]\(\.\/glossary\.md#widget\)/);
});

test('Vector Apps and Vector Modules share one section: an app is a web app that a space shows in an iframe, and the modules are omnibox, contacts and Calendar', () => {
  const apps = section(text, 'Vector Apps and Vector Modules');
  assert.match(apps, /a web app that a space shows in an iframe/);
  assert.match(apps, /\]\(\.\.\/vector-apps\/glossary\.md#app\)/);
  for (const module of ['Omnibox', 'Contacts', 'Calendar']) assert.match(apps, new RegExp(module));
  assert.match(apps, /\]\(\.\/context-hub\.md#mailboxes-and-the-omnibox\)/);
  assert.doesNotMatch(apps, /Command Center/);
  assert.match(apps, /organization's license lists it/);
  assert.doesNotMatch(apps, /is different|alike|differ|not an app/);
});

test('the page leaves out Command Center, the access starting state and implementation details', () => {
  assert.doesNotMatch(plain, /Command Center/);
  assert.doesNotMatch(plain, /restricted by default|starts closed|Restricted/i);
  assert.doesNotMatch(plain, /Yjs|Plate|text-to-SQL|SELECT|WidgetConfig|ModuleKey|provider/);
});

test('every link resolves, every glossary anchor exists, and Where to go next links its two pages and the glossary', () => {
  assert.deepEqual(brokenLinks(text, file), []);
  assert.deepEqual(linksOf(section(text, 'Where to go next')), ['./agents-in-a-space.md', './extending-a-space.md', './glossary.md']);
});

test('the page names no master doc, implementation name, banned term, vendor or use case', () => {
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|RESOURCES|SPACES|PAGES|MODULES|CATALOG|README)\.md/);
  assert.deepEqual(bannedTermsIn(plain), []);
  assert.doesNotMatch(plain, /\b(Apollo|Exa|BrightData|Gmail|Google|LinkedIn|Hiring|SDR|CSR)\b/);
  assert.doesNotMatch(plain, /\b(support|hiring)\b/i);
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(plain, /TypeScript|Node|React/));

test('the page follows the voice checks and has no em dash', () => {
  assert.deepEqual(voiceViolations(text), []);
  assert.doesNotMatch(plain, /—/);
});
