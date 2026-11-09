import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/how-work-moves-through-a-space.md');
const text = readFileSync(file, 'utf8');
const body = text.replace(/^---\n[\s\S]*?\n---\n/, '');
const prose = body.replace(/^import .*$/gm, '').replace(/<(?:FigurePlaceholder|FlowFigure)[^>]*\/>/g, '');
const plain = prose.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
const slotsIn = (s) => [...s.matchAll(/<FigurePlaceholder slot="([^"]+)" \/>|<FlowFigure data=\{workedExampleFlow\} \/>/g)].map((m) => m[1] ?? 'worked-example-flow');
const rowsOf = (s) => s.split('\n').filter((l) => /^\|/.test(l) && !/^\| ?-{3}/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
const unlink = (s) => s.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

test('the H2s follow the steps and there is no Example H2', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [
    'Lead and figure',
    'The request',
    'Leads found, qualified and saved',
    'The draft',
    'The pause for approval',
    'The send',
    'The record of work',
    'Where to go next',
  ]);
  assert.doesNotMatch(text, /^#+ .*Example/m);
});

test('the slot worked-example-flow appears once, in "Lead and figure"', () => {
  assert.deepEqual(slotsIn(text), ['worked-example-flow']);
  assert.deepEqual(slotsIn(section(text, 'Lead and figure')), ['worked-example-flow']);
});

