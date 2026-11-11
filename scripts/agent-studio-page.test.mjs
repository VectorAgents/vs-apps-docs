import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bannedTermsIn, bodyOf, brokenLinks, linksOf, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const { agentStudioAccess } = await import('../src/diagrams/figures/agent-studio-access.ts');
const { agentStudioLifecycle } = await import('../src/diagrams/figures/agent-studio-lifecycle.ts');

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/agent-studio.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text).replace(/^import .*$/gm, '').trim();
const prose = unlink(body.replace(/<(?:StructureFigure|FlowFigure)[^>]*\/>/g, ''));
const lead = body.split(/^## /m)[0];
const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

/** The page eases only the paragraph cap of the shared voice checks, from 5 to 7 sentences. */
const PARAGRAPH_MAX = 7;

test('the page runs lead, the scene, six detail H2s, Where to go next', () => {
  assert.deepEqual(headings, [
    'A support message in a space',
    'What Agent Studio is for',
    'How agents are arranged',
    'What a run may use',
    'The life of a change',
    'Skills, channels and approvals',
    'Use cases',
    'Where to go next',
  ]);
  assert.match(lead, /^\[Agent Studio\]\(\.\/glossary\.md#agent-studio\) is the part of Vector Space/);
  assert.doesNotMatch(text, /^#+ .*Example/m);
});

test('the figures sit one each in "How agents are arranged", "What a run may use" and "The life of a change"', () => {
  assert.equal(text.match(/<(?:StructureFigure|FlowFigure)\b/g)?.length, 3);
  assert.match(section(text, 'How agents are arranged'), /<StructureFigure data=\{agentStudioTree\} \/>/);
  assert.match(section(text, 'What a run may use'), /<FlowFigure data=\{agentStudioAccess\} \/>/);
  assert.match(section(text, 'The life of a change'), /<FlowFigure data=\{agentStudioLifecycle\} \/>/);
  assert.doesNotMatch(lead, /Figure/);
});

test('the scene is the support case: a linked chat, the orchestrator agent, a ticket classifier and a remote CRM agent', () => {
  const scene = section(text, 'A support message in a space');
  for (const word of ['linked chat', 'orchestrator agent', 'ticket-classifier agent', 'remote', 'A2A', 'CRM']) assert.ok(scene.includes(word), word);
  assert.match(scene, /customer relationship management \(CRM\)/);
  assert.doesNotMatch(prose, /WhatsApp|Messenger|Instagram|Telegram|Slack|Discord/);
});

test('the tree names no level number and says short-lived helper and child agent', () => {
  const tree = section(text, 'How agents are arranged');
  for (const part of ['orchestrator agent', 'child agents', 'A2A', 'short-lived helper', 'leaf']) assert.ok(tree.includes(part), part);
  assert.doesNotMatch(text, /\b(level|depth|tier)s?\b|\bLevel \d\b/i);
  assert.doesNotMatch(text, /\bsub-?agents?\b/i);
  assert.doesNotMatch(prose, /\bturns?\b/i);
});

test('the page names no code, master doc, vendor, formula or number of a cap', () => {
  const banned = [
    /\.md\b(?!\))/, /STUDIO/, /LangGraph|Langfuse|GenSQL/, /JWKS|AuthZEN/, /\bsealed\b/i, /ephemeral/i,
    /invokeAgent|spawnSubagent|spaceId|agentVersionId|UserType|@@@|useDraft/, /\bINTERNAL\b|\bEXTERNAL\b/,
    /temperature/i, /\bgateway\b(?!\]| )/i, /\brate (?:settling|limit)/i, /\bcaller\b/i, /\binbound\b/i, /\binstance\b/i,
    /workspace/i, /\bexactly\b/i, /\bcode name\b/i, /\bimmutable\b/i, /\bgrants?\b/i, /link code/i,
  ];
  const noLinks = body.replace(/\]\([^)]*\)/g, ']');
  for (const pattern of banned) assert.doesNotMatch(noLinks, pattern);
  assert.deepEqual(bannedTermsIn(noLinks), []);
  assert.doesNotMatch(noLinks, /\b(?:5|20|five|twenty) (?:concurrent|helpers|legs)/i);
  assert.doesNotMatch(noLinks, /[A-Za-z]+[A-Z][a-z]+\(|[a-z]+_[a-z]+/, 'no function or field name');
});

test('each term is linked at its first use', () => {
  const noDescription = body.replace(/^description:.*$/m, '').replace(/^#+ .*$/gm, '').replace(/Vector Space/g, 'VS');
  for (const [term, anchor] of [
    ['Agent Studio', 'agent-studio'], ['agents', 'agent'], ['space', 'space'], ['channel', 'channel'], ['linked chat', 'linked-chat'],
    ['orchestrator agent', 'orchestrator-agent'], ['A2A', 'a2a'], ['evaluation', 'evaluation'], ['Organization admin', 'organization-admin'],
    ['thread', 'thread'], ['agent card', 'agent-card'], ['member', 'member'], ['Datasource', 'datasource'], ['condition', 'condition'],
    ['Connector', 'connector'], ['run', 'run'], ['AI gateway', 'ai-gateway'], ['AI provider accounts', 'ai-provider-account'],
    ['Skills', 'skill'], ['Can use', 'can-use'], ['Can edit', 'can-edit'], ['service account', 'service-account'], ['ask', 'ask'],
    ['Command Center', 'command-center'], ['standing approval', 'standing-approval'],
  ]) {
    const first = new RegExp(`(?<![\\w-])${term}\\b`, 'i').exec(noDescription.replace(/\[([^\]]*)\]\([^)]*\)/g, (_, t) => `\u0000${t}`));
    assert.ok(first, term);
    const link = new RegExp(`\\[${term}\\]\\(\\./glossary\\.md#${anchor}\\)`, 'i');
    const firstLinked = link.exec(noDescription);
    assert.ok(firstLinked, `${term} is linked`);
    const bare = new RegExp(`(?<![\\w\\[-])${term}(?![\\w\\]])`, term.startsWith('Can') ? '' : 'i').exec(noDescription.slice(0, firstLinked.index));
    assert.equal(bare, null, `${term} has no bare use before its link`);
  }
});

