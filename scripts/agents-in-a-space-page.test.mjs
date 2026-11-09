import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/agents-in-a-space.md');
const text = readFileSync(file, 'utf8');
const body = text.replace(/^---\n[\s\S]*?\n---\n/, '').replace(/^import .*$/gm, '').trim();
const prose = body.replace(/<FigurePlaceholder[^>]*\/>/g, '').replace(/\]\([^)]*\)/g, ']').replace(/[#*`|]/g, '');
const lead = body.split(/^## /m)[0];

const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

test('the page runs lead, Example, two detail H2s, Where to go next', () => {
  assert.deepEqual(headings, ['Example', 'Agents and the orchestrator agent', 'The agent tree', 'Threads and runs', 'Where to go next']);
  assert.ok(lead.includes('](./glossary.md#agent)'), 'the lead defines agent with a glossary link');
});

test('the page is 500 to 800 words with no table', () => {
  const words = prose.split(/\s+/).filter(Boolean).length;
  assert.ok(words >= 500 && words <= 800, `${words} words`);
  assert.doesNotMatch(body, /^\s*\|/m);
});

test('the figure slot appears once, inside "The agent tree"', () => {
  assert.equal(text.match(/<FigurePlaceholder\b/g)?.length, 1);
  assert.match(section(text, 'The agent tree'), /<FigurePlaceholder slot="agent-tree" \/>/);
});

test('the tree is one orchestrator agent, agents for jobs with child agents, and two kinds of leaf, with no depth number', () => {
  const tree = section(text, 'The agent tree');
  for (const part of ['orchestrator agent', 'child agents', 'A2A', 'short-lived helper']) assert.ok(tree.includes(part), part);
  assert.doesNotMatch(tree, /\b(level|depth|tier)s?\b|\b\d+ levels?\b/i);
});

test('the page says child agent, never sub-agent, subagent or turn', () => {
  assert.doesNotMatch(text, /\bsub-?agents?\b/i);
  assert.doesNotMatch(prose, /\bturns?\b/i);
});

test('Agent Studio gets one sentence, in "Agents and the orchestrator agent", linked to the glossary', () => {
  assert.equal(text.match(/Agent Studio/g)?.length, 1);
  const studio = section(text, 'Agents and the orchestrator agent');
  assert.match(studio, /\[Agent Studio\]\(\.\/glossary\.md#agent-studio\)/);
});

test('the threads section says a thread is one conversation that only its owner reads, and a run is one execution in a thread', () => {
  const threads = section(text, 'Threads and runs');
  assert.match(threads, /\[thread\]\(\.\/glossary\.md#thread\)/);
  assert.match(threads, /only its owner/i);
  assert.match(threads, /\[run\]\(\.\/glossary\.md#run\)/);
});

test('each term is linked at its first use: agent, orchestrator agent, A2A, thread, run, Agent Studio', () => {
  for (const [term, anchor] of [['agent', 'agent'], ['orchestrator agent', 'orchestrator-agent'], ['A2A', 'a2a'], ['thread', 'thread'], ['run', 'run'], ['Agent Studio', 'agent-studio']]) {
    const first = new RegExp(`\\b${term}\\b`, 'i').exec(body.replace(/^description:.*$/m, ''));
    assert.ok(first, term);
    const link = `[${term}](./glossary.md#${anchor})`;
    assert.ok(body.slice(first.index - 1, first.index - 1 + link.length).toLowerCase() === link.toLowerCase(), `${term} first use is linked`);
  }
});

test('every link resolves, and Where to go next has 2 to 4 links ordered how-work-moves, one-access-model, glossary', () => {
  for (const link of linksOf(text)) {
    const [path, anchor] = link.split('#');
    assert.ok(existsSync(resolve(dirname(file), path)), link);
    if (anchor && path.endsWith('glossary.md')) {
      const terms = readFileSync(resolve(dirname(file), path), 'utf8').split('\n').filter((l) => l.startsWith('### '));
      assert.ok(terms.some((l) => l.slice(4).toLowerCase().replaceAll(' ', '-') === anchor), link);
    }
  }
  const next = linksOf(section(text, 'Where to go next'));
  assert.deepEqual(next, ['./how-work-moves-through-a-space.md', './one-access-model.md', './glossary.md']);
});

test('the example is a slice of the lead scenario: one agent finds leads, another drafts the email, each sees what the member may see', () => {
  const example = section(text, 'Example');
  for (const word of ['orchestrator agent', 'leads', 'email', 'member']) assert.ok(example.includes(word), word);
  assert.match(example, /only what the member may see|only what that member may see/);
});

test('sentences are 25 words or fewer', () => {
  for (const sentence of prose.split(/\n+/).flatMap((line) => line.split(/(?<=[.!?])\s+/)).filter((line) => /[.!?]$/.test(line))) assert.ok(sentence.split(/\s+/).length <= 25, sentence);
});

test('the page names no banned name or term', () => {
  const banned = [
    /\.md\b(?!\))/, /LangGraph/, /checkpoint/i, /invokeAgent/, /spawnSubagent/, /hard leaf/i, /agent_instances/, /runtimeType/, /BullMQ/, /\bSSE\b/,
    /AuthZEN|XACML|Zanzibar|Yjs/, /operating system/i, /resource pool/i, /actor stamp/i, /\bplane\b/i, /immutably|black-box/i, /workspace/i,
    /\binstance\b/i, /\bHiring\b|\bSDR\b|\bCSR\b/, /\binbound\b/i,
  ];
  const noLinks = body.replace(/\]\([^)]*\)/g, ']');
  for (const pattern of banned) assert.doesNotMatch(noLinks, pattern);
  assert.doesNotMatch(noLinks, /(?<!Vector )\bSpace\b/);
  assert.doesNotMatch(noLinks, /\bgrants?\b/i);
});

test('the page follows the voice checks', () => assert.deepEqual(voiceViolations(text), []));
