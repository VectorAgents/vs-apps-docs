import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { assertPersonaScene, bannedTermsIn, bodyOf, brokenLinks, linksOf, longSentences, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/one-access-model.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text).replace(/^import .*$/gm, '').trim();
const prose = body.replace(/<(?:FigurePlaceholder|StructureFigure)[^>]*\/>/g, '').replace(/\]\([^)]*\)/g, ']').replace(/[#*`|]/g, '');
const lead = body.split(/^## /m)[0];
const noLinks = body.replace(/\]\([^)]*\)/g, ']');

const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

test('the page runs lead, the scene, three detail H2s, Where to go next', () => {
  assert.deepEqual(headings, ['A lead search limited by region', 'What the check reads', 'How the inputs combine', 'A centralized check for every way in', 'Where to go next']);
  assert.match(lead, /^Access defines the set of operations a user, agent or app is permitted to perform on a resource within a space\./, 'the lead opens with the definition');
});

test('the scene is the first H2 and names no Example', () => {
  assert.equal(headings[0], 'A lead search limited by region');
  assert.doesNotMatch(text, /^#+ .*Example/m);
  assert.doesNotMatch(prose, /the sales space/i);
});

test('the scene names Maya and Omar, introduces each in the persona record form and links member on the first introduction', () => {
  const scene = section(text, 'A lead search limited by region');
  assert.match(scene, /\nMaya, a \[member\]\(\.\/glossary\.md#member\) of Acme's sales team, asks the \[orchestrator agent\]\(\.\/glossary\.md#orchestrator-agent\) to find leads in the team's space\./);
  assert.match(scene, /Omar, another member of the team, is in a group whose condition is region equals US, so the same request gives Omar US leads only\./);
  assert.equal(scene.match(/\bMaya, a /g)?.length, 1, 'Maya is introduced once');
  assert.equal(scene.match(/\bOmar, another member of the team\b/g)?.length, 1, 'Omar is introduced once');
  assert.match(scene, /Maya can also open the lead list in a \[Vector App\]\(\.\.\/vector-apps\/glossary\.md#app\), a web app that a space shows in an iframe\. Both ways in reach the datasource through the same check, so Maya sees the same EU leads\./);
  assert.match(scene, /\nAn API key that acts as Maya gets the same EU leads\./);
  assert.doesNotMatch(scene, /\b(?:the|this|that) member\b/);
});

test('personas stay in the scene: the other sections and the figure keep the generic member', () => {
  assertPersonaScene(text, 'A lead search limited by region');
  assert.match(section(text, 'A centralized check for every way in'), /\*\*Web interface\*\*: the work runs as the member\./);
});

test('the figure slot appears once, inside "How the inputs combine"', () => {
  assert.equal(text.match(/<StructureFigure\b/g)?.length, 1);
  assert.match(section(text, 'How the inputs combine'), /<StructureFigure data=\{accessCheck\} \/>/);
});

test('the example is Maya, who sees only the EU leads, by a condition on the group, in the app and through the orchestrator agent', () => {
  const example = section(text, 'A lead search limited by region');
  for (const word of ['orchestrator agent', 'leads', 'EU', 'condition', 'group', 'member']) assert.ok(example.includes(word), word);
  assert.match(example, /\[condition\]\(\.\/glossary\.md#condition\)/);
  assert.match(example, /app/);
});

test('the API-key variant is one closing paragraph that can be cut alone', () => {
  const paragraphs = section(text, 'A lead search limited by region').split(/\n\n+/).slice(1).map((p) => p.trim()).filter(Boolean);
  assert.equal(paragraphs.filter((p) => /API key/.test(p)).length, 1);
  assert.match(paragraphs.at(-1), /^An API key /);
  assert.doesNotMatch(paragraphs.slice(0, -1).join('\n'), /API key|service account/i);
});

test('the check reads General access, shares, blocks and conditions, with each term linked once on the page', () => {
  const reads = section(text, 'What the check reads');
  for (const anchor of ['general-access', 'share', 'block', 'role', 'can-use', 'can-edit']) assert.ok(reads.includes(`](./glossary.md#${anchor})`), anchor);
  assert.deepEqual([...reads.matchAll(/^- \*\*(?:\[)?(.+?)(?:\]\([^)]*\))?\*\*: /gm)].map((m) => m[1]), ['General access', 'Share', 'Block', 'Condition']);
  assert.match(reads, /\*\*Condition\*\*: limits which rows an allowed operation may touch/);
});

test('a block names its two presets and a group share reaches nested groups', () => {
  const reads = section(text, 'What the check reads');
  assert.match(reads, /Everything, which denies every action, or Editing, which denies the change actions and leaves use/);
  assert.match(reads, /including through groups nested inside it/);
});

test('the page uses user, not caller', () => assert.doesNotMatch(prose, /\bcaller\b/));

test('a share of a group and a block are each stated in two sentences, one fact each', () => {
  const reads = section(text, 'What the check reads');
  assert.match(reads, /\*\*\[Share\]\(\.\/glossary\.md#share\)\*\*: gives one user, group or Vector App a role on a resource\. A share of a group reaches every user that the group holds, including through groups nested inside it\./);
  assert.match(reads, /whatever their shares give\. A block is Everything,/);
});

test('a Restricted resource is closed even to an organization admin unless a share names it', () => {
  const reads = section(text, 'What the check reads');
  assert.match(reads, /Restricted/);
  assert.match(reads, /organization admin/);
  assert.match(reads, /unless a share names them/);
  assert.doesNotMatch(reads, /easy to miss/);
});

test('the combination says what wins, never a numbered order', () => {
  const combine = section(text, 'How the inputs combine');
  assert.match(combine, /Four rules say what wins:/);
  assert.doesNotMatch(combine, /not a numbered order/);
  assert.match(combine, /A block wins/);
  assert.doesNotMatch(combine, /^\s*\d+\.\s/m);
  assert.doesNotMatch(noLinks, /\bsteps?\b|\bfirst,|\bsecond,|\bthird,|\bthen\b/i);
});

test('conditions apply to datasources and contexts only', () => {
  assert.match(section(text, 'How the inputs combine'), /[Cc]onditions apply to datasources and contexts only/);
});

test('a capability grant is a share on named capabilities of a Vector App at Can use, linked to the Apps glossary', () => {
  const every = section(text, 'A centralized check for every way in');
  assert.match(every, /\[capability grant\]\(\.\.\/vector-apps\/glossary\.md#capability-grant\) is a share on named capabilities of a Vector App at Can use/);
});

test('one sentence says an approval is a second check', () => {
  const every = section(text, 'A centralized check for every way in');
  const sentences = every.replace(/\]\([^)]*\)/g, ']').match(/[^.]*\bapproval\b[^.]*\./g) ?? [];
  assert.equal(sentences.filter((s) => /second check/.test(s)).length, 1);
  assert.ok(linksOf(every).includes('./approvals-and-the-command-center.md'));
});

test('the page covers the web interface, the API, agents and apps', () => {
  const every = section(text, 'A centralized check for every way in');
  for (const word of ['app', 'API', 'agent', 'Vector App']) assert.ok(every.includes(word), word);
  assert.ok(lead.includes('and apps. The check reads four inputs, and rules say which input wins.'), 'the lead splits the check from its four inputs');
  assert.doesNotMatch(lead, /and the check reads four inputs|clear rules/);
  assert.ok(lead.includes('the [web interface](./glossary.md#web-interface), the API, agents and apps'));
});

test('every link resolves, and Where to go next gives a result sentence, one primary step and Related links to other topics', () => {
  assert.deepEqual(brokenLinks(text, file), []);
  const next = section(text, 'Where to go next');
  const parts = next.match(/^Where to go next\n\n(You now know [^\n]+\.) (Read \[[^\]]+\]\([^)]+\) next: [^\n]+)\n\nRelated:\n\n((?:- [^\n]+\n?)+)\s*$/);
  assert.ok(parts, 'a result sentence, a primary step and a Related list');
  assert.deepEqual(linksOf(parts[2]), ['./how-work-moves-through-a-space.md']);
  assert.deepEqual(linksOf(parts[3]), ['./who-can-do-what.md', './approvals-and-the-command-center.md', './glossary.md']);
  assert.match(parts[3], /the four kinds of people and callers in Vector Space, and the space roles and share levels that say what each may do/);
});

test('a glossary term is linked once, a sentence holds 3 glossary links or fewer and 35 words or fewer, and the description is 160 characters or fewer', () => {
  const anchors = [...body.matchAll(/\]\(([^)\s]*glossary\.md#[^)\s]+)\)/g)].map((m) => m[1]);
  assert.deepEqual(anchors.filter((a, i) => anchors.indexOf(a) !== i), []);
  for (const sentence of body.split(/(?<=[.!?])\s+|\n/)) assert.ok((sentence.match(/glossary\.md#/g) ?? []).length <= 3, sentence);
  assert.deepEqual(longSentences(body.replace(/\]\([^)]*\)/g, ']').replace(/\[|\]/g, ''), { max: 35 }), []);
  assert.ok(text.match(/^description: (.+)$/m)[1].length <= 160);
});

test('each term is linked at its first use: group, orchestrator agent, member, Vector App', () => {
  const clean = body.replace(/^description:.*$/m, '');
  for (const [term, target] of [['group', './glossary.md#group'], ['orchestrator agent', './glossary.md#orchestrator-agent'], ['member', './glossary.md#member'], ['Vector App', '../vector-apps/glossary.md#app']]) {
    const first = new RegExp(`\\b${term}\\b`).exec(clean);
    assert.ok(first, term);
    const link = `[${term}](${target})`;
    assert.equal(clean.slice(first.index - 1, first.index - 1 + link.length), link, `${term} first use is linked`);
  }
});

test('paragraphs are 5 sentences or fewer and the page has no em dash', () => {
  for (const paragraph of prose.split(/\n\n+/)) assert.ok(paragraph.split(/(?<=[.!?])\s+/).length <= 5 || paragraph.includes('\n- '), paragraph);
  assert.doesNotMatch(prose, /—/);
});

test('the page names no banned name or term', () => {
  const banned = [
    /\.md\b(?!\))/, /RBAC|ABAC|userset|\bPDP\b|\bPEP\b/, /\bthe pool\b/i,
    /View level|Edit level|member level|role grant|scoped grant|five roles/i, /elevated actor/i, /ceiling|floor|obligation|permit\b|deny-overrides/i,
    /\bHiring\b|\bSDR\b|\bCSR\b/, /\bsupport\b|\bsales\b(?! team)|\bhiring\b/i, /Apollo|\bExa\b|BrightData/, /immediately/i,
  ];
  for (const pattern of banned) assert.doesNotMatch(noLinks, pattern);
  assert.deepEqual(bannedTermsIn(noLinks), []);
});

test('the page follows the voice checks', () => assert.deepEqual(voiceViolations(text), []));