test('the lead lays out the scenario and says the app is only an example, without the animation', () => {
  const lead = section(text, 'Lead and figure');
  assert.match(lead, /\[member\]\(\.\/glossary\.md#member\)/);
  assert.match(lead, /\[orchestrator agent\]\(\.\/glossary\.md#orchestrator-agent\)/);
  assert.match(lead, /outreach email/);
  assert.match(lead, /\[Vector App\]\(\.\.\/vector-apps\/glossary\.md#app\), a web app that a space shows in an iframe/);
  assert.match(lead, /only an example/);
  assert.doesNotMatch(plain, /\b(animation|animated|figure above|the diagram shows)\b/i);
});

test('step 1: a read action of the app, so no ask, and access is checked as the member', () => {
  const step = section(text, 'The request');
  assert.match(step, /read action/);
  assert.match(step, /no \[ask\]\(\.\/glossary\.md#ask\)/);
  assert.match(step, /as the member/);
  assert.match(step, /\[thread\]\(\.\/glossary\.md#thread\)/);
});

test('steps 2 and 3: Connectors with three services, "lead qualified" as an act, each lead saved as a contact', () => {
  const step = section(text, 'Leads found, qualified and saved');
  assert.match(step, /\[Connectors\]\(\.\/glossary\.md#connector\)/);
  for (const vendor of ['Apollo', 'Exa', 'BrightData']) assert.match(step, new RegExp(`\\b${vendor}\\b`), vendor);
  assert.match(step, /\[act\]\(\.\.\/vector-apps\/glossary\.md#acts\)/);
  assert.match(step, /lead qualified/);
  assert.match(step, /saves each lead as a contact/);
  assert.match(step, /\[Vector Module\]\(\.\/glossary\.md#vector-module\)/);
});

test('step 4: the model call goes through the AI gateway', () => {
  assert.match(section(text, 'The draft'), /\[AI gateway\]\(\.\/glossary\.md#ai-gateway\)/);
});

test('step 5: sending raises an ask in the Command Center and the asking member decides, then the run resumes as that member', () => {
  const step = section(text, 'The pause for approval');
  assert.match(step, /write/);
  assert.match(step, /\[ask\]|an ask/);
  assert.match(step, /\[Command Center\]\(\.\/glossary\.md#command-center\)/);
  assert.match(step, /member who asked decides/);
  assert.match(step, /resumes as that same member/);
  assert.deepEqual(linksOf(step).filter((l) => l.endsWith('.md')), ['./approvals-and-the-command-center.md']);
});

test('step 6: the email goes out through the Omnibox and the app records no act', () => {
  const step = section(text, 'The send');
  assert.match(step, /Omnibox/);
  assert.match(step, /The app records no act/);
  assert.doesNotMatch(plain, /outreach sent/i);
});

test('the record of work is one table with the actor per step: Member for 1, 4, 5 and 6, App for 2 and 3', () => {
  assert.equal((text.match(/^\| ?-{3}/gm) ?? []).length, 1, 'tables');
  const rows = rowsOf(section(text, 'The record of work'));
  assert.deepEqual(rows[0], ['Step', 'What happens', 'Actor']);
  assert.deepEqual(rows.slice(1).map((r) => r[0]), ['1', '2', '3', '4', '5', '6']);
  assert.deepEqual(rows.slice(1).map((r) => r[2]), ['Member', 'App', 'App', 'Member', 'Member', 'Member']);
  for (const cell of rows.flat()) assert.ok(unlink(cell).split(/\s+/).length <= 15, cell);
});

test('the record section says the agent is not an actor and links the record-of-work page', () => {
  const record = section(text, 'The record of work');
  assert.match(record, /orchestrator agent is not an actor/);
  assert.match(record, /\[execution\]\(\.\/glossary\.md#execution\), which is who it ran as\. An execution is one unit of work/);
  assert.match(record, /\[actor\]\(\.\/glossary\.md#actor\)/);
  assert.match(record, /\(\.\/the-record-of-work\.md\)/);
});

test('the page does not say that each further lead raises an ask, and does not name Can edit', () => {
  assert.doesNotMatch(plain, /each (further|other|more|next) lead|every (further|other|more|next) lead/i);
  assert.doesNotMatch(plain, /Can edit|Can use/);
});

test('Connectors is the box name, and the three vendors appear on no other page of the section', () => {
  assert.doesNotMatch(plain, /Lead services/i);
  for (const name of readdirSync(resolve(docs, 'vector-space')).filter((n) => n.endsWith('.md') && n !== 'how-work-moves-through-a-space.md')) {
    assert.doesNotMatch(readFileSync(resolve(docs, 'vector-space', name), 'utf8'), /\b(Apollo|Exa|BrightData)\b/, name);
  }
});

test('Where to go next links the approvals, extending and record pages, then the glossary', () => {
  assert.deepEqual(linksOf(section(text, 'Where to go next')), ['./approvals-and-the-command-center.md', './extending-a-space.md', './the-record-of-work.md', './glossary.md']);
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

test('the page names no master doc, implementation name, banned term or use case', () => {
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|SURFACE|INTELLIGENCE|METERING|LIMITS|AUDIT|README|COMMAND-CENTER|MODULES|CALLS)\.md/);
  assert.doesNotMatch(prose, /AuthZEN|XACML|Zanzibar|Yjs|operating system|resource pool|actor stamp|\bstamp\b|\bplane\b|black-box|immutabl|\bgrant\b/i);
  assert.doesNotMatch(prose, /\b(floor|primary metric|exact ROI|ROI|continuously|stated human baseline)\b/i);
  assert.doesNotMatch(prose, /LangGraph|interrupt|actorRef|ModuleKey|approvalDefault|approvalRequired|outbox|private_key_jwt|vector-flows|RedemptAI/);
  assert.doesNotMatch(prose, /\b(Hiring|SDR|CSR)\b/);
  assert.doesNotMatch(prose, /\b(support|sales|hiring)\b/i);
  assert.doesNotMatch(prose, /(?<!Vector )\bSpace\b/);
});

const { workedExampleFlow } = await import('../src/diagrams/figures/worked-example-flow.ts');
const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
const slugOf = (heading) => heading.toLowerCase().replace(/[^a-z0-9 ]/g, '').replace(/ /g, '-');

test('each step of the figure links to the H2 that names that step', () => {
  assert.equal(workedExampleFlow.steps.length, 6);
  for (const [i, step] of workedExampleFlow.steps.entries()) {
    const heading = headings.find((h) => `#${slugOf(h)}` === step.href);
    assert.ok(heading, `step ${i + 1} links to ${step.href}`);
    assert.match(section(text, heading), new RegExp(`^Steps? [\\d and]*\\b${i + 1}\\b`, 'm'), `the section opens with step ${i + 1}`);
  }
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(prose, /TypeScript|Node|React/));

test('the page follows the voice checks and no sentence passes 25 words', () => {
  assert.deepEqual(voiceViolations(text), []);
  for (const sentence of plain.replace(/^#.*$/gm, '').replace(/^\|.*$/gm, '').split(/(?<=[.!?])\s+/)) assert.ok(sentence.trim().split(/\s+/).length <= 25, sentence);
});
