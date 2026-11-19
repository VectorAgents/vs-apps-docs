import assert from 'node:assert/strict';
import { copyFileSync, mkdtempSync, readFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { checkSnippets } from './check-snippets.mjs';
import { coreFieldRules, resourceFieldRules } from '../src/data/field-rules.ts';
import { descriptionOf, longCells, overlong, withoutCode } from './sdk-page-helpers.mjs';
import { installedSdkVersion } from './starter-sync.mjs';

const pageUrl = new URL('../docs/sdk/app-definition.md', import.meta.url);
const text = readFileSync(pageUrl, 'utf8');
const headings = [...text.matchAll(/^#{2,4} (.+)$/gm)].map((m) => m[1]);

const slug = (heading) => heading.toLowerCase().replace(/[^\w\s-]/g, '').replaceAll(' ', '-');

test('answers the four questions under task and noun-phrase headings', () => {
  for (const h of ['What an app definition is', 'Where the app definition is used', 'Write an app definition', 'How it reflects in Vector Space']) {
    assert.ok(headings.includes(h), h);
  }
  for (const old of ['What an app definition does', 'How to write one']) assert.ok(!headings.includes(old), old);
});

test('states each use once, in order, as a heading', () => {
  const uses = [...text.matchAll(/^#### (.+)\n/gm)].map((m) => m[1]).slice(0, 10);
  assert.deepEqual(uses, [
    'Validate on import',
    'Type navigation and routes',
    'Generate and serve the manifest',
    'List agent-callable routes',
    'Merge the agent catalog',
    'Keep the app registry of the server',
    'Check the token',
    'Receive connector events',
    'Look up a model slot',
    'Read the manifest in Vector Space',
  ]);
});

test('states no count or number that refers to an item of its own list, and links a use by its anchor', () => {
  assert.doesNotMatch(text, /\b(ten|three) (uses|places|groups)\b|\buse \d|\[use \d+\]|^\d+\. \*\*/m);
  assert.match(text, /\[Import check\]\(#validate-on-import\)/);
  const slugs = headings.map(slug);
  for (const [, anchor] of text.matchAll(/\]\(#([^)]+)\)/g)) assert.ok(slugs.includes(anchor), anchor);
});

test('has a description of one sentence and 160 characters or fewer, and no SDK version in its text', () => {
  const description = descriptionOf(text);
  assert.ok(description && description.length <= 160);
  assert.doesNotMatch(description, /^(This page|Learn)\b/);
  assert.doesNotMatch(text, new RegExp(installedSdkVersion().replaceAll('.', '\\.')));
});

test('every table cell is one sentence of 15 words or fewer and no sentence runs over 35 words', () => {
  assert.deepEqual(longCells(text), []);
  assert.deepEqual(overlong(text), []);
});

test('writes "member", never "user", for the people who open an app', () => {
  assert.doesNotMatch(withoutCode(text).replace(/\buser tokens?\b/gi, ''), /\busers?\b/i);
});

test('contrasts definition and manifest and says Vector Space never sees the definition', () => {
  assert.match(text, /hand-written TypeScript/i);
  assert.match(text, /generated JSON/i);
  assert.match(text, /Vector Space never sees the definition/);
});

test('the one mermaid code block sits inside DiagramControls, imported first in the body', () => {
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
  assert.equal(body.split('\n\n')[0], "import DiagramControls from '@site/src/components/DiagramControls';");
  assert.match(text, /<DiagramControls>\n\n```mermaid\n[\s\S]*?\n```\n\n<\/DiagramControls>\n\n### On import and in the client/);
  assert.equal([...text.matchAll(/<DiagramControls>/g)].length, 1);
  assert.equal([...text.matchAll(/```mermaid/g)].length, 1);
});

test('field rows equal the field-rules table, per object, with no extra rows', () => {
  const rules = [...coreFieldRules, ...resourceFieldRules];
  const documented = [];
  let object = null;
  let inTable = false;
  for (const line of text.split('\n')) {
    const heading = line.match(/^#{2,4} (.+)$/);
    if (heading) {
      object = heading[1] === 'Core fields' ? '' : (heading[1].match(/^`(.+)`$/)?.[1] ?? null);
      inTable = false;
      continue;
    }
    if (object === null) continue;
    if (line === '| Field | Required | Rule |') inTable = true;
    else if (inTable && line.startsWith('| `')) documented.push({ object, row: line });
    else if (!line.startsWith('|')) inTable = false;
  }
  const split = (path) => {
    const i = path.lastIndexOf('.');
    return i < 0 ? ['', path] : [path.slice(0, i), path.slice(i + 1)];
  };
  for (const rule of rules) {
    const [object, field] = split(rule.path);
    const row = `| \`${field}\` | ${rule.required ? 'required' : 'optional'} | ${rule.rule} |`;
    assert.ok(documented.some((d) => d.object === object && d.row === row), `row for ${rule.path}`);
  }
  assert.equal(documented.length, rules.length);
});

test('states the empty permissions and ungated page rules and the typo warning', () => {
  assert.match(text, /`permissions: \[\]` is valid/);
  assert.match(text, /page without (a permission|one) has no gate/i);
  assert.match(text, /:::warning[\s\S]*does not check[\s\S]*:::/);
  assert.equal([...text.matchAll(/^:::warning/gm)].length, 1);
});

test('states what the SDK guarantees and what is Vector Space side, and the pending review', () => {
  assert.match(text, /### SDK guarantees/);
  assert.match(text, /### Vector Space side/);
  assert.match(text, /pending/i);
});

test('does not claim unverified nav behaviour for a page without a permission', () => {
  assert.doesNotMatch(text, /without a permission[^.]*\b(appears|shows|listed|visible) in the (Vector Space )?nav/i);
});

test('leaves deferred fields undocumented', () => {
  assert.doesNotMatch(text, /`(contract|acts|approvals|retrieval|datasource)`/);
});

test('links each glossary term at first use only', () => {
  for (const term of ['manifest', 'Vector Space', 'permission', 'model slot', 'connector slot']) {
    const slug = term.toLowerCase().replaceAll(' ', '-');
    const glossary = term === 'Vector Space' ? 'vector-space' : 'vector-apps';
    const links = text.split(`](../${glossary}/glossary.md#${slug})`).length - 1;
    assert.equal(links, 1, `${term} linked ${links} times`);
  }
});

test('links the builder', () => {
  assert.match(text, /\]\(\/sdk\/builder\)/);
});

test('follows the writing standard', () => {
  assert.doesNotMatch(text, /—|–/);
  assert.doesNotMatch(text, /\b(we|our|ours|us)\b/i);
});

test('every snippet typechecks against the installed package', () => {
  const dir = mkdtempSync(join(tmpdir(), 'appdef-'));
  copyFileSync(pageUrl, join(dir, 'app-definition.md'));
  const result = checkSnippets({ docsDir: dir, stampFile: join(dir, 'stamp.json') });
  assert.equal(result.output, '');
  assert.ok(result.count >= 2, `snippets: ${result.count}`);
});
