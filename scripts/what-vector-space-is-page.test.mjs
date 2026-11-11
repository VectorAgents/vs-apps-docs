import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bannedTermsIn, bodyOf, brokenLinks, linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/what-vector-space-is.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text).replace(/^import .*$/gm, '').trim();
const prose = body.replace(/<(?:StructureFigure|FigurePlaceholder)[^>]*\/>/g, '').replace(/\]\([^)]*\)/g, ']').replace(/[#*`|]/g, '');
const lead = body.split(/^## /m)[0];
const figures = (s) => [...s.matchAll(/<(?:FigurePlaceholder|StructureFigure)\b[^>]*\/>/g)].map((m) => m[0]);
const noLinks = body.replace(/\]\([^)]*\)/g, ']');

test('the page runs lead, the request in a space, three detail H2s, Where to read next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), ['A request in a space', 'The three platform rules', 'The parts of a space', 'Ways to extend a space', 'Where to read next']);
});

test('the lead says what Vector Space is, then what a run does: access rules, own AI provider accounts, a record of who ran it', () => {
  assert.match(lead, /^\[Vector Space\]\(\.\/glossary\.md#vector-space\) is where /);
  for (const part of ['organization', 'own data', 'access rules', 'AI provider accounts', 'who ran']) assert.ok(lead.includes(part), part);
});

test('the lead lists the three levels: organization, space, pages and widgets', () => {
  const items = lead.split('\n').filter((l) => l.startsWith('- '));
  assert.deepEqual(items.map((l) => l.match(/^- \*\*(?:An organization|A \[space\]\([^)]*\)|Pages and widgets)\*\*/)?.[0] !== undefined), [true, true, true]);
  assert.ok(linksOf(lead).includes('./glossary.md#page') && linksOf(lead).includes('./glossary.md#widget'));
});

test('the page has at most one table', () => {
  assert.ok((text.match(/^\|\s*-/gm) ?? []).length <= 1);
});

test('the space-structure slot appears once, inside "The parts of a space"', () => {
  const slot = ['<StructureFigure data={spaceStructure} />', '<FigurePlaceholder slot="space-structure" />'];
  assert.equal(figures(text).length, 1);
  assert.ok(slot.includes(figures(text)[0]), figures(text)[0]);
  assert.deepEqual(figures(section(text, 'The parts of a space')), figures(text));
});

test('the first H2 after the lead is one request that shows access, the AI gateway and the record', () => {
  assert.equal(text.match(/^## (.+)$/m)[1], 'A request in a space');
  const example = section(text, 'A request in a space');
  for (const word of ['member', 'orchestrator agent', 'find leads', 'may see', 'AI gateway', 'provider key', 'record']) assert.ok(example.includes(word), word);
  assert.doesNotMatch(example, /email/i);
  assert.equal(example.split('\n').filter((l) => l.startsWith('- ')).length, 0);
});

test('the parts section gives one linked line per part: members, orchestrator agent, Command Center, Context Hub, Vector Modules', () => {
  const parts = section(text, 'The parts of a space');
  const items = parts.split('\n').filter((l) => l.startsWith('- '));
  assert.equal(items.length, 5);
  const owners = ['./who-can-do-what.md', './agents-in-a-space.md', './approvals-and-the-command-center.md', './what-a-space-holds.md', './what-a-space-holds.md'];
  items.forEach((item, i) => assert.ok(linksOf(item).includes(owners[i]), item));
});

test('the Command Center is a plain part of a space, not a Vector Module', () => {
  const item = section(text, 'The parts of a space').split('\n').find((l) => l.includes('Command Center'));
  assert.match(item, /plain part of a space, not a Vector Module/);
});

test('the Vector Modules item lists omnibox, contacts and Calendar as sub-items with no caveat', () => {
  const parts = section(text, 'The parts of a space');
  const subItems = parts.split('\n').filter((l) => l.startsWith('  - '));
  assert.deepEqual(subItems.map((l) => l.match(/^  - (Omnibox|Contacts|Calendar)/)?.[1]), ['Omnibox', 'Contacts', 'Calendar']);
  assert.doesNotMatch(text, /Calendar[^.\n]*(not yet|coming|planned|soon|beta|later|may )/i);
  assert.equal(text.match(/Calendar/g)?.length, 1);
});

test('the Context Hub line lists connectors, knowledge sources, datasources, skills and apps', () => {
  const item = section(text, 'The parts of a space').split('\n').find((l) => l.startsWith('- ') && l.includes('Context Hub'));
  for (const kind of ['connectors', 'knowledge sources', 'datasources', 'skills', 'apps']) assert.ok(item.includes(kind), kind);
});

test('the Governance slab is named as Governance only', () => {
  const parts = section(text, 'The parts of a space');
  assert.match(parts, /Governance/);
  assert.doesNotMatch(parts, /Intelligence/);
});

test('the extensions are a Vector App, an A2A agent and an MCP server, one line each, with a link to extending-a-space', () => {
  const outside = section(text, 'Ways to extend a space');
  const items = outside.split('\n').filter((l) => l.startsWith('- '));
  assert.equal(items.length, 3);
  assert.match(items[0], /^- \*\*\[Vector App\]\(\.\.\/vector-apps\/glossary\.md#app\)\*\*: a web app that a space shows in an iframe/);
  assert.match(items[1], /^- \*\*\[A2A\]\(\.\/glossary\.md#a2a\) agent\*\*: /);
  assert.match(items[2], /^- \*\*\[MCP\]\(\.\/glossary\.md#mcp\) server\*\*: /);
  assert.ok(linksOf(outside).includes('./extending-a-space.md'));
});

test('the page defines an extension as a Vector App, an A2A agent or an MCP server and never calls them kinds', () => {
  assert.match(prose, /An extension is a Vector App, an A2A agent or an MCP server\./);
  assert.doesNotMatch(prose, /kinds? of extension|one of three kinds|three kinds/i);
});

test('the platform rules are one access model, one AI gateway and one record of work, one line each, with links to the pages that own them', () => {
  const rules = section(text, 'The three platform rules');
  assert.deepEqual([...rules.matchAll(/^- \*\*(.+?)\*\*:/gm)].map((m) => m[1]), ['One access model', 'One AI gateway', 'One record of work']);
  for (const link of ['./one-access-model.md', './the-record-of-work.md']) assert.ok(linksOf(rules).includes(link), link);
  assert.ok(linksOf(body).includes('./glossary.md#ai-gateway'));
  assert.doesNotMatch(text, /^## (Organizations and spaces|What holds the platform together)/m);
});

test('the page names no other vendor or product', () => {
  assert.doesNotMatch(noLinks, /OpenAI|Anthropic|ChatGPT|Copilot|Gemini|Salesforce|HubSpot/);
});

test('every link resolves and every glossary anchor exists', () => {
  assert.deepEqual(brokenLinks(text, file), []);
});

test('Where to read next groups all ten other pages in three groups, then the glossary, with no "Where to go next"', () => {
  assert.doesNotMatch(text, /Where to go next|stands alone/);
  const next = section(text, 'Where to read next');
  assert.deepEqual(
    [...next.matchAll(/^\*\*(.+)\*\*$/gm)].map((m) => m[1]),
    ['Core concepts', 'Architecture and governance', 'Workflows and extensions'],
  );
  assert.deepEqual(linksOf(next), [
    './organizations-and-spaces.md',
    './what-a-space-holds.md',
    './agents-in-a-space.md',
    './who-can-do-what.md',
    './why-vector-space.md',
    './one-access-model.md',
    './the-record-of-work.md',
    './how-work-moves-through-a-space.md',
    './approvals-and-the-command-center.md',
    './extending-a-space.md',
    './glossary.md',
  ]);
});

test('each term is linked at its first use: Vector Space, organization, agents, member, orchestrator agent, space', () => {
  const clean = body;
  for (const [term, target] of [
    ['Vector Space', './glossary.md#vector-space'],
    ['organization', './glossary.md#organization'],
    ['agents', './glossary.md#agent'],
    ['member', './glossary.md#member'],
    ['orchestrator agent', './glossary.md#orchestrator-agent'],
    ['space', './glossary.md#space'],
  ]) {
    const first = new RegExp(`(?<![-#\\w])${term}\\b`).exec(clean);
    assert.ok(first, term);
    const link = `[${term}](${target})`;
    assert.equal(clean.slice(first.index - 1, first.index - 1 + link.length), link, `${term} first use is linked`);
  }
});

test('paragraphs are 5 sentences or fewer', () => {
  for (const paragraph of prose.split(/\n\n+/)) assert.ok(paragraph.split(/(?<=[.!?])\s+/).length <= 5 || paragraph.includes('\n- '), paragraph);
});

test('the page names no banned name or term', () => {
  const banned = [
    /\.md\b(?!\))/, /Polyglot|RBAC|ABAC/, /\bthe pool\b/i,
    /View level|Edit level|five roles|five kinds/i, /\bfloor\b|primary metric|exact ROI|continuously|stated human baseline/i,
    /\bHiring\b|\bSDR\b|\bCSR\b/, /\bsupport\b|\bsales\b(?! (?:team|\[?space))|\bhiring\b/i, /Apollo|\bExa\b|BrightData/,
    /Distributor|Customer|Agentic Workspace|federates|tenancy\./i,
  ];
  for (const pattern of banned) assert.doesNotMatch(noLinks, pattern);
  assert.deepEqual(bannedTermsIn(noLinks), []);
});

test('the page follows the voice checks', () => assert.deepEqual(voiceViolations(text), []));
