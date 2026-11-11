import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';

const sections = {
  'vector-space': [
    'Vector Space', 'space', 'space manager', 'Organization admin', 'page', 'staff',
    'knowledge source', 'Context Hub', 'ask', 'human in the loop', 'channel', 'MCP', 'A2A', 'AI',
    'organization', 'member', 'role', 'share', 'block', 'condition', 'service account', 'agent', 'orchestrator agent',
    'thread', 'run', 'schedule', 'connector', 'Vector Module', 'extension', 'Command Center', 'Agent Studio', 'governance',
    'Activity', 'Audit', 'Intelligence', 'actor', 'standing approval', 'Human Time Return',
    'widget', 'datasource', 'skill', 'group', 'Can use', 'Can edit', 'General access', 'AI gateway', 'AI provider account', 'execution',
    'Overview', 'Health', 'spend cap', 'rate card', 'agent card',
  ],
  'vector-apps': [
    'app', 'app registration', 'manifest', 'app page', 'capability', 'capability grant', 'model slot', 'connector slot',
    'acts', 'approvals', 'app token', 'service secret', 'binding', 'allowed resources',
  ],
  sdk: [
    'app definition', 'SDK', 'harness', 'dev issuer', 'agent action', 'agent catalog', 'monorepo', 'shared package',
    'app platform', 'app session', 'conformance kit',
  ],
};

