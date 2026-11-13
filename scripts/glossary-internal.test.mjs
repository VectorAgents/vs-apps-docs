import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';

const internalUrl = new URL('../.agents/glossary-internal.md', import.meta.url);
const publishedUrls = ['vector-space', 'vector-apps', 'sdk'].map((section) => new URL(`../docs/${section}/glossary.md`, import.meta.url));

const names = (text) => text.split(/^### /m).slice(1).map((block) => block.split('\n')[0].replace(/\s*\{#.*\}\s*$/, '').trim().toLowerCase());
const internal = readFileSync(internalUrl, 'utf8');

test('internal entries have definition, mapping and owner', () => {
  const blocks = internal.split(/^### /m).slice(1);
  assert.ok(blocks.length > 0);
  for (const block of blocks) {
    const [name, ...rest] = block.split('\n');
    const body = rest.join('\n');
    assert.match(body, /^[^\s-].*$/m, `${name}: definition`);
    assert.match(body, /^- Maps to: .+/m, `${name}: mapping`);
    assert.match(body, /^- Owner: .+/m, `${name}: owner`);
  }
});

test('no term is in both glossaries', () => {
  const published = publishedUrls.flatMap((url) => names(readFileSync(url, 'utf8')));
  for (const name of names(internal)) assert.ok(!published.includes(name), `${name} is in both files`);
});

test('internal glossary is outside docs/', () => {
  assert.ok(!internalUrl.pathname.includes('/docs/'));
});

test('role line entry defines the quickstart role line', () => {
  const block = internal.split(/^### /m).slice(1).find((b) => b.startsWith('role line\n'));
  assert.ok(block, 'role line entry missing');
  assert.match(block, /`\*\*Role\*\*: organization admin\.`/);
  assert.match(block, /`\*\*Role\*\*: space admin\.`/);
});

test('staff and binding are published terms, not internal ones', () => {
  const published = publishedUrls.flatMap((url) => names(readFileSync(url, 'utf8')));
  for (const term of ['staff', 'binding']) {
    assert.ok(published.includes(term), `${term} is not published`);
    assert.ok(!names(internal).includes(term), `${term} is still internal`);
  }
});
