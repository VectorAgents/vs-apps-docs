import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { assertPersonaScene, bannedTermsIn, bodyOf, brokenLinks, linksOf, longSentences, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = resolve(root, 'docs/vector-space/why-vector-space.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text);
const lead = body.split(/^## /m)[0];
const plain = unlink(body);
const SCENE = 'A lead request under the three rules';

/** True when the first use of `pattern` in the body, headings aside, is the text of a markdown link. */
function firstUseLinked(pattern) {
  const masked = body.replace(/^#.*$/gm, (heading) => ' '.repeat(heading.length)).replace(/\]\([^)]*\)/g, (target) => `]${'_'.repeat(target.length - 1)}`);
  const at = masked.search(pattern);
  if (at < 0) return false;
  const open = masked.lastIndexOf('[', at);
  return open >= 0 && /^\[[^\]]*\]_/.test(masked.slice(open)) && masked.indexOf(']', open) >= at;
}

test('the page runs lead, the scene, the three platform rules, the AI gateway, Human Time Return, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [SCENE, 'The three platform rules', 'The AI gateway', 'Human Time Return', 'Where to go next']);
});

test('the lead says what Vector Space is, then what it does for the organization, and names the three rules', () => {
  assert.match(lead, /^\s*\[Vector Space\]\(\.\/glossary\.md#vector-space\) is the platform where the people and \[AI\]\(\.\/glossary\.md#ai\) agents of an \[organization\]\(\.\/glossary\.md#organization\) work together on the organization's own data\./);
  assert.match(lead, /three rules: one for access, one for AI provider keys and one for records/);
  assert.match(lead, /shared places called \[spaces\]\(\.\/glossary\.md#space\)/);
  assert.doesNotMatch(lead, /model keys/);
});

test('the scene is the first H2, with no Example heading and Acme wording', () => {
  assert.equal([...text.matchAll(/^## (.+)$/gm)][0][1], SCENE);
  assert.doesNotMatch(text, /^## .*\bExample\b/m);
  assert.doesNotMatch(text, /^## The problem/m);
  assert.doesNotMatch(plain, /\bthe sales space\b/i);
  assert.match(plain, /Maya, a member of Acme's sales team, asks the orchestrator agent in the team's space to find leads and send an outreach email/);
});

test('Human Time Return is its own section: seconds, acts, staff-approved baseline, an estimate with no return figure', () => {
  const htr = section(text, 'Human Time Return');
  assert.match(htr, /\]\(\.\/glossary\.md#human-time-return\)/);
  assert.match(htr, /counted in seconds/);
  assert.match(htr, /\[staff\]\(\.\/glossary\.md#staff\) approve the seconds per unit of an act, and that approved figure is the baseline/);
  assert.match(htr, /only successful acts with an approved baseline/i);
  assert.match(htr, /how many are not/);
  assert.match(htr, /\]\(\.\/glossary\.md#intelligence\)[^.]*in addition to spend/);
  assert.doesNotMatch(htr, /apart from spend|four things|four terms/);
  assert.match(htr, /Three things make up the figure:/);
  assert.deepEqual([...htr.matchAll(/^- \*\*(.+?)\*\*: /gm)].map((m) => unlink(m[1])), ['Act', 'Baseline', 'Valuation']);
  assert.match(htr, /\bestimate\b/);
  assert.match(htr, /return figure/);
  assert.match(htr, /An act is fixed when the platform accepts it, so a later change to the baseline does not alter it\./);
});

test('the page has no figure slot', () => {
  assert.doesNotMatch(text, /<(FigurePlaceholder|StructureFigure|FlowFigure)\b/);
  assert.doesNotMatch(readFileSync(resolve(root, 'src/diagrams/figures/slots.ts'), 'utf8'), /why-vector-space/);
});

test('the scene raises three questions: what the agent may reach, whose keys and credits, who did what', () => {
  const scene = section(text, SCENE);
  for (const phrase of [/what may the agent reach/i, /keys and credits/i, /who did what/i]) assert.match(scene, phrase);
});

test('the scene answers them: a member asks for leads, the call goes through the gateway, the run is recorded under the member', () => {
  const scene = section(text, SCENE);
  assert.match(scene, /\]\(\.\/glossary\.md#member\)/);
  assert.match(scene, /\]\(\.\/glossary\.md#orchestrator-agent\)/);
  assert.match(scene, /find leads and send an outreach email/);
  assert.match(scene, /\]\(\.\/glossary\.md#ai-gateway\)/);
  assert.match(scene, /own \[AI provider account\]\(\.\/glossary\.md#ai-provider-account\)/);
  assert.match(scene, /records the run under Maya's name/);
});

test('the scene names Maya, introduced at first use with the member link on the introduction, and no persona appears outside it', () => {
  const scene = section(text, SCENE);
  assert.match(scene, /Maya, a \[member\]\(\.\/glossary\.md#member\) of Acme's sales team, asks the \[orchestrator agent\]/);
  assert.ok(text.indexOf('Maya') < text.indexOf('(./glossary.md#member)'));
  assertPersonaScene(text, SCENE, { memberIntro: "[member](./glossary.md#member) of Acme's sales team" });
  assert.match(scene, /reaches only what Maya may reach/);
  assert.doesNotMatch(unlink(scene), /\b(this|that|the) member\b|\bmember of it\b|member's name|\b(he|she|his|her)\b/i);
  assert.equal([...plain.matchAll(/\bMaya\b/g)].length, 3);
});

test('the three platform rules are one access model, one AI gateway and one record of work, as a list', () => {
  const rules = section(text, 'The three platform rules');
  assert.deepEqual([...rules.matchAll(/^- \*\*(.+?)\*\*: /gm)].map((m) => m[1]), ['One access model', 'One AI gateway', 'One record of work']);
});

test('rule 1 names General access, shares, blocks and a condition, and rule 3 says who it ran as and what started it', () => {
  const rules = section(text, 'The three platform rules');
  assert.doesNotMatch(rules, /Each rule is a promise/);
  assert.match(rules, /\[General access\]\(\.\/glossary\.md#general-access\), \[shares\]\(\.\/glossary\.md#share\) and \[blocks\]\(\.\/glossary\.md#block\)\./);
  assert.match(rules, /A \[condition\]\(\.\/glossary\.md#condition\) limits the rows of an allowed operation/);
  assert.match(rules, /the same check covers the \[web interface\]\(\.\/glossary\.md#web-interface\), the API, agents and apps/);
  assert.match(rules, /records who it ran as and what started it/);
  assert.doesNotMatch(rules, /roles, shares, blocks and conditions/i);
  assert.doesNotMatch(rules, /traced/);
});

test('the AI gateway section states the design: every paid model call, the organization\'s own AI provider accounts, no other process holds a key, no vault or ticket detail', () => {
  const gateway = unlink(section(text, 'The AI gateway'));
  assert.doesNotMatch(plain, /account of the organization with a company/);
  assert.match(gateway, /^Every paid model call goes through the AI gateway/m);
  assert.match(gateway, /own AI provider accounts/);
  assert.match(gateway, /No other process holds an AI provider key/);
  assert.doesNotMatch(gateway, /vault|ticket|read one back/i);
  assert.doesNotMatch(gateway, /\bproduction\b|\bdev\b/i);
});

test('the gateway section states spend in full: priced from the rate card, an estimate at list price, limited by a spend cap per organization per month', () => {
  const gateway = section(text, 'The AI gateway');
  assert.match(gateway, /prices each call from the \[rate card\]\(\.\/glossary\.md#rate-card\)/);
  assert.match(gateway, /an estimate at list price/);
  assert.match(gateway, /\[spend cap\]\(\.\/glossary\.md#spend-cap\) limits it for one organization in one calendar month/);
});

test('the page stands alone: no sentence hands a topic to another page', () => {
  assert.doesNotMatch(plain, /gives the detail|says how|the next section/i);
  for (const name of ['The three platform rules', 'The AI gateway', 'Human Time Return']) {
    assert.doesNotMatch(section(text, name), /\]\(\.\/(one-access-model|the-record-of-work)\.md/, name);
  }
});

test('every term is linked at its first use', () => {
  for (const [term, pattern] of [
    ['Vector Space', /\bVector Space\b/],
    ['organization', /\borganization\b/],
    ['AI', /\bAI\b/],
    ['space', /\bspaces?\b/],
    ['member', /\bmember\b/],
    ['orchestrator agent', /\borchestrator agent\b/],
    ['staff', /\bstaff\b/],
    ['AI gateway', /\bAI gateway\b/],
    ['AI provider account', /\bAI provider account\b/],
    ['rate card', /\brate card\b/],
    ['spend cap', /\bspend cap\b/],
    ['Human Time Return', /\bHuman Time Return\b/],
    ['acts', /\bacts\b|\bact\]|\ban act\b/],
    ['Intelligence', /\bIntelligence\b/],
  ]) assert.ok(firstUseLinked(pattern), term);
});

test('every link resolves, every glossary anchor exists, and Where to go next gives a result sentence, one primary step and Related links', () => {
  assert.deepEqual(brokenLinks(text, file), []);
  const next = section(text, 'Where to go next');
  const parts = next.match(/^Where to go next\n\n(You now know [^\n]+\.) (Read \[[^\]]+\]\([^)]+\) next: [^\n]+)\n\nRelated:\n\n((?:- [^\n]+\n?)+)\s*$/);
  assert.ok(parts, 'a result sentence, a primary step and a Related list');
  assert.deepEqual(linksOf(parts[2]), ['./one-access-model.md']);
  assert.deepEqual(linksOf(parts[3]), ['./the-record-of-work.md', './how-work-moves-through-a-space.md', './glossary.md']);
});

test('a glossary term is linked once, a sentence holds 3 glossary links or fewer and 35 words or fewer, and the description is 160 characters or fewer', () => {
  const anchors = [...body.matchAll(/\]\(([^)\s]*glossary\.md#[^)\s]+)\)/g)].map((m) => m[1]);
  assert.deepEqual(anchors.filter((a, i) => anchors.indexOf(a) !== i), []);
  for (const sentence of body.split(/(?<=[.!?])\s+|\n/)) assert.ok((sentence.match(/glossary\.md#/g) ?? []).length <= 3, sentence);
  assert.deepEqual(longSentences(plain, { max: 35 }), []);
  assert.ok(text.match(/^description: (.+)$/m)[1].length <= 160);
});

test('the page names no master doc, implementation name, banned term, vendor, use case or audience', () => {
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|AI|INTELLIGENCE|APPS|GLOSSARY|README)\.md/);
  assert.deepEqual(bannedTermsIn(plain), []);
  assert.doesNotMatch(plain, /JWKS|ai-gw-svc|AI_GW_SVC_APP_URL|logicalModel|nano-USD|usage_events|price_versions|Redis/);
  assert.doesNotMatch(plain, /\bstamp\b|eliminates/i);
  assert.doesNotMatch(plain, /\b(floor|primary metric|exact ROI|continuously|stated human baseline|conservative)\b/i);
  assert.doesNotMatch(plain, /\b(Hiring|SDR|CSR|Apollo|Exa|BrightData)\b/);
  assert.doesNotMatch(plain, /\b(support|sales(?! team)|hiring)\b/i);
  assert.doesNotMatch(plain, /workspace/i);
  assert.doesNotMatch(plain, /\bwho it is for\b|\bfor organizations that\b/i);
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(plain, /TypeScript|Node|React/));

test('the page follows the voice checks and uses no em dash', () => {
  assert.deepEqual(voiceViolations(text), []);
  assert.doesNotMatch(plain, /—/);
});

test('provenance names the master docs behind the page and records the gateway address as assumed published, not verified', () => {
  const provenance = readFileSync(resolve(root, '.agents/provenance.md'), 'utf8');
  const part = provenance.split(/^## /m).find((p) => p.startsWith('Why Vector Space\n')) ?? '';
  for (const source of ['product/OVERVIEW.md', 'domains/ai/README.md', 'domains/intelligence/README.md', 'assumed published to apps, per the docs owner, and not verified against a live Vector Space']) assert.ok(part.includes(source), source);
});
