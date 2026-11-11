import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bannedTermsIn, bodyOf, brokenLinks, linksOf, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/extending-a-space.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text);
const prose = body.replace(/^import .*$/gm, '').replace(/<(?:FigurePlaceholder|FlowFigure)[^>]*\/>/g, '');
const plain = unlink(prose);
const slotsIn = (s) => [...s.matchAll(/<FigurePlaceholder slot="([^"]+)" \/>|<FlowFigure data=\{extendingFlow\} \/>/g)].map((m) => m[1] ?? 'extending-flow');
const rows = (s) =>
  s
    .split('\n')
    .filter((l) => l.startsWith('|'))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));

test('the page runs lead, the scene, four detail sections, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [
    'A question about open tickets',
    'The three kinds and how each gets in',
    'The comparison',
    'What the space does for every call',
    'Choosing a kind',
    'Where to go next',
  ]);
});

test('the lead defines a Vector App, an A2A agent and an MCP server, each with a glossary link', () => {
  const lead = body.split(/^## /m)[0];
  assert.match(lead, /\[Vector App\]\(\.\.\/vector-apps\/glossary\.md#app\) is a web app that a space shows in an iframe/);
  assert.match(lead, /\[A2A\]\(\.\/glossary\.md#a2a\) agent/);
  assert.match(lead, /\[MCP\]\(\.\/glossary\.md#mcp\) server/);
  assert.match(lead, /All three run outside the space, on their own origins\./);
});

test('the scene is the first H2, with no Example heading and Acme wording, and offers one ticket tracker three ways with no vendor', () => {
  assert.equal([...text.matchAll(/^## (.+)$/gm)][0][1], 'A question about open tickets');
  assert.doesNotMatch(text, /^## .*\bExample\b/m);
  const example = section(text, 'A question about open tickets');
  assert.match(example, /\n\nAcme's engineering team has a space, and a \[member\]\(\.\/glossary\.md#member\) of it asks the \[orchestrator agent\]\(\.\/glossary\.md#orchestrator-agent\) which tickets are still open/);
  assert.match(example, /ticket tracker/);
  assert.match(example, /\[member\]\(\.\/glossary\.md#member\)/);
  assert.match(example, /\[orchestrator agent\]\(\.\/glossary\.md#orchestrator-agent\)/);
  for (const kind of ['Vector App', 'A2A agent', 'MCP server']) assert.ok(unlink(example).includes(kind), kind);
  assert.doesNotMatch(example, /Jira|Linear|GitHub|Zendesk|ClickUp/);
});

test('the slot extending-flow appears once, in "The three kinds and how each gets in"', () => {
  assert.deepEqual(slotsIn(text), ['extending-flow']);
  assert.deepEqual(slotsIn(section(text, 'The three kinds and how each gets in')), ['extending-flow']);
});

test('the paths section says how each kind gets in and that a standalone one needs no SDK', () => {
  const kinds = section(text, 'The three kinds and how each gets in');
  assert.match(kinds, /\n\nEach kind gets in by its own path:\n\n- /);
  assert.deepEqual([...kinds.matchAll(/^- \*\*(.+?)\*\*: /gm)].map((m) => unlink(m[1])), ['Vector App', 'A2A agent', 'MCP server']);
  const paths = unlink(kinds);
  assert.match(paths, /someone who may manage agents in the space/);
  assert.match(paths, /agent card/);
  assert.match(paths, /stored credential/);
  assert.match(paths, /added by a member as a connector in the Context Hub/);
  assert.match(paths, /standalone A2A agent or MCP server needs no vs-apps SDK/);
  assert.match(paths, /Vector App can offer an A2A agent and an MCP server of its own/);
  assert.match(paths, /app definition/);
});

test('the comparison is one table of the 4 rows of the spec, with cells of 15 words or fewer', () => {
  assert.equal((text.match(/^\| ?-{3}/gm) ?? []).length, 1, 'tables');
  const [header, , ...data] = rows(section(text, 'The comparison'));
  assert.deepEqual(header.slice(1), ['Vector App', 'A2A agent', 'MCP server']);
  assert.deepEqual(data.map((r) => r[0]), ['Calling member', 'Platform data', 'Model calls', 'Acts']);
  for (const row of data) {
    assert.equal(row.length, 4);
    for (const cell of row) assert.ok(unlink(cell).split(/\s+/).length <= 15, cell);
  }
  const cells = data.map((r) => r.slice(1).map(unlink));
  assert.match(cells[0][0], /^Named, with the capabilities they hold/);
  assert.match(cells[0][1], /Named only if an app offers it/);
  assert.match(cells[0][1], /stored credential/);
  assert.match(cells[0][2], /^Never named/);
  assert.match(cells[1][0], /Only what a space manager attached and the member reaches/);
  assert.match(cells[1][1], /no token to call the space/);
  assert.match(cells[1][2], /no token to call the space; receives the call's arguments/);
  assert.match(cells[2][0], /model slot a space manager sets/);
  assert.match(cells[2][1], /remote agent's own model/);
  assert.match(cells[2][2], /AI gateway/);
  assert.deepEqual(cells[3], ['Yes, from the app\'s server', 'No', 'No']);
});

test('the shared call path says each call starts in a run, is gated first and is recorded', () => {
  const shared = unlink(section(text, 'What the space does for every call'));
  assert.match(shared, /\brun\b/);
  assert.match(shared, /works as the member/);
  assert.match(shared, /before the call/i);
  assert.doesNotMatch(shared, /never learns who/, 'the table owns it');
  assert.match(shared, /records/);
  assert.doesNotMatch(shared, /inherit/i, 'no "A2A inherits the space access"');
});

test('choosing a kind gives one fit for each kind', () => {
  const choosing = unlink(section(text, 'Choosing a kind'));
  assert.match(choosing, /\n\nEach kind fits one case:\n\n/);
  assert.deepEqual([...choosing.matchAll(/^- \*\*(.+?)\*\*: /gm)].map((m) => m[1]), ['Vector App', 'A2A agent', 'MCP server']);
});

test('outside Where to go next the body links only glossaries and concept pages, no build page or guide', () => {
  const body = text.replace(section(text, 'Where to go next'), '');
  for (const link of linksOf(body)) assert.doesNotMatch(link, /how-a-vector-app-works|guides\/|quickstart|sdk\/overview/, link);
});

test('every link resolves and every glossary anchor exists', () => {
  assert.deepEqual(brokenLinks(text, file), []);
});

test('Where to go next links the Apps quickstart, the SDK overview and the glossary, and no page links /a2a/ or /mcp/', () => {
  assert.deepEqual(linksOf(section(text, 'Where to go next')), ['../vector-apps/quickstart.md', '../sdk/overview.md', './glossary.md']);
  for (const link of linksOf(text)) assert.doesNotMatch(link, /(^|\/)(a2a|mcp)(\/|\.md|$)/, link);
  assert.doesNotMatch(text, /\]\(\/(a2a|mcp)/);
});

test('the page names A2A and MCP in text, each linked to the glossary', () => {
  assert.match(text, /\[A2A\]\(\.\/glossary\.md#a2a\)/);
  assert.match(text, /\[MCP\]\(\.\/glossary\.md#mcp\)/);
});

test('the page holds 500 to 800 words', () => {
  const words = plain.replace(/^#.*$/gm, '').split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 500 && words <= 800, `${words} words`);
});

test('the page names no master doc, implementation name, banned term, vendor or use case', () => {
  assert.doesNotMatch(text, /(COMMAND-CENTER|PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|SURFACE|STUDIO|INTELLIGENCE|README)\.md/);
  assert.doesNotMatch(prose, /private_key_jwt|outbox|event plane|events plane|CloudEvents|JWKS|RS256|signMcpToken|McpExecutorTokenService|credentialInstanceId|fetchAgentCardOnly|appKey|appId|vs-span|connector#run|manage_agents|approvalRequired/);
  assert.deepEqual(bannedTermsIn(prose), []);
  assert.doesNotMatch(prose, /\b(Apollo|Exa|BrightData|Hiring|SDR|CSR|Slack)\b/);
  assert.doesNotMatch(prose, /\b(support|hiring)\b/i);
  assert.doesNotMatch(prose, /\bsales\b(?! team)/i);
  assert.doesNotMatch(prose, /public host|#\d{3}\b/);
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(prose, /TypeScript|Node|React/));

test('the page follows the voice checks and has no em dash', () => {
  assert.deepEqual(voiceViolations(text), []);
  assert.doesNotMatch(prose, /—/);
});
