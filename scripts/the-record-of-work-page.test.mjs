import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bannedTermsIn, bodyOf, brokenLinks, linksOf, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/the-record-of-work.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text);
const prose = body.replace(/^import .*$/gm, '').replace(/<(?:FigurePlaceholder|StructureFigure)[^>]*\/>/g, '');
const plain = unlink(prose);
const slotsIn = (s) => [...s.matchAll(/<StructureFigure data=\{(\w+)\} \/>/g)].map((m) => m[1]);
const sentencesOf = (s) => s.split(/\n{2,}/).flatMap((p) => p.split(/(?<=[.!?])\s+/));

test('the page runs lead, the scene, five detail sections, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [
    "A member's outreach run",
    'The actor behind every record',
    'The four governance views',
    'Failure postures',
    'Spend as an estimate',
    'Acts and Human Time Return',
    'Where to go next',
  ]);
});

test('the lead says what the record is and links governance before the first H2', () => {
  const lead = body.split(/^## /m)[0];
  assert.match(lead, /who it ran as/);
  assert.match(lead, /\[Governance\]\(\.\/glossary\.md#governance\)/);
});

test('the scene is the first H2, with no Example heading and Acme wording, and an organization admin reads Activity', () => {
  assert.equal([...text.matchAll(/^## (.+)$/gm)][0][1], "A member's outreach run");
  assert.doesNotMatch(text, /^## .*\bExample\b/m);
  assert.doesNotMatch(plain, /\bthe sales space\b/i);
  assert.match(plain, /Acme's sales team has a space, and a member of it asks the orchestrator agent to find leads and send an outreach email/);
  const example = section(text, "A member's outreach run");
  assert.match(example, /\[orchestrator agent\]\(\.\/glossary\.md#orchestrator-agent\)/);
  assert.match(example, /outreach email/);
  assert.match(example, /\[organization admin\]\(\.\/glossary\.md#organization-admin\)/);
  assert.match(example, /Activity/);
  assert.match(example, /who it ran as/);
});

test('the actor section defines an execution, then lists its actor and what started it', () => {
  const actor = section(text, 'The actor behind every record');
  assert.match(actor, /\n\nAn \[execution\]\(\.\/glossary\.md#execution\) is one unit of work/);
  assert.deepEqual([...actor.matchAll(/^- \*\*(.+?)\*\*: /gm)].map((m) => unlink(m[1])), ['Actor', 'What started it']);
  assert.match(actor, /\*\*\[Actor\]\(\.\/glossary\.md#actor\)\*\*: who performed the action, either a user, a \[service account\]\(\.\/glossary\.md#service-account\), \[staff\]\(\.\/glossary\.md#staff\), an app or the platform\./);
  assert.match(actor, /Each execution has one actor/);
  assert.match(actor, /\[schedule\]\(\.\/glossary\.md#schedule\) is not an actor/);
});

test('the four governance views are each named and linked, with who reads them', () => {
  const views = section(text, 'The four governance views');
  for (const view of ['Overview', 'Health', 'Activity', 'Audit']) {
    assert.match(views, new RegExp(`\\[${view}\\]\\(\\./glossary\\.md#${view.toLowerCase()}\\)`), view);
  }
  assert.match(views, /organization admin/);
  assert.match(views, /space manager/);
  assert.match(views, /never as zero/);
  assert.doesNotMatch(views, /Intelligence/, 'Intelligence is not a fifth view');
});

test('the slot record-of-work appears once, in "The four governance views"', () => {
  assert.deepEqual(slotsIn(text), ['recordOfWork']);
  assert.deepEqual(slotsIn(section(text, 'The four governance views')), ['recordOfWork']);
});

test('failure postures are a bold-term list: change records fail closed, spend records and the cap fail open, acts are attested', () => {
  assert.equal((text.match(/^\| ?-{3}/gm) ?? []).length, 0, 'tables');
  const posture = section(text, 'Failure postures');
  const items = [...posture.matchAll(/^- \*\*(.+?)\*\*: (.+)$/gm)].map((m) => [unlink(m[1]), m[2]]);
  assert.deepEqual(items.map((i) => i[0]), ['Change records', 'Spend records', 'Spend cap', 'Acts']);
  assert.deepEqual(items.map((i) => /^fails? closed/.test(i[1])), [true, false, false, false]);
  assert.ok(items.slice(1, 3).every((i) => /^fails? open/.test(i[1])));
  assert.match(items[3][1], /^attested/);
});

test('the text names each kind of record without an umbrella noun', () => {
  for (const name of ['change records', 'spend records', 'spend cap', 'acts']) assert.match(plain, new RegExp(name, 'i'), name);
  assert.doesNotMatch(plain, /(kinds?|types?|sorts?) of (record|data)|record (kinds?|types?)/i);
});

test('spend is an estimate at list price with a rate card, and the unpriced count shows beside it', () => {
  const spend = section(text, 'Spend as an estimate');
  assert.match(spend, /estimate/);
  assert.match(spend, /list price/);
  assert.match(spend, /\[rate card\]\(\.\/glossary\.md#rate-card\)/);
  assert.match(spend, /invoice/);
  assert.match(spend, /never (shown )?as free/);
});

test('the spend cap is read by the organization and set by staff, and its refusal is one cuttable sentence', () => {
  const spend = section(text, 'Spend as an estimate');
  assert.match(spend, /\[spend cap\]\(\.\/glossary\.md#spend-cap\)/);
  assert.match(spend, /organization reads/);
  assert.match(spend, /staff set/i);
  const refusals = sentencesOf(spend).filter((s) => /refus/i.test(s));
  assert.equal(refusals.length, 1);
  assert.match(refusals[0], /cap/);
  const paragraph = spend.split(/\n{2,}/).find((p) => p.includes(refusals[0]));
  assert.ok(paragraph.trim().endsWith(refusals[0].trim()), 'the refusal sentence ends its paragraph');
  assert.doesNotMatch(text.replace(spend, ''), /refus/i);
});

test('acts: admitted and attested by the platform, Human Time Return an estimate in seconds that points to Why Vector Space for its parts', () => {
  const acts = section(text, 'Acts and Human Time Return');
  assert.match(text, /\[Acts\]\(\.\.\/vector-apps\/glossary\.md#acts\)/);
  assert.match(acts, /An act is one thing that an app did/);
  assert.match(acts, /\[Human Time Return\]\(\.\/glossary\.md#human-time-return\)/);
  assert.match(acts, /\[Intelligence\]\(\.\/glossary\.md#intelligence\)/);
  assert.match(acts, /\]\(\.\/why-vector-space\.md#human-time-return\)/);
  assert.match(acts, /counted in seconds/);
  assert.match(acts, /estimate/);
  assert.match(acts, /apart from spend/);
  assert.match(acts, /computes no return figure/);
});

test('every link resolves, every glossary anchor exists, and Where to go next links its two pages and the glossary', () => {
  assert.deepEqual(brokenLinks(text, file), []);
  assert.deepEqual(linksOf(section(text, 'Where to go next')), ['./why-vector-space.md', './approvals-and-the-command-center.md', './glossary.md']);
});

test('the page leaves out replay, retention, the gateway and any number of days or months', () => {
  assert.doesNotMatch(prose, /replay|retention|retain|swept|age out|gateway/i);
  assert.doesNotMatch(prose, /\b\d+\s+(days?|months?|hours?)\b/i);
});

test('the page names no master doc, implementation name, banned term, vendor or use case', () => {
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|SURFACE|INTELLIGENCE|METERING|LIMITS|AUDIT|README)\.md/);
  assert.deepEqual(bannedTermsIn(prose), []);
  assert.doesNotMatch(prose, /\bstamp\b/i);
  assert.doesNotMatch(prose, /\b(floor|primary metric|exact ROI|ROI|continuously|stated human baseline)\b/i);
  assert.doesNotMatch(prose, /actorRef|usage_events|audit\.events|htrSeconds|billing|nano-USD|SHADOW|ENFORCE/);
  assert.doesNotMatch(prose, /\b(Apollo|Exa|BrightData|Hiring|SDR|CSR)\b/);
  assert.doesNotMatch(prose, /\b(support|hiring)\b|\bsales\b(?! team)/i);
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(prose, /TypeScript|Node|React/));

test('the page follows the voice checks and uses no em dash', () => {
  assert.deepEqual(voiceViolations(text), []);
  assert.doesNotMatch(prose, /—/);
});
