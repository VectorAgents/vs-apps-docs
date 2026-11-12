import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bannedTermsIn, bodyOf, brokenLinks, linksOf, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/how-work-moves-through-a-space.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text);
const prose = body.replace(/^import .*$/gm, '').replace(/<(?:FigurePlaceholder|FlowFigure)[^>]*\/>/g, '');
const plain = unlink(prose);
const slotsIn = (s) => [...s.matchAll(/<FigurePlaceholder slot="([^"]+)" \/>|<FlowFigure data=\{workedExampleFlow\} \/>/g)].map((m) => m[1] ?? 'worked-example-flow');

test('the page runs the scene, the six steps, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), ["A member's outreach request", 'The six steps', 'Where to go next']);
  assert.doesNotMatch(text, /^#+ .*Example/m);
  assert.doesNotMatch(text, /^## (The request|The draft|The send|The pause for approval)$/m);
});

test('the slot worked-example-flow appears once, in the scene', () => {
  assert.deepEqual(slotsIn(text), ['worked-example-flow']);
  assert.deepEqual(slotsIn(section(text, "A member's outreach request")), ['worked-example-flow']);
});

test('the scene opens with Acme, lays out the request and says the app is only an example, without the animation', () => {
  const scene = section(text, "A member's outreach request");
  assert.doesNotMatch(plain, /\bthe sales space\b/i);
  assert.match(scene, /\n\nAcme's sales team has a space, and a \[member\]\(\.\/glossary\.md#member\) of it asks the \[orchestrator agent\]\(\.\/glossary\.md#orchestrator-agent\) to find leads and send an outreach email/);
  assert.match(scene, /\[Vector App\]\(\.\.\/vector-apps\/glossary\.md#app\), a web app that a space shows in an iframe/);
  assert.match(scene, /only an example/);
  assert.doesNotMatch(plain, /\b(animation|animated|figure above|the diagram shows)\b/i);
});

const steps = section(text, 'The six steps');
const items = [...steps.matchAll(/^(\d)\. \*\*(.+?)\*\*: (.+)$/gm)].map((m) => ({ n: Number(m[1]), term: unlink(m[2]), body: m[3] }));

test('the six steps are one numbered list of bold terms, each ending with its actor: member for 1, 4, 5 and 6, app for 2 and 3', () => {
  assert.match(steps, /\n\nEach step ends with its \[actor\]\(\.\/glossary\.md#actor\), the identity that it ran as\. The orchestrator agent is not an actor: its steps run as the member\.\n\n1\. /);
  assert.deepEqual(items.map((i) => i.n), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(items.map((i) => i.term), ['Request', 'Find and qualify', 'Save', 'Draft', 'Approve', 'Send']);
  assert.deepEqual(items.map((i) => i.body.match(/ Actor: (\w+)\.$/)?.[1]), ['member', 'app', 'app', 'member', 'member', 'member']);
  assert.equal((text.match(/^\| ?-{3}/gm) ?? []).length, 0, 'tables');
});

test('step 1: a read action of the app, so no ask, and access is checked as the member', () => {
  const step = items[0].body;
  assert.match(step, /read action/);
  assert.match(step, /no \[ask\]\(\.\/glossary\.md#ask\)/);
  assert.match(step, /works as the member/);
  assert.match(step, /reaches the app only if the member reaches it/);
  assert.match(step, /\[thread\]\(\.\/glossary\.md#thread\)/);
});

test('steps 2 and 3: Connectors with three services, "lead qualified" as an act, each lead saved as a contact', () => {
  const find = items[1].body;
  assert.match(find, /\[Connectors\]\(\.\/glossary\.md#connector\)/);
  for (const vendor of ['Apollo', 'Exa', 'BrightData']) assert.match(find, new RegExp(`\\b${vendor}\\b`), vendor);
  assert.match(find, /\[act\]\(\.\.\/vector-apps\/glossary\.md#acts\)/);
  assert.match(find, /lead qualified/);
  assert.match(find, /The platform records each connector call\./);
  const save = items[2].body;
  assert.match(save, /saves each lead as a contact/);
  assert.match(save, /\[Vector Module\]\(\.\/glossary\.md#vector-module\)/);
  assert.match(save, /leads stay in the space/);
});

test('step 4: the model call goes through the AI gateway', () => {
  assert.match(items[3].body, /\[AI gateway\]\(\.\/glossary\.md#ai-gateway\), the one route for every paid model call/);
});

test('step 5: sending raises an ask in the Command Center and the asking member decides, then the run resumes as that member', () => {
  const step = items[4].body;
  assert.match(step, /Omnibox is a Vector Module for the space's mail and LinkedIn conversations/);
  assert.match(step, /sends through the Omnibox need approval by default/);
  assert.match(step, /write/);
  assert.match(step, /an ask appears in the \[Command Center\]\(\.\/glossary\.md#command-center\)/);
  assert.match(step, /member who asked decides/);
  assert.match(step, /resumes as that same member/);
  assert.doesNotMatch(step, /second check/, 'the approvals page owns it');
});

test('step 6: the email goes out through the Omnibox and the app records no act', () => {
  assert.match(items[5].body, /Omnibox/);
  assert.match(items[5].body, /The app records no act for the send/);
  assert.doesNotMatch(plain, /outreach sent/i);
});

test('the page does not say that each further lead raises an ask, and does not name Can edit', () => {
  assert.doesNotMatch(plain, /each (further|other|more|next) lead|every (further|other|more|next) lead/i);
  assert.doesNotMatch(plain, /Can edit|Can use/);
});

test('Connectors is the box name, and the three vendors appear on no other page of the section but the glossary', () => {
  assert.doesNotMatch(plain, /Lead services/i);
  for (const name of readdirSync(resolve(docs, 'vector-space')).filter((n) => n.endsWith('.md') && !['how-work-moves-through-a-space.md', 'glossary.md'].includes(n))) {
    assert.doesNotMatch(readFileSync(resolve(docs, 'vector-space', name), 'utf8'), /\b(Apollo|Exa|BrightData)\b/, name);
  }
});

test('Where to go next links the approvals, extending and record pages, then the glossary, each with a noun phrase', () => {
  assert.deepEqual(linksOf(section(text, 'Where to go next')), ['./approvals-and-the-command-center.md', './extending-a-space.md', './the-record-of-work.md', './glossary.md']);
  for (const [, line] of section(text, 'Where to go next').matchAll(/^- \[.+?\]\(.+?\): (.+)$/gm)) assert.doesNotMatch(line, /^(read|see|look|learn|find)\b/i, line);
});

test('Where to go next calls the three things a space can call extensions, not kinds', () => {
  assert.match(section(text, 'Where to go next'), /the three extensions that a space can call/);
  assert.doesNotMatch(plain, /kinds? of extension/i);
});

test('every link resolves and every glossary anchor exists', () => {
  assert.deepEqual(brokenLinks(text, file), []);
});

test('the page names no master doc, implementation name, banned term or use case', () => {
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|SURFACE|INTELLIGENCE|METERING|LIMITS|AUDIT|README|COMMAND-CENTER|MODULES|CALLS)\.md/);
  assert.deepEqual(bannedTermsIn(prose), []);
  assert.doesNotMatch(prose, /\bstamp\b/i);
  assert.doesNotMatch(prose, /\b(floor|primary metric|exact ROI|ROI|continuously|stated human baseline)\b/i);
  assert.doesNotMatch(prose, /LangGraph|interrupt|actorRef|ModuleKey|approvalDefault|approvalRequired|outbox|private_key_jwt|vector-flows|RedemptAI/);
  assert.doesNotMatch(prose, /\b(Hiring|SDR|CSR)\b/);
  assert.doesNotMatch(prose, /\b(support|hiring)\b/i);
  assert.doesNotMatch(prose, /\bsales\b(?! team)/i);
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(prose, /TypeScript|Node|React/));

test('the page follows the voice checks and has no em dash', () => {
  assert.deepEqual(voiceViolations(text), []);
  assert.doesNotMatch(prose, /—/);
});
