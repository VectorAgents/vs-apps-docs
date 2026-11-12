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
    'Adding an extension',
    'The comparison',
    'What the space does for every call',
    'Choosing an extension',
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

test('the lead opens with the definition of an extension and no text on this page says kind for one', () => {
  const lead = unlink(body.split(/^## /m)[0]);
  assert.match(lead, /\n\nAn extension adds logic of a team's own to a space\. It is a Vector App, an A2A agent or an MCP server\. /);
  assert.doesNotMatch(plain, /\bkinds?\b/i);
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

test('the slot extending-flow appears once, in "Adding an extension"', () => {
  assert.deepEqual(slotsIn(text), ['extending-flow']);
  assert.deepEqual(slotsIn(section(text, 'Adding an extension')), ['extending-flow']);
});

test('the paths section says how each extension gets in and that a standalone one needs no SDK', () => {
  const adding = section(text, 'Adding an extension');
  assert.match(adding, /\n\nEach extension gets in by its own path:\n\n- /);
  assert.deepEqual([...adding.matchAll(/^- \*\*(.+?)\*\*: /gm)].map((m) => unlink(m[1])), ['Vector App', 'A2A agent', 'MCP server']);
  const paths = unlink(adding);
  assert.match(paths, /someone who may manage agents in the space/);
  assert.match(paths, /agent card/);
  assert.match(paths, /stored credential/);
  assert.match(paths, /added by a member as a connector in the Context Hub/);
  assert.match(paths, /standalone A2A agent or MCP server needs no vs-apps SDK/);
  assert.match(paths, /Vector App can offer an A2A agent and an MCP server of its own/);
  assert.match(paths, /app definition/);
});

test('the comparison opens with its lead, then one table of the 4 rows, with cells of 15 words or fewer', () => {
  assert.equal((text.match(/^\| ?-{3}/gm) ?? []).length, 1, 'tables');
  const comparison = section(text, 'The comparison');
  assert.match(comparison, /^The comparison\n\nHere is what each extension learns from the space and what it can do there\.\n\n\|/);
  const [header, , ...data] = rows(comparison);
  assert.deepEqual(header.slice(1), ['Vector App', 'A2A agent', 'MCP server']);
  assert.deepEqual(data.map((r) => unlink(r[0])), ['Caller', 'Platform data', 'Model', 'Acts']);
  assert.equal(data[3][0], '[Acts](../vector-apps/glossary.md#acts)');
  for (const row of data) {
    assert.equal(row.length, 4);
    for (const cell of row.slice(1)) {
      assert.ok(unlink(cell).split(/\s+/).length <= 15, cell);
      assert.doesNotMatch(cell, /^It\b/, cell);
    }
  }
  const cells = data.map((r) => r.slice(1).map(unlink));
  assert.deepEqual(cells[0], [
    'The app sees the member by name, with the capabilities they hold.',
    'Only an agent that an app offers sees the member. Others get a stored credential.',
    'The server never sees the member.',
  ]);
  assert.deepEqual(cells[1], [
    'The app reaches what a space manager attached and the member can reach.',
    'The agent gets no token, so it cannot call the space.',
    'The server gets no token. It sees only the arguments of each call.',
  ]);
  assert.deepEqual(cells[2], [
    'A space manager sets the model slot the app uses.',
    'The remote agent runs on its own model.',
    'None. The model call of the calling agent goes through the AI gateway.',
  ]);
  assert.deepEqual(cells[3], ['Yes, from the server of the app.', 'No. An app that offers it can record acts for it.', 'No.']);
  assert.match(data[2][1], /\[model slot\]\(\.\.\/vector-apps\/glossary\.md#model-slot\)/);
  assert.match(data[2][3], /\[AI gateway\]\(\.\/glossary\.md#ai-gateway\)/);
});

test('no line follows the comparison table', () => {
  assert.ok(section(text, 'The comparison').trimEnd().endsWith('|'));
});

test('the shared call path says each call starts in a run, is gated first and is recorded', () => {
  const shared = unlink(section(text, 'What the space does for every call'));
  assert.match(shared, /\n\nThe three extensions share one path\./);
  assert.match(shared, /\brun\b/);
  assert.match(shared, /works as the member/);
  assert.match(shared, /before the call/i);
  assert.doesNotMatch(shared, /never learns who/, 'the table owns it');
  assert.match(shared, /records/);
  assert.doesNotMatch(shared, /inherit/i, 'no "A2A inherits the space access"');
});

test('the choice section gives one "build one when" trigger per extension, a mixed-need rule and the REST connector route', () => {
  const choice = unlink(section(text, 'Choosing an extension'));
  assert.match(choice, /\n\nPick by what your logic does:\n\n/);
  const bullets = [...choice.matchAll(/^- \*\*(.+?)\*\*: (.+)$/gm)];
  assert.deepEqual(bullets.map((m) => m[1]), ['Vector App', 'A2A agent', 'MCP server']);
  for (const [, , trigger] of bullets) assert.match(trigger, /^build one when /);
  assert.match(bullets[0][2], /screens, pages or data tables/);
  assert.match(bullets[1][2], /autonomous reasoning/);
  assert.match(bullets[2][2], /external API/);
  assert.match(bullets[2][2], /REST connector in the Context Hub, with no MCP server\./);
  assert.match(choice, /needs screens and also reasoning or tools, build a Vector App that offers an A2A agent or an MCP server\./);
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
