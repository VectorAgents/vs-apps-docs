import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bannedTermsIn, bodyOf, brokenLinks, linksOf, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/organizations-and-spaces.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text);
const prose = body.replace(/^import .*$/gm, '').replace(/<(?:FigurePlaceholder|StructureFigure)[^>]*\/>/g, '');
const plain = unlink(prose);
const slotsIn = (s) => [...s.matchAll(/<StructureFigure data=\{(\w+)\} \/>/g)].map((m) => m[1]);

test('the page runs lead, the scene, three detail sections, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [
    'Two teams in one organization',
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

test('the space section leads with no count and lists Members, Orchestrator agent, Context Hub and Pages', () => {
  const unit = section(text, 'The space as the unit of work');
  assert.match(unit, /^A space is where one team works\. It has these things of its own:$/m);
  assert.doesNotMatch(text, /four parts/);
  const bullets = unit.match(/^- .+$/gm);
  assert.equal(bullets.length, 4);
  assert.match(bullets[0], /^- \*\*Members\*\*: /);
  assert.match(bullets[1], /^- \*\*Orchestrator agent\*\*: /);
  assert.equal(bullets[2], '- **[Context Hub](./glossary.md#context-hub)**: the area where the space lists what it can reach, including its [Vector Apps](../vector-apps/glossary.md#app) and [Vector Modules](./glossary.md#vector-module).');
  assert.equal(bullets[3], '- **Pages**: the [pages](./glossary.md#page) of the space.');
});

test('the scene is the first H2, names no Example and says a team\'s space', () => {
  assert.equal(text.match(/^## (.+)$/m)[1], 'Two teams in one organization');
  assert.doesNotMatch(text, /^#+ .*Example/m);
  assert.doesNotMatch(plain, /the sales space/i);
  const scene = section(text, 'Two teams in one organization');
  assert.match(scene, /\nAcme has one organization/);
  assert.match(scene, /sales team's space/);
  assert.match(scene, /Acme's marketing team has another space/);
  assert.doesNotMatch(plain, /second (team|space)|another space of/i);
});

test('the slot organization-structure appears once, in "The organization as the tenant"', () => {
  assert.deepEqual(slotsIn(text), ['organizationStructure']);
  assert.deepEqual(slotsIn(section(text, 'The organization as the tenant')), ['organizationStructure']);
});

test('every link resolves, every glossary anchor exists, and Where to go next links its three pages and the glossary', () => {
  assert.deepEqual(brokenLinks(text, file), []);
  assert.deepEqual(linksOf(section(text, 'Where to go next')), ['./what-a-space-holds.md', './who-can-do-what.md', './one-access-model.md', './glossary.md']);
});

test('the page says each resource belongs to one space and never that spaces share nothing', () => {
  assert.match(text, /each resource belongs to one space/i);
  assert.doesNotMatch(text, /share nothing|nothing is shared|shares nothing/i);
});

test('the page says AI provider accounts belong to the organization and reach every space by default', () => {
  assert.ok(linksOf(prose).includes('./glossary.md#ai-provider-account'));
  assert.match(plain, /AI provider accounts belong to the organization/);
  assert.match(plain, /every space by default/);
});

test('the page leaves out distributors, customers, licences and space deletion', () => {
  assert.doesNotMatch(prose, /distributor|customer|licen[cs]e|delet|deprovision/i);
});

test('the page names no master doc, implementation name, banned term, vendor or use case', () => {
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|RESOURCES|SPACES|README)\.md/);
  assert.deepEqual(bannedTermsIn(prose), []);
  assert.doesNotMatch(prose, /\b(Apollo|Exa|BrightData|Hiring|SDR|CSR)\b/);
  assert.doesNotMatch(prose, /\b(support|hiring)\b/i);
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(prose, /TypeScript|Node|React/));

test('the page follows the voice checks and has no em dash', () => {
  assert.deepEqual(voiceViolations(text), []);
  assert.doesNotMatch(prose, /—/);
});
