import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

const text = readFileSync(new URL('../docs/vector-apps/glossary.md', import.meta.url), 'utf8');
const entries = text
  .split(/^### /m)
  .slice(1)
  .map((block) => {
    const [name, ...rest] = block.split('\n');
    return { name: name.replace(/\s*\{#.*\}\s*$/, '').trim(), body: rest.join('\n') };
  });

const required = [
  'app', 'app definition', 'manifest', 'Vector Space', 'space', 'space manager', 'Organization admin', 'Edit level', 'space page',
  'resource pool', 'knowledge source', 'app registration', 'app page', 'capability', 'capability grant', 'model slot',
  'connector slot', 'allowed resources', 'agent action', 'agent catalog', 'acts', 'approvals',
  'harness', 'dev issuer', 'SDK', 'MCP', 'A2A', 'service secret', 'app token', 'monorepo', 'shared package',
];

test('covers every candidate term', () => {
  assert.deepEqual(entries.map((e) => e.name.toLowerCase()).sort(), required.map((t) => t.toLowerCase()).sort());
});

test('each entry has definition, mapping and owner', () => {
  for (const { name, body } of entries) {
    assert.match(body, /^[^\s-].*$/m, `${name}: definition`);
    assert.match(body, /^- Maps to: .+/m, `${name}: mapping`);
    assert.match(body, /^- Owner: (SDK|Vector Space|SDK and Vector Space|docs)\b/m, `${name}: owner`);
  }
});

test('follows the writing standard', () => {
  assert.doesNotMatch(text, /—|–/);
  assert.doesNotMatch(text, /\b(we|our|ours|us)\b/i);
});

test('published pages use no internal term', () => {
  const docs = new URL('../docs/', import.meta.url);
  const pages = readdirSync(docs, { recursive: true }).filter((f) => /\.mdx?$/.test(f));
  for (const page of pages) {
    const body = readFileSync(new URL(page, docs), 'utf8');
    assert.doesNotMatch(body, /app developer|app binding|glossary\.md#binding/i, page);
  }
});

test('published pages carry no provenance link or unverified caveat', () => {
  const docs = new URL('../docs/', import.meta.url);
  const pages = readdirSync(docs, { recursive: true });
  assert.ok(!pages.some((f) => /^provenance\./.test(f)), 'provenance page is published');
  for (const page of pages.filter((f) => /\.mdx?$/.test(f))) {
    const body = readFileSync(new URL(page, docs), 'utf8');
    assert.doesNotMatch(body, /provenance|not yet verified/i, page);
  }
});

test('harness entry does not mention the quickstart and lists no limits', () => {
  const harness = entries.find((e) => e.name === 'harness');
  assert.doesNotMatch(harness.body, /quickstart/i);
  assert.doesNotMatch(harness.body, /^- (?!Maps to|Owner)/m);
});

test('glossary defines no workspace term', () => {
  assert.ok(!entries.some((e) => /workspace/i.test(e.name)));
});

test('Vector Space, space and space manager entries open with the platform text', () => {
  const first = (name) => entries.find((e) => e.name === name).body.trim().split('\n')[0];
  assert.match(first('Vector Space'), /^The Vector platform\./);
  assert.match(first('space'), /^A shared place in Vector Space\b/);
  assert.equal(first('space manager'), 'A member of a space at Edit level, or an Organization admin. They add apps, grant capabilities and choose the models and connectors for the slots.');
});

test('app page and space page entries tell the two pages apart', () => {
  const body = (name) => entries.find((e) => e.name === name).body;
  assert.match(body('space page'), /\bapp page\b/);
  assert.match(body('app page'), /\bspace page\b/);
});

test('allowed resources entry states the overlap rule in the member\'s access', () => {
  const entry = entries.find((e) => e.name === 'allowed resources').body;
  assert.match(entry, /allowed for the app and open to the member/);
  assert.doesNotMatch(text, /\b(ceiling|floor)\b/i);
});

test('resource pool and knowledge source entries name the Vector Space screens', () => {
  const body = (name) => entries.find((e) => e.name === name).body;
  assert.match(body('resource pool'), /Context Hub/);
  assert.match(body('resource pool'), /Resources/);
  assert.match(body('knowledge source'), /settings of an app/);
});

test('no entry is named grant', () => {
  assert.ok(!entries.some((e) => e.name.toLowerCase() === 'grant'));
});

test('glossary prose writes Vector Space in full', () => {
  const prose = text.replace(/`[^`]*`/g, '');
  assert.doesNotMatch(prose, /(?<!Vector )\bSpaces?\b/);
});

test('A2A entry names the agent card helpers and the definition field', () => {
  const entry = entries.find((e) => e.name === 'A2A').body;
  assert.match(entry.trim(), /^Agent2Agent\./);
  assert.match(entry, /`buildAppAgentCard`/);
  assert.match(entry, /`createA2aRequestHandler`/);
  assert.match(entry, /`agents\[\]`/);
});