test('version is defined in the lead and draft in What Agent Studio is for, where each first appears', () => {
  assert.match(lead, /set up, tested and published\./);
  assert.match(lead, /a version, a fixed copy of the settings of an agent/);
  assert.match(section(text, 'What Agent Studio is for'), /a draft, the working copy of the agents/);
});

test('the life of a change gives the edit, publish, reset and restore rules in plain words', () => {
  const life = section(text, 'The life of a change');
  assert.match(life, /Every edit writes to the draft/);
  assert.match(life, /nobody presses a save button/);
  assert.match(life, /\*\*Publish\*\*.*every agent in the tree.*one step/);
  assert.match(life, /\*\*Reset\*\*.*brings back a published agent.*never published/);
  assert.match(life, /\*\*Restore\*\*.*saves no version itself, and the next edit does/);
  assert.match(life, /keeps the version it started on/);
  assert.match(life, /Web chat, channels and calls from other agents run the published version/);
  assert.match(life, /correct, partly correct or wrong/);
  assert.match(life, /not part of a version/);
});

test('the access check says a scope only narrows, a new agent has no tools and the check uses the asking member', () => {
  const access = section(text, 'What a run may use');
  assert.match(access, /only what the member who asks may use/);
  assert.match(access, /narrow that set and never widen it/);
  assert.match(access, /starts with no tools and no knowledge/);
  assert.match(access, /does not filter the response/);
  assert.match(access, /fails closed/);
});

test('a channel runs as its owner or a service account, and group input is untrusted', () => {
  const features = section(text, 'Skills, channels and approvals');
  assert.match(features, /runs as the owner of the channel/);
  assert.match(features, /Changing this unlinks every chat/);
  assert.match(features, /Group input is untrusted/);
});

test('Who may change an agent names the Organization admin and no space manager', () => {
  assert.match(section(text, 'What Agent Studio is for'), /An \[Organization admin\]\(\.\/glossary\.md#organization-admin\) can configure, delete or reset an agent/);
  assert.doesNotMatch(prose, /space managers?/i);
});

test('the use cases are financial analysis and employee onboarding', () => {
  const cases = section(text, 'Use cases');
  assert.match(cases, /\*\*Financial analysis\.\*\*/);
  assert.match(cases, /\*\*Employee onboarding\.\*\*/);
  assert.match(cases, /service account/);
  assert.match(cases, /Google Drive folder/);
  assert.doesNotMatch(cases, /Vector App/);
});

test('every link resolves, and Where to go next has 3 links and the glossary in order', () => {
  assert.deepEqual(brokenLinks(text, file), []);
  assert.deepEqual(linksOf(section(text, 'Where to go next')), [
    './one-access-model.md', './approvals-and-the-command-center.md', './the-record-of-work.md', './glossary.md',
  ]);
});

test('the page follows the voice checks with a paragraph cap of 7 sentences, and has no em dash', () => {
  assert.deepEqual(voiceViolations(text).filter((v) => v.rule !== 'paragraph-length'), []);
  const long = voiceViolations(text).filter((v) => v.rule === 'paragraph-length');
  for (const { text: paragraph } of long) {
    const sentences = paragraph.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
    assert.ok(sentences.length <= PARAGRAPH_MAX, paragraph);
  }
  assert.doesNotMatch(prose, /—/);
});

test('every figure step links to a heading of the page', () => {
  const slugs = headings.map((h) => `#${h.toLowerCase().replace(/[^a-z0-9 -]/g, '').replace(/ /g, '-')}`);
  for (const figure of [agentStudioAccess, agentStudioLifecycle]) {
    for (const step of figure.steps) assert.ok(slugs.includes(step.href), step.href);
  }
});
