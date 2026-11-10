import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const file = resolve(root, 'docs/vector-space/why-vector-space.md');
const text = readFileSync(file, 'utf8');
const body = text.replace(/^---\n[\s\S]*?\n---\n/, '');
const lead = body.split(/^## /m)[0];
const plain = body.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

/** True when the first use of `pattern` in the body is the text of a markdown link. */
function firstUseLinked(pattern) {
  const masked = body.replace(/\]\([^)]*\)/g, (target) => `]${'_'.repeat(target.length - 1)}`);
  const at = masked.search(pattern);
  if (at < 0) return false;
  const open = masked.lastIndexOf('[', at);
  return open >= 0 && /^\[[^\]]*\]_/.test(masked.slice(open)) && masked.indexOf(']', open) >= at;
}

test('the page runs the problem, the three platform rules, the AI gateway, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [
    'The problem Vector Space solves',
    'The three platform rules',
    'The AI gateway',
    'Where to go next',
  ]);
});

test('the lead opens with the problem, then states Human Time Return in the corrected wording', () => {
  assert.match(lead, /^\s*Once \[AI\]\(\.\/glossary\.md#ai\) agents work on an /);
  assert.ok(lead.indexOf('glossary.md#vector-space') < lead.indexOf('glossary.md#human-time-return'));
  assert.match(lead, /\]\(\.\/glossary\.md#human-time-return\)/);
  assert.match(lead, /counted in seconds/);
  assert.match(lead, /\bestimate\b/);
  assert.match(lead, /only successful acts with an approved baseline/i);
  assert.match(lead, /how many are not/);
  assert.match(lead, /\]\(\.\/glossary\.md#intelligence\)[^.]*apart from spend/);
  assert.match(lead, /return figure/);
});

test('the page is 500 to 800 words with at most one table and no figure slot', () => {
  const words = plain.split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 500 && words <= 800, `${words} words`);
  assert.ok((text.match(/^\| ?-{3}/gm) ?? []).length <= 1, 'tables');
  assert.doesNotMatch(text, /<(FigurePlaceholder|StructureFigure|FlowFigure)\b/);
  assert.doesNotMatch(readFileSync(resolve(root, 'src/diagrams/figures/slots.ts'), 'utf8'), /why-vector-space/);
});

test('the problem section asks who may reach what, whose keys and money, and who did what', () => {
  const problem = section(text, 'The problem Vector Space solves');
  for (const question of [/who may reach what/i, /whose keys and money/i, /who did what/i]) assert.match(problem, question);
});

test('the early example sits in the problem section: a member asks for leads, the call goes through the gateway, the run is recorded under the member', () => {
  assert.doesNotMatch(text, /^## Example$/m);
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
  assert.deepEqual([...rules.matchAll(/^- \*\*(.+?)\.\*\*/gm)].map((m) => m[1]), ['One access model', 'One AI gateway', 'One record of work']);
});

test('rule 1 names General access, shares, blocks and Conditions, and rule 3 says who it ran as and what started it', () => {
  const rules = section(text, 'The three platform rules');
  assert.match(rules, /General access\]\(\.\/glossary\.md#general-access\), \[shares\]\(\.\/glossary\.md#share\), \[blocks\]\(\.\/glossary\.md#block\) and \[Conditions\]\(\.\/glossary\.md#condition\)/);
  assert.match(rules, /records who it ran as and what started it/);
  assert.doesNotMatch(rules, /roles, shares, blocks and conditions/i);
  assert.doesNotMatch(rules, /traced/);
});

test('the AI gateway section states the design: every paid model call, the organization\'s own AI provider accounts, no other process holds a key, no vault or ticket detail', () => {
  const gateway = section(text, 'The AI gateway');
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
    ['acts', /\bacts?\b/],
    ['Intelligence', /\bIntelligence\b/],
  ]) assert.ok(firstUseLinked(pattern), term);
});

test('every link resolves, every glossary anchor exists, and Where to go next links its three pages and the glossary in order', () => {
  for (const link of linksOf(text)) {
    const [path, anchor] = link.split('#');
    const target = resolve(dirname(file), path);
    assert.ok(existsSync(target), link);
    if (anchor && path.endsWith('glossary.md')) {
      const terms = readFileSync(target, 'utf8').split('\n').filter((l) => l.startsWith('### '));
      assert.ok(terms.some((l) => l.slice(4).toLowerCase().replaceAll(' ', '-') === anchor), link);
    }
  }
  assert.deepEqual(linksOf(section(text, 'Where to go next')), [
    './one-access-model.md',
    './the-record-of-work.md',
    './how-work-moves-through-a-space.md',
    './glossary.md',
  ]);
});

test('the page names no master doc, implementation name, banned term, vendor, use case or audience', () => {
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|AI|INTELLIGENCE|APPS|GLOSSARY|README)\.md/);
  assert.doesNotMatch(plain, /AuthZEN|XACML|Zanzibar|JWKS|ai-gw-svc|AI_GW_SVC_APP_URL|logicalModel|nano-USD|usage_events|price_versions|Redis/);
  assert.doesNotMatch(plain, /operating system|resource pool|actor stamp|\bplane\b|\bstamp\b|black-box|immutably|eliminates|\bgrant\b/i);
  assert.doesNotMatch(plain, /\b(floor|primary metric|exact ROI|continuously|stated human baseline|conservative)\b/i);
  assert.doesNotMatch(plain, /\b(Hiring|SDR|CSR|Apollo|Exa|BrightData)\b/);
  assert.doesNotMatch(plain, /\b(support|sales|hiring)\b/i);
  assert.doesNotMatch(plain, /workspace/i);
  assert.doesNotMatch(plain.replace(/^#.*$/gm, ''), /(?<!Vector )\bSpace\b/);
  assert.doesNotMatch(plain, /\bwho it is for\b|\bfor organizations that\b/i);
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(plain, /TypeScript|Node|React/));

test('the page follows the voice checks and no sentence passes 25 words', () => {
  assert.deepEqual(voiceViolations(text), []);
  for (const sentence of plain.replace(/^#.*$/gm, '').split(/(?<=[.!?])\s+|\n/)) assert.ok(sentence.trim().split(/\s+/).length <= 25, sentence);
});

test('provenance names the master docs behind the page and gate row 7', () => {
  const provenance = readFileSync(resolve(root, '.agents/provenance.md'), 'utf8');
  const part = provenance.split(/^## /m).find((p) => p.startsWith('Why Vector Space\n')) ?? '';
  for (const source of ['product/OVERVIEW.md', 'systems/AI.md', 'systems/INTELLIGENCE.md', 'gate row 7']) assert.ok(part.includes(source), source);
});
