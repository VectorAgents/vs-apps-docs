import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bannedTermsIn, bodyOf, brokenLinks, linksOf, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = resolve(root, 'docs/vector-space/why-vector-space.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text);
const lead = body.split(/^## /m)[0];
const plain = unlink(body);

/** True when the first use of `pattern` in the body, headings aside, is the text of a markdown link. */
function firstUseLinked(pattern) {
  const masked = body.replace(/^#.*$/gm, (heading) => ' '.repeat(heading.length)).replace(/\]\([^)]*\)/g, (target) => `]${'_'.repeat(target.length - 1)}`);
  const at = masked.search(pattern);
  if (at < 0) return false;
  const open = masked.lastIndexOf('[', at);
  return open >= 0 && /^\[[^\]]*\]_/.test(masked.slice(open)) && masked.indexOf(']', open) >= at;
}

test('the page runs the problem, the three platform rules, the AI gateway, Human Time Return, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [
    'The problem Vector Space solves',
    'The three platform rules',
    'The AI gateway',
    'Human Time Return',
    'Where to go next',
  ]);
});

test('the lead opens with the problem and names the three rules', () => {
  assert.match(lead, /^\s*Once \[AI\]\(\.\/glossary\.md#ai\) agents work on an /);
  assert.match(lead, /\]\(\.\/glossary\.md#vector-space\)/);
  assert.match(lead, /one for access, one for AI provider keys and one for records/);
  assert.doesNotMatch(lead, /model keys/);
  assert.match(lead, /is the platform that does this\. People and agents work/);
});

test('the scene is the first H2, with no Example heading and Acme wording', () => {
  assert.equal([...text.matchAll(/^## (.+)$/gm)][0][1], 'The problem Vector Space solves');
  assert.doesNotMatch(text, /^## .*\bExample\b/m);
  assert.doesNotMatch(plain, /\bthe sales space\b/i);
  assert.match(plain, /Acme's sales team has a space, and a member of it asks the orchestrator agent to find leads and send an outreach email/);
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
  assert.match(htr, /\]\(\.\/the-record-of-work\.md#acts-and-human-time-return\)/);
});

test('the page has no figure slot', () => {
  assert.doesNotMatch(text, /<(FigurePlaceholder|StructureFigure|FlowFigure)\b/);
  assert.doesNotMatch(readFileSync(resolve(root, 'src/diagrams/figures/slots.ts'), 'utf8'), /why-vector-space/);
});

test('the problem section names three problems: reaching data or tools, keys and credits, and who did what', () => {
  const problem = section(text, 'The problem Vector Space solves');
  for (const phrase of [/reach data or tools/i, /keys and credits/i, /who did what/i]) assert.match(problem, phrase);
});

test('the scene sits in the problem section: a member asks for leads, the call goes through the gateway, the run is recorded under the member', () => {
  const problem = section(text, 'The problem Vector Space solves');
  assert.match(problem, /\]\(\.\/glossary\.md#member\)/);
  assert.match(problem, /\]\(\.\/glossary\.md#orchestrator-agent\)/);
  assert.match(problem, /find leads and send an outreach email/);
  assert.match(problem, /\]\(\.\/glossary\.md#ai-gateway\)/);
  assert.match(problem, /own AI provider account/);
  assert.match(problem, /records the run under the member's name/);
});

test('the three platform rules are one access model, one AI gateway and one record of work, as a list', () => {
  const rules = section(text, 'The three platform rules');
  assert.deepEqual([...rules.matchAll(/^- \*\*(.+?)\*\*: /gm)].map((m) => m[1]), ['One access model', 'One AI gateway', 'One record of work']);
});

test('rule 1 names General access, shares, blocks and conditions, and rule 3 says who it ran as and what started it', () => {
  const rules = section(text, 'The three platform rules');
  assert.doesNotMatch(rules, /Each rule is a promise/);
  assert.match(rules, /General access\]\(\.\/glossary\.md#general-access\), \[shares\]\(\.\/glossary\.md#share\), \[blocks\]\(\.\/glossary\.md#block\) and \[conditions\]\(\.\/glossary\.md#condition\)/);
  assert.match(rules, /records who it ran as and what started it/);
  assert.doesNotMatch(rules, /roles, shares, blocks and conditions/i);
  assert.doesNotMatch(rules, /traced/);
});

test('the AI gateway section states the design: every paid model call, the organization\'s own AI provider accounts, no other process holds a key, no vault or ticket detail', () => {
  const gateway = unlink(section(text, 'The AI gateway'));
  assert.match(text, /own \[AI provider accounts\]\(\.\/glossary\.md#ai-provider-account\)/);
  assert.doesNotMatch(plain, /account of the organization with a company/);
  assert.match(gateway, /^Every paid model call goes through the AI gateway/m);
  assert.match(gateway, /own AI provider accounts/);
  assert.match(gateway, /No other process holds an AI provider key/);
  assert.doesNotMatch(gateway, /vault|ticket|read one back/i);
  assert.doesNotMatch(gateway, /\bproduction\b|\bdev\b/i);
});

test('the three rules, the problem and the gateway link the pages that own their detail', () => {
  assert.match(section(text, 'The three platform rules'), /\]\(\.\/one-access-model\.md\)/);
  assert.match(section(text, 'The three platform rules'), /\]\(\.\/the-record-of-work\.md\)/);
  assert.match(section(text, 'The AI gateway'), /\]\(\.\/the-record-of-work\.md\)/);
});

test('every term is linked at its first use', () => {
  for (const [term, pattern] of [
    ['organization', /\borganization\b/],
    ['AI', /\bAI\b/],
    ['space', /\bspaces?\b/],
    ['member', /\bmember\b/],
    ['orchestrator agent', /\borchestrator agent\b/],
    ['staff', /\bstaff\b/],
    ['AI gateway', /\bAI gateway\b/],
    ['Human Time Return', /\bHuman Time Return\b/],
    ['acts', /\bacts\b|\bact\]|\ban act\b/],
    ['Intelligence', /\bIntelligence\b/],
  ]) assert.ok(firstUseLinked(pattern), term);
});

test('every link resolves, every glossary anchor exists, and Where to go next links its three pages and the glossary in order', () => {
  assert.deepEqual(brokenLinks(text, file), []);
  assert.deepEqual(linksOf(section(text, 'Where to go next')), [
    './one-access-model.md',
    './the-record-of-work.md',
    './how-work-moves-through-a-space.md',
    './glossary.md',
  ]);
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

test('provenance names the master docs behind the page and says the gateway is unverified for production', () => {
  const provenance = readFileSync(resolve(root, '.agents/provenance.md'), 'utf8');
  const part = provenance.split(/^## /m).find((p) => p.startsWith('Why Vector Space\n')) ?? '';
  for (const source of ['product/OVERVIEW.md', 'domains/ai/README.md', 'domains/intelligence/README.md', 'Unverified: whether production runs the gateway']) assert.ok(part.includes(source), source);
});
