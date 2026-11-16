import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { assertPersonaScene, bannedTermsIn, bodyOf, brokenLinks, linksOf, longSentences, section, unlink } from './page-helpers.mjs';
import { assertWhereNext, glossaryLinkProblems } from './concept-link-rules.mjs';
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
  assert.match(lead, /It is a \[Vector App\]\(\.\.\/vector-apps\/glossary\.md#app\), an \[A2A\]\(\.\/glossary\.md#a2a\) agent or an \[MCP\]\(\.\/glossary\.md#mcp\) server\./);
  assert.match(lead, /A Vector App is a web app that a space shows in an iframe/);
  assert.match(lead, /An A2A agent is a remote \[agent\]\(\.\/glossary\.md#agent\) that an agent of the space hands work to/);
  assert.match(lead, /An MCP server is a remote set of tools that agents call/);
  assert.match(lead, /All three run outside the space, on servers of their own\./);
  assert.doesNotMatch(plain, /\borigins?\b/);
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
  assert.match(example, /\n\nErik, a \[member\]\(\.\/glossary\.md#member\) of Acme's engineering team, asks the \[orchestrator agent\]\(\.\/glossary\.md#orchestrator-agent\) which tickets are still open in the team's space\./);
  assert.match(example, /ticket tracker/);
  assert.match(example, /\[orchestrator agent\]\(\.\/glossary\.md#orchestrator-agent\)/);
  for (const kind of ['Vector App', 'A2A agent', 'MCP server']) assert.ok(unlink(example).includes(kind), kind);
  assert.doesNotMatch(example, /Jira|Linear|GitHub|Zendesk|ClickUp/);
});

test('the scene names Erik in place of "a member"', () => {
  const scene = section(text, 'A question about open tickets');
  assert.match(scene, /Each call starts in Erik's \[run\]\(\.\/glossary\.md#run\)\./);
  assert.doesNotMatch(scene, /a member of it|this member|that member|the member's/);
  for (const paragraph of scene.split('\n\n')) assert.ok((unlink(paragraph).match(/[.?!](?:\s|$)/g) ?? []).length <= 5, paragraph);
});

test('Erik is introduced once and the first "member" on the page is the glossary link on that introduction, and no persona is named outside the scene', () => {
  assert.equal(body.match(/Erik, a /g)?.length, 1);
  assertPersonaScene(text, 'A question about open tickets', { memberIntro: "[member](./glossary.md#member) of Acme's engineering team" });
  assert.ok(body.indexOf('Erik') < body.indexOf('[member]'));
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
  assert.match(paths, /added by a member as a context in the Context Hub/);
  assert.match(adding, /as a \[context\]\(\.\/glossary\.md#context\) in the \[Context Hub\]\(\.\/glossary\.md#context-hub\)/);
  assert.match(adding, /If the \[organization\]\(\.\/glossary\.md#organization\) saved a stored credential/);
  assert.match(paths, /The context starts with General access set to Restricted, so only that member reaches it until they share it\./);
  assert.doesNotMatch(paths, /explains Restricted/);
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
    'The app reaches what is attached to it and the member can reach.',
    'The agent gets no token, so it cannot call the space.',
    'The server gets no token. It sees only the arguments of each call.',
  ]);
  assert.deepEqual(cells[2], [
    'A space admin sets the model slot the app uses.',
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
  assert.match(shared, /The space records each call: a call to an MCP server is a record with its actor, and a call to an A2A agent is a run\./);
  assert.match(shared, /The record of work covers the views that read these records\./);
  assert.doesNotMatch(shared, /says what each record holds/);
  assert.doesNotMatch(shared, /inherit/i, 'no "A2A inherits the space access"');
});

test('the choice section gives one "build one when" trigger per extension, a mixed-need rule and the REST context route', () => {
  const choice = unlink(section(text, 'Choosing an extension'));
  assert.match(choice, /\n\nPick by what your logic does:\n\n/);
  const bullets = [...choice.matchAll(/^- \*\*(.+?)\*\*: (.+)$/gm)];
  assert.deepEqual(bullets.map((m) => m[1]), ['Vector App', 'A2A agent', 'MCP server']);
  for (const [, , trigger] of bullets) assert.match(trigger, /^build one when /);
  assert.match(bullets[0][2], /screens, pages or data tables/);
  assert.match(bullets[1][2], /autonomous reasoning/);
  assert.match(bullets[2][2], /external API/);
  assert.match(bullets[2][2], /REST context in the Context Hub, with no MCP server\./);
  assert.match(section(text, 'Choosing an extension'), /\[Context Hub\]\(\.\/context-hub\.md#apis-and-mcp-servers\)/);
  assert.match(choice, /needs screens and also reasoning or tools, build a Vector App that offers an A2A agent or an MCP server\./);
});

test('outside Where to go next the body links only glossaries and concept pages, no build page or guide', () => {
  const body = text.replace(section(text, 'Where to go next'), '');
  for (const link of linksOf(body)) assert.doesNotMatch(link, /how-a-vector-app-works|guides\/|quickstart|sdk\/overview/, link);
});

test('every link resolves and every glossary anchor exists', () => {
  assert.deepEqual(brokenLinks(text, file), []);
});

test('Where to go next gives a result sentence, one primary step and Related, and no page links /a2a/ or /mcp/', () => {
  assertWhereNext(text, { primary: '../vector-apps/quickstart.md', related: ['../sdk/overview.md'] });
  for (const link of linksOf(text)) assert.doesNotMatch(link, /(^|\/)(a2a|mcp)(\/|\.md|$)/, link);
  assert.doesNotMatch(text, /\]\(\/(a2a|mcp)/);
});

test('the page links each glossary entry once, at most 3 in a sentence', () => assert.deepEqual(glossaryLinkProblems(text), []));

test('the description is one noun-phrase sentence of 160 characters or fewer', () => {
  const description = text.match(/^description: (.+)$/m)[1];
  assert.ok(description.length <= 160);
  assert.doesNotMatch(description, /^(This page|Learn|How to)\b/);
  assert.equal(description.match(/[.?!]/g).length, 1);
});

test('no sentence of the page passes 35 words', () => assert.deepEqual(longSentences(plain, { max: 35 }), []));

test('the page names A2A and MCP in text, each linked to the glossary', () => {
  assert.match(text, /\[A2A\]\(\.\/glossary\.md#a2a\)/);
  assert.match(text, /\[MCP\]\(\.\/glossary\.md#mcp\)/);
});

test('the page holds 500 to 850 words', () => {
  const words = plain.replace(/^#.*$/gm, '').split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 500 && words <= 850, `${words} words`);
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
