import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/what-vector-space-is.md');
const text = readFileSync(file, 'utf8');
const body = text.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/^import .*$/gm, '').trim();
const prose = body.replace(/<(?:StructureFigure|FigurePlaceholder)[^>]*\/>/g, '').replace(/\]\([^)]*\)/g, ']').replace(/[#*`|]/g, '');
const lead = body.split(/^## /m)[0];
const figures = (s) => [...s.matchAll(/<(?:FigurePlaceholder|StructureFigure)\b[^>]*\/>/g)].map((m) => m[0]);
const noLinks = body.replace(/\]\([^)]*\)/g, ']');

test('the page runs lead, Example, two detail H2s, Where to read next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), ['Example', 'The parts of a space', 'Where outside code plugs in', 'Where to read next']);
});

test('the lead says what Vector Space is, then what a run does: access rules, own AI provider accounts, a record of who ran it', () => {
  assert.match(lead, /^\[Vector Space\]\(\.\/glossary\.md#vector-space\) is where /);
  for (const part of ['organization', 'own data', 'access rules', 'AI provider accounts', 'who ran']) assert.ok(lead.includes(part), part);
});

test('the page is 500 to 800 words with at most one table', () => {
  const words = prose.split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 500 && words <= 800, `${words} words`);
  assert.ok((text.match(/^\|\s*-/gm) ?? []).length <= 1);
});

test('the space-structure slot appears once, inside "The parts of a space"', () => {
  const slot = ['<StructureFigure data={spaceStructure} />', '<FigurePlaceholder slot="space-structure" />'];
  assert.equal(figures(text).length, 1);
  assert.ok(slot.includes(figures(text)[0]), figures(text)[0]);
  assert.deepEqual(figures(section(text, 'The parts of a space')), figures(text));
});

test('the example is a member who asks the orchestrator agent to find leads in the organization’s own data and access', () => {
  const example = section(text, 'Example');
  for (const word of ['member', 'orchestrator agent', 'find leads', 'access']) assert.ok(example.includes(word), word);
  assert.doesNotMatch(example, /email/i);
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

test('the Vector Modules line lists omnibox, contacts and Calendar with no caveat', () => {
  const item = section(text, 'The parts of a space').split('\n').find((l) => l.startsWith('- ') && l.includes('Vector Modules'));
  assert.match(item, /`omnibox`, `contacts` and Calendar/);
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

test('outside code is a Vector App, an A2A agent and an MCP connector, one line each, with a link to extending-a-space', () => {
  const outside = section(text, 'Where outside code plugs in');
  const items = outside.split('\n').filter((l) => l.startsWith('- '));
  assert.equal(items.length, 3);
  assert.match(items[0], /\[Vector App\]\(\.\.\/vector-apps\/glossary\.md#app\) is a web app that a space shows in an iframe/);
  assert.match(items[1], /\[A2A\]\(\.\/glossary\.md#a2a\) agent/);
  assert.match(items[2], /\[MCP\]\(\.\/glossary\.md#mcp\) connector/);
  assert.ok(linksOf(outside).includes('./extending-a-space.md'));
});

test('the page has no section on organizations and spaces or on the platform rules', () => {
  assert.doesNotMatch(text, /^## (Organizations and spaces|What holds the platform together)/m);
  assert.doesNotMatch(noLinks, /\bAI gateway\b|three (platform )?rules/i);
});

test('every link resolves and every glossary anchor exists', () => {
  for (const link of linksOf(text)) {
    const [path, anchor] = link.split('#');
    assert.ok(existsSync(resolve(dirname(file), path)), link);
    if (anchor && path.endsWith('glossary.md')) {
      const terms = readFileSync(resolve(dirname(file), path), 'utf8').split('\n').filter((l) => l.startsWith('### '));
      assert.ok(terms.some((l) => l.slice(4).toLowerCase().replaceAll(' ', '-') === anchor), link);
    }
  }
});

test('Where to read next groups all ten other pages as What, Why and How, then the glossary, with no "Where to go next"', () => {
  assert.doesNotMatch(text, /Where to go next/);
  const next = section(text, 'Where to read next');
  assert.deepEqual(
    [...next.matchAll(/^\*\*(What|Why|How)\*\*$/gm)].map((m) => m[1]),
    ['What', 'Why', 'How'],
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

test('paragraphs are 5 sentences or fewer and sentences 25 words or fewer', () => {
  for (const paragraph of prose.split(/\n\n+/)) assert.ok(paragraph.split(/(?<=[.!?])\s+/).length <= 5 || paragraph.includes('\n- '), paragraph);
  for (const sentence of prose.split(/\n+/).flatMap((line) => line.split(/(?<=[.!?])\s+/)).filter((line) => /[.!?]$/.test(line))) assert.ok(sentence.split(/\s+/).length <= 25, sentence);
});

test('the page names no banned name or term', () => {
  const banned = [
    /\.md\b(?!\))/, /AuthZEN|XACML|Zanzibar|Yjs|Polyglot|RBAC|ABAC/, /operating system/i, /resource pool/i, /\bthe pool\b/i, /actor stamp/i, /\bplane\b/i,
    /View level|Edit level|five roles|five kinds/i, /\bfloor\b|primary metric|exact ROI|continuously|stated human baseline/i,
    /\bHiring\b|\bSDR\b|\bCSR\b/, /immutably|black-box/i, /\bsupport\b|\bsales\b(?! \[?space)|\bhiring\b/i, /Apollo|\bExa\b|BrightData/,
    /Distributor|Customer|Agentic Workspace|federates|tenancy\./i,
  ];
  for (const pattern of banned) assert.doesNotMatch(noLinks, pattern);
  assert.doesNotMatch(noLinks, /(?<!Vector )\bSpace\b/);
  assert.doesNotMatch(noLinks, /\bgrants?\b/i);
});

test('the page follows the voice checks', () => assert.deepEqual(voiceViolations(text), []));
