import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bannedTermsIn, bodyOf, brokenLinks, linksOf, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/approvals-and-the-command-center.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text);
const prose = body.replace(/^import .*$/gm, '').replace(/<(?:FigurePlaceholder|FlowFigure)[^>]*\/>/g, '');
const plain = unlink(prose);
const slotsIn = (s) => [...s.matchAll(/<FigurePlaceholder slot="([^"]+)" \/>|<FlowFigure data=\{approvalsFlow\} \/>/g)].map((m) => m[1] ?? 'approvals-flow');

test('the page runs lead, the scene, four detail sections, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [
    'A status note that waits for approval',
    'The ask and who decides it',
    'After a decision',
    'Standing approvals',
    'Schedules',
    'Where to go next',
  ]);
});

test('the lead defines an ask and the Command Center, with glossary links, before the first H2', () => {
  const lead = body.split(/^## /m)[0];
  assert.match(lead, /\[ask\]\(\.\/glossary\.md#ask\) is anything that an agent or an app waits on a person for/);
  assert.match(lead, /\[Command Center\]\(\.\/glossary\.md#command-center\) is the part of a \[space\]\(\.\/glossary\.md#space\)/);
  assert.match(lead, /\[standing approvals\]\(\.\/glossary\.md#standing-approval\)/);
  assert.match(lead, /\[schedules\]\(\.\/glossary\.md#schedule\)/);
});

test('the scene is the first H2, with no Example heading and Acme wording, a post to a team chat that raises an ask, then an always-allow', () => {
  assert.equal([...text.matchAll(/^## (.+)$/gm)][0][1], 'A status note that waits for approval');
  assert.doesNotMatch(text, /^## .*\bExample\b/m);
  assert.doesNotMatch(plain, /\bthe sales space\b/i);
  assert.match(plain, /Acme's sales team has a space, and a member of it asks the orchestrator agent to post a status note to the team chat/);
  const scene = section(text, 'A status note that waits for approval');
  assert.match(scene, /team chat/);
  assert.match(scene, /\[connector\]\(\.\/glossary\.md#connector\)/);
  assert.match(scene, /\[orchestrator agent\]\(\.\/glossary\.md#orchestrator-agent\)/);
  assert.match(scene, /an ask appears in the Command Center/);
  assert.match(scene, /always allow/);
  assert.doesNotMatch(scene, /email|outreach|lead/i, 'the worked example owns the email');
});

test('the slot approvals-flow appears once, in "The ask and who decides it"', () => {
  assert.deepEqual(slotsIn(text), ['approvals-flow']);
  assert.deepEqual(slotsIn(section(text, 'The ask and who decides it')), ['approvals-flow']);
});

test('the ask section says what raises an ask, who decides, and that the Command Center is not a Vector Module', () => {
  const ask = section(text, 'The ask and who decides it');
  assert.match(ask, /not a \[Vector Module\]\(\.\/glossary\.md#vector-module\)/);
  assert.match(ask, /writes/);
  assert.match(ask, /\n\nEach ask goes to its answerer, the person who answers for the run:/);
  assert.deepEqual([...ask.matchAll(/^- \*\*(.+?)\*\*: /gm)].map((m) => unlink(m[1])), ['Member', 'Service account', 'App']);
  assert.match(ask, /\*\*\[Service account\]\(\.\/glossary\.md#service-account\)\*\*: cannot decide\. The owner of its key answers/);
  assert.match(ask, /\[space managers?\]\(\.\/glossary\.md#space-manager\)/);
  assert.match(ask, /leaves a space stops seeing and deciding its asks/);
});

test('after a decision the run resumes as its own actor and the decision is a second check', () => {
  const after = section(text, 'After a decision');
  assert.match(after, /second check, never extra access/);
  assert.deepEqual([...after.matchAll(/^- \*\*(.+?)\*\*: /gm)].map((m) => unlink(m[1])), ['Approved', 'Rejected', 'A new message in the thread', "An app's ask"]);
  assert.match(after, /\*\*Approved\*\*: the run continues as its own \[actor\]\(\.\/glossary\.md#actor\)/);
  assert.match(after, /never reaches the run/);
  assert.match(after, /pauses no run/);
});

test('a standing approval names its context, comes in two kinds and stays until someone revokes it', () => {
  const standing = section(text, 'Standing approvals');
  assert.match(standing, /always allow/);
  assert.match(standing, /context/);
  assert.match(standing, /personal/i);
  assert.match(standing, /space-wide/);
  assert.match(standing, /space manager can set one/);
  assert.match(standing, /stays until someone revokes it/);
  assert.match(standing, /space manager revokes any in the space/);
  assert.doesNotMatch(standing, /expir|time limit|lifetime/i);
});

test('a schedule is a background task on a timer that runs as one identity and stops at an ask', () => {
  const schedules = section(text, 'Schedules');
  assert.match(schedules, /background task/);
  assert.match(schedules, /timer/);
  assert.match(schedules, /service account/);
  assert.doesNotMatch(schedules, /skipped/);
  assert.match(schedules, /always allow/);
  assert.match(schedules, /only the owner edits, pauses, runs or deletes a schedule/);
});

test('every link resolves, every glossary anchor exists, and Where to go next links its two pages and the glossary', () => {
  assert.deepEqual(brokenLinks(text, file), []);
  assert.deepEqual(linksOf(section(text, 'Where to go next')), ['./how-work-moves-through-a-space.md', './the-record-of-work.md', './glossary.md']);
});

test('the page leaves out actor-only powers, polling, simultaneous decisions and any number of retention or skipped fires', () => {
  assert.doesNotMatch(prose, /polling|poll\b|retention|retain|swept|expire|expiry|abandon/i);
  assert.doesNotMatch(prose, /\barguments\b|edit(s|ing)? a call|simultaneous|at the same time|race/i);
  assert.doesNotMatch(prose, /\b\d+\s+(days?|months?|hours?|minutes?|fires?|runs?|asks?)\b/i);
  assert.doesNotMatch(prose, /\b(once|twice|three|ten)\s+(skipped|consecutive|fires?)\b/i);
});

test('the page names no master doc, implementation name, banned term, vendor or use case', () => {
  assert.doesNotMatch(text, /(COMMAND-CENTER|PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|SURFACE|INTELLIGENCE|README)\.md/);
  assert.doesNotMatch(prose, /LangGraph|interrupt|runs\.asks|AskProjectionService|moduleExecute|connectorExecute|actorRef|space#manage_approvals|approvalDefault|approvalRequired|events plane|outbox|private_key_jwt/);
  assert.deepEqual(bannedTermsIn(prose), []);
  assert.doesNotMatch(prose, /\b(Apollo|Exa|BrightData|Hiring|SDR|CSR|Slack)\b/);
  assert.doesNotMatch(prose, /\b(support|hiring)\b/i);
  assert.doesNotMatch(prose, /\bsales\b(?! team)/i);
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(prose, /TypeScript|Node|React/));

test('the page follows the voice checks and has no em dash', () => {
  assert.deepEqual(voiceViolations(text), []);
  assert.doesNotMatch(prose, /—/);
});
