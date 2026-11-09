import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'sdk/choose-your-path.md');
const text = readFileSync(file, 'utf8');

const plain = (cell) => cell.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
const rows = (body) =>
  body
    .split('\n')
    .filter((l) => l.startsWith('|'))
    .map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));
const [header, , ...body] = rows(section(text, 'Compare the three paths'));

test('the page runs compare, when each fits, next steps', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), ['Compare the three paths', 'When each path fits', 'Where to go next']);
});

test('the table has three columns: Vector App, A2A agent, MCP server', () => {
  assert.deepEqual(header.slice(1), ['Vector App', 'A2A agent', 'MCP server']);
});

test('the rows run build, shows up as, who sets it up, knows the member, platform data, model calls, approvals and acts', () => {
  assert.deepEqual(
    body.map(([label]) => label),
    ['You build', 'Shows up as', 'Who sets it up', 'Knows the calling member', 'Reads platform data', 'Model calls', 'App approvals and acts'],
  );
  for (const row of body) assert.equal(row.length, 4, row[0]);
});

test('table cells hold 15 words or fewer', () => {
  for (const row of body) for (const cell of row) assert.ok(plain(cell).split(/\s+/).length <= 15, cell);
});

test('the page has no Effort row and no only-way claim', () => {
  assert.doesNotMatch(text, /\bEffort\b|only way|Human Time/);
});

test('the user token identifies the member and the page never says a token names them', () => {
  const known = body.find(([label]) => label === 'Knows the calling member');
  assert.match(plain(known[1]), /^Yes\b.*\bidentifies\b/);
  assert.match(known[2], /^No\b/);
  assert.match(known[3], /^No\b/);
  assert.doesNotMatch(text, /names the member/i);
});

test('calling a space is one aside line that links the call-Vector-Space guide', () => {
  const guide = '../vector-apps/guides/call-space-from-your-server.md';
  assert.equal(linksOf(text).filter((l) => l === guide).length, 1);
  assert.equal(text.split('\n').filter((l) => l.includes(guide)).length, 1);
  assert.match(text, /\[Call Vector Space from your server\]\(\.\.\/vector-apps\/guides\/call-space-from-your-server\.md\)/);
  assert.equal(text.match(/^#+ .*Calling a space/gim), null);
});

test('every link resolves, and the page links Why Vector Apps, the A2A guide and Platform limits', () => {
  const links = linksOf(text);
  for (const link of links) {
    const [path, anchor] = link.split('#');
    if (/^(\/|https?:)/.test(path)) continue;
    assert.ok(existsSync(resolve(dirname(file), path)), link);
    if (anchor && path.endsWith('glossary.md')) {
      const terms = readFileSync(resolve(dirname(file), path), 'utf8').split('\n').filter((l) => l.startsWith('### '));
      assert.ok(terms.some((l) => l.slice(4).toLowerCase().replaceAll(' ', '-') === anchor), link);
    }
  }
  for (const target of ['../vector-apps/why-vector-apps.md', '../vector-apps/guides/expose-app-as-a2a-agent.md', './reference/platform-limits.md']) {
    assert.ok(links.includes(target), target);
  }
});

test('the page holds no closed list', () => {
  assert.doesNotMatch(text, /\b(ANTHROPIC|AZURE_OPENAI|COHERE|CLICKUP|FIRECRAWL|INSTANTLY|UNIPILE|APOLLO|WHATSAPP|MESSENGER|INSTAGRAM|omnibox|contacts)\b/);
});

test('the page follows the voice checks and names no master doc or placeholder app', () => {
  assert.deepEqual(voiceViolations(text), []);
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|APPS|GLOSSARY|README)\.md/);
  assert.doesNotMatch(text, /\b(Hiring|SDR|CSR)\b/);
});
