import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { glossaryIndex } from './glossary-index.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const sections = ['vector-space', 'vector-apps', 'sdk'];

const glossary = `---
title: Glossary
---

Intro paragraph.

## Terms

### app definition

The one object that describes an [app](../vector-apps/glossary.md#app): pages and **resources**. It reads \`no\` env.
A second line of the same paragraph.

Second paragraph is not part of the definition.

- Maps to: \`defineApp(...)\`.
- Owner: SDK and [Vector Space](./glossary.md#vector-space).

### Can use {#can-use-id}

A permission level.

- Owner: Vector Space.
`;

test('an entry is keyed by section and heading slug, with the first paragraph and the owner in plain text', () => {
  const index = glossaryIndex({ sdk: glossary });
  assert.deepEqual(index['sdk#app-definition'], {
    term: 'app definition',
    definition: 'The one object that describes an app: pages and resources. It reads no env. A second line of the same paragraph.',
    owner: 'SDK and Vector Space',
  });
});

test('an explicit heading id replaces the slug', () => {
  const index = glossaryIndex({ 'vector-space': glossary });
  assert.deepEqual(Object.keys(index), ['vector-space#app-definition', 'vector-space#can-use-id']);
  assert.equal(index['vector-space#can-use-id'].term, 'Can use');
  assert.equal(index['vector-space#can-use-id'].owner, 'Vector Space');
});

test('text before the first entry is not an entry', () => {
  assert.equal(Object.keys(glossaryIndex({ sdk: glossary })).length, 2);
});

const headings = (section) =>
  [...readFileSync(join(root, 'docs', section, 'glossary.md'), 'utf8').matchAll(/^### (.+)$/gm)].map((m) => m[1]);

test('generate writes the index of the three glossaries beside site/, outside the published docs', () => {
  const file = join(root, 'docs-gen', 'glossary-index.json');
  assert.ok(existsSync(file), 'docs-gen/glossary-index.json');
  const index = JSON.parse(readFileSync(file, 'utf8'));
  for (const section of sections) {
    const keys = Object.keys(index).filter((k) => k.startsWith(`${section}#`));
    assert.equal(keys.length, headings(section).length, `${section}: one entry per heading`);
  }
  for (const [key, { term, definition }] of Object.entries(index)) {
    assert.ok(term && definition, key);
    assert.doesNotMatch(definition, /\]\(|`|\*\*/, `${key}: no markup`);
  }
});
