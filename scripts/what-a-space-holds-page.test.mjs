import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { assertConceptEnding, assertCoreRules, assertGlossaryLinks } from './core-concept-checks.mjs';
import { assertPersonaScene, bannedTermsIn, bodyOf, brokenLinks, linksOf, section, unlink } from './page-helpers.mjs';
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
    '- **[Pages](./glossary.md#page)**: grids of [widgets](./glossary.md#widget) that show data.',
  ]);
  assert.match(lead, /\nPeople and \[agents\]\(\.\/glossary\.md#agent\) use them to read data, show it and act on it\.\n/);
  assert.doesNotMatch(text, /four parts|these parts/);
});

test('the scene is the first H2, names no Example and says a team\'s space', () => {
  assert.equal(text.match(/^## (.+)$/m)[1], 'A lead search in a team\'s space');
  assert.doesNotMatch(text, /^#+ .*Example/m);
  assert.doesNotMatch(plain, /the sales space/i);
  const scene = section(text, 'A lead search in a team\'s space');
  assert.match(scene, /\nMaya, /);
  assert.match(scene, /messaging channels and a customer-contact system/);
});

test('the scene names Maya in place of "a member"', () => {
  const scene = section(text, 'A lead search in a team\'s space');
  assert.match(scene, /Maya, a \[member\]\(\.\/glossary\.md#member\) of Acme's sales team, asks the \[orchestrator agent\]\(\.\/glossary\.md#orchestrator-agent\) in the team's space to find leads and send an outreach email\./);
  assert.doesNotMatch(scene, /Acme's sales team has a space|a member of it|this member|that member/);
  assert.ok(scene.split(/(?<=\.) /).length <= 5);
});

test('Maya is introduced once, the first "member" on the page is the glossary link on her introduction, and no persona name appears outside the scene', () => {
  assert.equal(body.match(/Maya, a /g)?.length, 1);
  assertPersonaScene(text, 'A lead search in a team\'s space', { memberIntro: "[member](./glossary.md#member) of Acme's sales team" });
});

test('the page has no figure slot and no figure component', () => {
  assert.doesNotMatch(text, /<(FigurePlaceholder|StructureFigure|FlowFigure)\b/);
});

test('the Context Hub section names the six kinds of resource in one sentence and defines three of them, without handing the kinds to another page', () => {
  const hub = section(text, 'The Context Hub');
  for (const [kind, link] of [['contexts', './glossary.md#context'], ['knowledge sources', './glossary.md#knowledge-source'], ['datasources', './glossary.md#datasource']]) {
    assert.ok(hub.includes(`[${kind}](${link})`), kind);
  }
  for (const link of ['./glossary.md#skill', '../vector-apps/glossary.md#app', './glossary.md#vector-module']) assert.ok(linksOf(body).includes(link), link);
  assert.match(hub, /six kinds of resource: \[contexts\].*, skills, Vector Apps and Vector Modules\./);
  assert.match(hub, /A context links the space to one outside account or endpoint\. A datasource is a database that agents and widgets query, and a \[skill\]\(\.\/glossary\.md#skill\) is a set of named instructions with their tools\./);
  assert.doesNotMatch(hub, /context-hub\.md|describes each kind|connector/i);
});

test('pages and widgets get their own section, with page and widget linked once in the lead', () => {
  const pages = section(text, 'Pages and widgets');
  assert.match(pages, /^Pages and widgets\n\nA page is a grid of widgets, with filters that apply to the whole page, and any member can create one\./);
  assert.match(pages, /A widget is one cell of the grid, and it is one of two things:/);
  for (const link of ['./glossary.md#page', './glossary.md#widget']) assert.ok(linksOf(body.split(/^## /m)[0]).includes(link), link);
});

test('Vector Apps and Vector Modules share one section: an app is a web app that a space shows in an iframe, and the modules are omnibox, contacts and Calendar', () => {
  const apps = section(text, 'Vector Apps and Vector Modules');
  assert.match(apps, /a web app that a space shows in an iframe/);
  for (const module of ['Omnibox', 'Contacts', 'Calendar']) assert.match(apps, new RegExp(module));
  assert.match(apps, /\*\*Omnibox\*\*: shows conversations from a connected mailbox and lets a member read and reply\.\n/);
  assert.doesNotMatch(apps, /context-hub\.md/);
  assert.doesNotMatch(apps, /Command Center/);
  assert.match(apps, /\[organization\]\(\.\/glossary\.md#organization\)'s license lists it/);
  assert.doesNotMatch(apps, /is different|alike|differ|not an app/);
});

test('the page leaves out Command Center, the access starting state and implementation details', () => {
  assert.doesNotMatch(plain, /Command Center/);
  assert.doesNotMatch(plain, /restricted by default|starts closed|Restricted/i);
  assert.doesNotMatch(plain, /Yjs|Plate|text-to-SQL|SELECT|WidgetConfig|ModuleKey|provider/);
});

test('every link resolves and every glossary anchor exists', () => assert.deepEqual(brokenLinks(text, file), []));

test('Where to go next gives a result sentence, one primary step, 2 related links and the glossary, and not the Context Hub page', () => {
  assertConceptEnding(text, { next: './agents-in-a-space.md', related: ['./extending-a-space.md', './one-access-model.md'] });
  assert.doesNotMatch(section(text, 'Where to go next'), /context-hub\.md/);
});

test('the shared rules hold: description, link text, directional words, dashes, contractions, parts lists, glossary links once', () => {
  assertCoreRules(text);
  assertGlossaryLinks(text);
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