const docsDir = new URL('../docs/', import.meta.url);
const parse = (text) => text
  .split(/^### /m)
  .slice(1)
  .map((block) => {
    const [name, ...rest] = block.split('\n');
    return { name: name.replace(/\s*\{#.*\}\s*$/, '').trim(), body: rest.join('\n') };
  });
const texts = Object.fromEntries(Object.keys(sections).map((s) => [s, readFileSync(new URL(`${s}/glossary.md`, docsDir), 'utf8')]));
const all = Object.entries(texts).flatMap(([section, text]) => parse(text).map((e) => ({ ...e, section })));
const text = Object.values(texts).join('\n');
const entries = all;
const sorted = (names) => names.map((t) => t.toLowerCase()).sort();

for (const [section, terms] of Object.entries(sections)) {
  test(`${section} glossary defines exactly its terms`, () => {
    assert.deepEqual(sorted(parse(texts[section]).map((e) => e.name)), sorted(terms));
  });
}

test('a term is defined once across the three glossaries', () => {
  const names = all.map((e) => e.name.toLowerCase());
  assert.deepEqual(names.filter((n, i) => names.indexOf(n) !== i), []);
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
    assert.doesNotMatch(body, /app developer|app binding/i, page);
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
  assert.equal(first('space manager'), 'A user who can edit on the space, or the Organization admin. They add apps, share capabilities and choose the models and connectors for the slots.');
});

test('allowed resources entry states the overlap rule in the member\'s access', () => {
  const entry = entries.find((e) => e.name === 'allowed resources').body;
  assert.match(entry, /allowed for the app and open to the member/);
  assert.doesNotMatch(text, /\b(ceiling|floor)\b/i);
});

test('Context Hub and knowledge source entries name the Vector Space screens', () => {
  const body = (name) => entries.find((e) => e.name === name).body;
  assert.match(body('Context Hub'), /Resources/);
  assert.match(body('knowledge source'), /settings of an app/);
});

test('Context Hub holds six kinds of resource and pages are not one of them', () => {
  const body = entries.find((e) => e.name === 'Context Hub').body;
  for (const kind of ['connectors', 'knowledge sources', 'datasources', 'skills', 'apps', 'Vector Modules']) assert.match(body, new RegExp(kind), kind);
  assert.match(body, /Pages are not one of them/);
  assert.doesNotMatch(body, /resource pool/i);
});

test('no entry or link uses Edit level, View level or resource pool', () => {
  assert.ok(!entries.some((e) => /^(edit level|resource pool)$/i.test(e.name)));
  assert.doesNotMatch(text, /\bEdit level\b|\bView level\b|resource pool/i);
});

test('the access rows define role, group, share, block, condition and member', () => {
  const first = (name) => entries.find((e) => e.name === name).body.trim().split('\n')[0];
  assert.match(first('role'), /Can use or Can edit/);
  assert.match(first('role'), /never a set of people/i);
  assert.match(first('group'), /set of users and groups/);
  assert.match(first('share'), /one subject's role on one object/i);
  assert.match(first('block'), /Everything or Editing/);
  assert.match(first('condition'), /Datasources and connectors only|datasources and connectors only/);
  assert.match(first('member'), /General access/);
});

test('Vector Module lists Calendar and Human Time Return is an estimate', () => {
  const body = (name) => entries.find((e) => e.name === name).body;
  assert.match(body('Vector Module'), /Omnibox/);
  assert.match(body('Vector Module'), /Contacts/);
  assert.match(body('Vector Module'), /Calendar/);
  assert.match(body('Human Time Return'), /estimate/);
  assert.match(body('Human Time Return'), /seconds/);
  assert.match(body('Human Time Return'), /not a spend figure/);
});

test('Command Center is not a Vector Module and the orchestrator agent entry says one', () => {
  const body = (name) => entries.find((e) => e.name === name).body;
  assert.match(body('Command Center'), /not a Vector Module/);
  assert.match(body('orchestrator agent'), /one/i);
});

test('capability grant is a share on named capabilities and acts name Human Time Return', () => {
  const body = (name) => entries.find((e) => e.name === name).body;
  assert.ok(body('capability grant').trim().startsWith('A [share](../vector-space/glossary.md#share) on named capabilities, at Can use, for users or groups.'));
  assert.match(body('share'), /capability grant/);
  assert.match(body('acts'), /Human Time Return/);
  assert.match(body('acts'), /\(\.\.\/vector-space\/glossary\.md#human-time-return\)/);
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

test('MCP and A2A keep their SDK mapping line in the Vector Space glossary', () => {
  for (const name of ['MCP', 'A2A']) {
    const entry = all.find((e) => e.name === name);
    assert.equal(entry.section, 'vector-space', name);
    assert.match(entry.body, /^- Maps to: .*`/m, name);
  }
});

test('conformance kit, app platform and app session entries name their SDK symbols', () => {
  const body = (name) => entries.find((e) => e.name === name).body;
  assert.match(body('conformance kit'), /`appPlatformConformance`/);
  assert.match(body('conformance kit'), /`startFakeVectorSpace`/);
  assert.match(body('app platform'), /`createAppPlatform`/);
  assert.match(body('app session'), /`startAppSession`/);
});

test('app token maps the SDK name service token', () => {
  assert.match(entries.find((e) => e.name === 'app token').body, /The SDK calls it a service token/);
});

test('every link to a glossary term resolves to a page and an anchor that exist', () => {
  const slugOf = (name) => name.toLowerCase().replaceAll(' ', '-');
  const anchors = Object.fromEntries(Object.entries(texts).map(([section, t]) => [section, parse(t).map((e) => slugOf(e.name))]));
  let count = 0;
  const pages = readdirSync(docsDir, { recursive: true }).filter((f) => /\.mdx?$/.test(f));
  for (const page of pages) {
    const body = readFileSync(new URL(page, docsDir), 'utf8');
    for (const [, target, anchor] of body.matchAll(/\]\(([^)#\s]*glossary\.md)(?:#([^)\s]*))?\)/g)) {
      const file = join(dirname(join('/docs', page)), target).replace(/^\/docs\//, '');
      assert.ok(existsSync(new URL(file, docsDir)), `${page}: ${target} does not exist`);
      const section = file.split('/')[0];
      if (anchor) assert.ok(anchors[section]?.includes(anchor), `${page}: ${target}#${anchor} has no entry`);
      count += 1;
    }
  }
  assert.ok(count > 90, `${count} glossary links`);
});

test('each term links to the glossary that defines it', () => {
  const home = Object.fromEntries(all.map((e) => [e.name.toLowerCase().replaceAll(' ', '-'), e.section]));
  const pages = readdirSync(docsDir, { recursive: true }).filter((f) => /\.mdx?$/.test(f));
  for (const page of pages) {
    const body = readFileSync(new URL(page, docsDir), 'utf8');
    for (const [, target, anchor] of body.matchAll(/\]\(([^)#\s]*glossary\.md)#([^)\s]*)\)/g)) {
      const file = join(dirname(join('/docs', page)), target).replace(/^\/docs\//, '');
      assert.equal(file.split('/')[0], home[anchor], `${page}: ${anchor} is defined in the ${home[anchor]} glossary`);
    }
  }
});
