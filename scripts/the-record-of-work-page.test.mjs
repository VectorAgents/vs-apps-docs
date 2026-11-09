import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/the-record-of-work.md');
const text = readFileSync(file, 'utf8');
const body = text.replace(/^---\n[\s\S]*?\n---\n/, '');
const prose = body.replace(/^import .*$/gm, '').replace(/<(?:FigurePlaceholder|StructureFigure)[^>]*\/>/g, '');
const plain = prose.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
const slotsIn = (s) => [...s.matchAll(/<StructureFigure data=\{(\w+)\} \/>/g)].map((m) => m[1]);
const sentencesOf = (s) => s.split(/\n{2,}/).flatMap((p) => p.split(/(?<=[.!?])\s+/));
const rowsOf = (s) => s.split('\n').filter((l) => /^\|/.test(l) && !/^\| ?-{3}/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));

test('the page runs lead, Example, five detail sections, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [
    'Example',
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

test('the example is the member, the orchestrator agent and an Organization admin reading Activity', () => {
  const example = section(text, 'Example');
  assert.match(example, /\[orchestrator agent\]\(\.\/glossary\.md#orchestrator-agent\)/);
  assert.match(example, /outreach email/);
  assert.match(example, /\[Organization admin\]\(\.\/glossary\.md#organization-admin\)/);
  assert.match(example, /Activity/);
  assert.match(example, /who it ran as/);
});

test('the actor section keeps "actor" with one defining clause', () => {
  const actor = section(text, 'The actor behind every record');
  assert.match(actor, /An \[actor\]\(\.\/glossary\.md#actor\) is who performed one action: a user, a \[service account\]\(\.\/glossary\.md#service-account\), \[staff\]\(\.\/glossary\.md#staff\), an app or the platform\./);
  assert.match(actor, /Every \[execution\]\(\.\/glossary\.md#execution\) has one actor/);
  assert.match(actor, /what started it/i);
});

test('the four governance views are each named and linked, with who reads them', () => {
  const views = section(text, 'The four governance views');
  for (const view of ['Overview', 'Health', 'Activity', 'Audit']) {
    assert.match(views, new RegExp(`\\[${view}\\]\\(\\./glossary\\.md#${view.toLowerCase()}\\)`), view);
  }
  assert.match(views, /Organization admin/);
  assert.match(views, /space manager/);
  assert.match(views, /never as zero/);
  assert.doesNotMatch(views, /Intelligence/, 'Intelligence is not a fifth view');
});

test('the slot record-of-work appears once, in "The four governance views"', () => {
  assert.deepEqual(slotsIn(text), ['recordOfWork']);
  assert.deepEqual(slotsIn(section(text, 'The four governance views')), ['recordOfWork']);
});

test('failure postures are one 4-row table: audit fails closed, the rest do not', () => {
  assert.equal((text.match(/^\| ?-{3}/gm) ?? []).length, 1, 'tables');
  const rows = rowsOf(section(text, 'Failure postures'));
  assert.equal(rows.length, 5, 'header and 4 rows');
  const [, ...data] = rows;
  assert.deepEqual(data.map((r) => r[0].replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')), ['Change records', 'Spend records', 'Spend cap', 'Acts']);
  assert.deepEqual(data.map((r) => /closed/.test(r[1])), [true, false, false, false]);
  assert.ok(data.slice(1, 3).every((r) => /open/.test(r[1])));
  for (const cell of rows.flat()) assert.ok(cell.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1').split(/\s+/).length <= 15, cell);
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

test('acts: admitted and attested by the platform, baseline seconds approved by staff, Human Time Return an estimate in seconds', () => {
  const acts = section(text, 'Acts and Human Time Return');
  assert.match(text, /\[Acts\]\(\.\.\/vector-apps\/glossary\.md#acts\)/);
  assert.match(acts, /An act is one thing that an app did/);
  assert.match(acts, /\[Human Time Return\]\(\.\/glossary\.md#human-time-return\)/);
  assert.match(acts, /\[Intelligence\]\(\.\/glossary\.md#intelligence\)/);
  assert.match(acts, /Staff approve the seconds/);
  assert.match(acts, /successful acts/);
  assert.match(acts, /estimate/);
  assert.match(acts, /apart from spend/);
  assert.match(acts, /computes no return figure/);
});

test('every link resolves, every glossary anchor exists, and Where to go next links its two pages and the glossary', () => {
  for (const link of linksOf(text)) {
    const [path, anchor] = link.split('#');
    assert.ok(existsSync(resolve(dirname(file), path)), link);
    if (anchor && path.endsWith('glossary.md')) {
      const terms = readFileSync(resolve(dirname(file), path), 'utf8').split('\n').filter((l) => l.startsWith('### '));
      assert.ok(terms.some((l) => l.slice(4).toLowerCase().replaceAll(' ', '-') === anchor), link);
    }
  }
  assert.deepEqual(linksOf(section(text, 'Where to go next')), ['./why-vector-space.md', './approvals-and-the-command-center.md', './glossary.md']);
});

test('the page leaves out replay, retention, the gateway and any number of days or months', () => {
  assert.doesNotMatch(prose, /replay|retention|retain|swept|age out|gateway/i);
  assert.doesNotMatch(prose, /\b\d+\s+(days?|months?|hours?)\b/i);
});

test('the page names no master doc, implementation name, banned term, vendor or use case', () => {
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|SURFACE|INTELLIGENCE|METERING|LIMITS|AUDIT|README)\.md/);
  assert.doesNotMatch(prose, /AuthZEN|Yjs|operating system|resource pool|actor stamp|\bstamp\b|\bplane\b|black-box|immutabl|\bgrant\b/i);
  assert.doesNotMatch(prose, /\b(floor|primary metric|exact ROI|ROI|continuously|stated human baseline)\b/i);
  assert.doesNotMatch(prose, /actorRef|usage_events|audit\.events|htrSeconds|billing|nano-USD|SHADOW|ENFORCE/);
  assert.doesNotMatch(prose, /\b(Apollo|Exa|BrightData|Hiring|SDR|CSR)\b/);
  assert.doesNotMatch(prose, /\b(support|sales|hiring)\b/i);
  assert.doesNotMatch(prose, /(?<!Vector )\bSpace\b/);
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(prose, /TypeScript|Node|React/));

test('the page follows the voice checks and no sentence passes 25 words', () => {
  assert.deepEqual(voiceViolations(text), []);
  for (const sentence of plain.replace(/^#.*$/gm, '').replace(/^\|.*$/gm, '').split(/(?<=[.!?])\s+/)) assert.ok(sentence.trim().split(/\s+/).length <= 25, sentence);
});
