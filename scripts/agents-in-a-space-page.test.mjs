import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bannedTermsIn, bodyOf, brokenLinks, linksOf, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/agents-in-a-space.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text).replace(/^import .*$/gm, '').trim();
const prose = unlink(body.replace(/<(?:FigurePlaceholder|StructureFigure)[^>]*\/>/g, ''));
const lead = body.split(/^## /m)[0];

const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

test('the page runs lead, the scene, three detail H2s, Where to go next', () => {
  assert.deepEqual(headings, ['A lead search handed to two agents', 'Agents and the orchestrator agent', 'The agent tree', 'Threads and runs', 'Where to go next']);
  assert.ok(lead.includes('](./glossary.md#agent)'), 'the lead defines agent with a glossary link');
});

test('the scene is the first H2, names no Example and says Acme\'s sales team', () => {
  assert.equal(headings[0], 'A lead search handed to two agents');
  assert.doesNotMatch(text, /^#+ .*Example/m);
  assert.doesNotMatch(prose, /the sales space/i);
  assert.match(section(text, 'A lead search handed to two agents'), /\nAcme's sales team has a space/);
});

test('the figure slot appears once, inside "The agent tree"', () => {
  assert.equal(text.match(/<StructureFigure\b/g)?.length, 1);
  assert.match(section(text, 'The agent tree'), /<StructureFigure data=\{agentTree\} \/>/);
});

test('the tree is one orchestrator agent, agents for jobs with child agents, and two kinds of leaf, with no depth number', () => {
  const tree = section(text, 'The agent tree');
  for (const part of ['orchestrator agent', 'child agents', 'A2A']) assert.ok(tree.includes(part), part);
  assert.match(tree, /short-lived helper/i);
  assert.doesNotMatch(tree, /\b(level|depth|tier)s?\b|\b\d+ levels?\b/i);
});

test('the page says child agent, never sub-agent, subagent or turn', () => {
  assert.doesNotMatch(text, /\bsub-?agents?\b/i);
  assert.doesNotMatch(prose, /\bturns?\b/i);
});

test('Agent Studio gets one sentence, in "Agents and the orchestrator agent", linked to its page, and one link in Where to go next', () => {
  assert.equal(text.match(/Agent Studio/g)?.length, 2);
  assert.equal(section(text, 'Agents and the orchestrator agent').match(/Agent Studio/g)?.length, 1);
  const studio = section(text, 'Agents and the orchestrator agent');
  assert.match(studio, /\[Agent Studio\]\(\.\/agent-studio\.md\)/);
});

test('the threads section says a thread is one conversation that only its owner reads, and a run is one execution in a thread', () => {
  const threads = section(text, 'Threads and runs');
  assert.match(threads, /\[thread\]\(\.\/glossary\.md#thread\)/i);
  assert.match(threads, /only its owner/i);
  assert.match(threads, /\[run\]\(\.\/glossary\.md#run\)/i);
});

test('each term is linked at its first use: agent, orchestrator agent, A2A, thread, run, Agent Studio', () => {
  for (const [term, anchor] of [['agent', 'agent'], ['orchestrator agent', 'orchestrator-agent'], ['A2A', 'a2a'], ['thread', 'thread'], ['run', 'run'], ['Agent Studio', 'agent-studio']]) {
    const first = new RegExp(`\\b${term}\\b`, 'i').exec(body.replace(/^description:.*$/m, ''));
    assert.ok(first, term);
    const link = term === 'Agent Studio' ? `[${term}](./agent-studio.md)` : `[${term}](./glossary.md#${anchor})`;
    assert.ok(body.slice(first.index - 1, first.index - 1 + link.length).toLowerCase() === link.toLowerCase(), `${term} first use is linked`);
  }
});

test('every link resolves, and Where to go next has 2 to 4 links ordered how-work-moves, one-access-model, agent-studio, glossary', () => {
  assert.deepEqual(brokenLinks(text, file), []);
  const next = linksOf(section(text, 'Where to go next'));
  assert.deepEqual(next, ['./how-work-moves-through-a-space.md', './one-access-model.md', './agent-studio.md', './glossary.md']);
});

test('the scene is a slice of the lead scenario: one agent finds leads, another drafts the email, each sees what the member may see', () => {
  const example = section(text, 'A lead search handed to two agents');
  for (const word of ['orchestrator agent', 'leads', 'email', 'member']) assert.ok(example.includes(word), word);
  assert.match(example, /only what the member may see|only what that member may see/);
});

test('the page names no banned name or term', () => {
  const banned = [
    /\.md\b(?!\))/, /LangGraph/, /checkpoint/i, /invokeAgent/, /spawnSubagent/, /hard leaf/i, /agent_instances/, /runtimeType/, /BullMQ/, /\bSSE\b/,
    /workspace/i, /\binstance\b/i, /\bHiring\b|\bSDR\b|\bCSR\b/, /\binbound\b/i, /\bcaller\b/i, /\bexactly\b/i, /someone|a person who/i,
  ];
  const noLinks = body.replace(/\]\([^)]*\)/g, ']');
  for (const pattern of banned) assert.doesNotMatch(noLinks, pattern);
  assert.deepEqual(bannedTermsIn(noLinks), []);
});

test('agents are set up in Agent Studio, and no role is named', () => {
  assert.match(section(text, 'Agents and the orchestrator agent'), /Agents are set up in \[Agent Studio\]/);
});

test('the page follows the voice checks and has no em dash', () => {
  assert.deepEqual(voiceViolations(text), []);
  assert.doesNotMatch(prose, /—/);
});
