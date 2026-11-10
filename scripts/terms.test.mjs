import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { test } from 'node:test';

const NOUN_GRANT = /\b(?:an?|the|each|every|one|no|any|all|your|their|its|this|that|these|those|which|of|for|per|with|new|existing|revoked|standing)\s+grants?\b/gi;

/** Fence and code-span text, link targets and the bold Vector Space menu labels `**Space**` and `**Spaces**` are not prose. */
const proseLines = (markdown) => {
  let fence = null;
  return markdown.split('\n').map((line) => {
    const marker = line.match(/^\s*(```|~~~)/)?.[1];
    if (fence) {
      if (marker === fence) fence = null;
      return '';
    }
    if (marker) {
      fence = marker;
      return '';
    }
    return line
      .replace(/`[^`]*`/g, '')
      .replace(/\]\([^)]*\)/g, ']')
      .replace(/\*\*Spaces?\*\*/g, '');
  });
};

/**
 * Old vocabulary in prose: capital-S "Space" outside "Vector Space", the bare noun
 * "grant" (the term is "capability grant"; the verb is fine) and "RedemptAI".
 * @returns {{ rule: string, line: number, text: string }[]}
 */
export function termViolations(markdown) {
  const found = [];
  proseLines(markdown).forEach((line, i) => {
    const hit = (rule, pattern) => {
      for (const m of line.matchAll(pattern)) found.push({ rule, line: i + 1, text: m[0] });
    };
    hit('space', /(?<!Vector )\bSpaces?\b/g);
    hit('grant', NOUN_GRANT);
    hit('redemptai', /RedemptAI/g);
  });
  return found;
}

const rules = (md) => termViolations(md).map((v) => v.rule);

test('Space: flagged on its own, allowed inside Vector Space', () => {
  assert.deepEqual(rules('Vector Space reads the manifest.'), []);
  assert.deepEqual(rules('Open a space in Vector Space.'), []);
  assert.deepEqual(rules('Space reads the manifest.'), ['space']);
  assert.deepEqual(rules('Each Space has members.'), ['space']);
  assert.deepEqual(rules('Many Spaces exist.'), ['space']);
});

test('Space: code spans, fences, link targets and menu labels are excluded', () => {
  assert.deepEqual(rules('Call `createSpaceAi` for the Space.'), ['space']);
  assert.deepEqual(rules('Call `Space` here.'), []);
  assert.deepEqual(rules('```mermaid\nparticipant H as Space host\n```'), []);
  assert.deepEqual(rules('~~~text\nSpace\n~~~'), []);
  assert.deepEqual(rules('See [the guide](./space-guide.md#Space).'), []);
  assert.deepEqual(rules('Choose **Settings**, **Space**, then **Spaces**.'), []);
  assert.deepEqual(rules('```\nSpace\n```\nSpace reads it.'), ['space']);
});

test('grant: the bare noun is flagged, the verb and "capability grant" are not', () => {
  assert.deepEqual(rules('A space manager can grant a capability.'), []);
  assert.deepEqual(rules('A space manager grants the capability.'), []);
  assert.deepEqual(rules('Grant the capabilities.'), []);
  assert.deepEqual(rules('The capability grant is stored.'), []);
  assert.deepEqual(rules('Two capability grants exist.'), []);
  assert.deepEqual(rules('The capability was granted.'), []);
  assert.deepEqual(rules('The grant is stored.'), ['grant']);
  assert.deepEqual(rules('Each member has a grant.'), ['grant']);
  assert.deepEqual(rules('Remove all grants.'), ['grant']);
  assert.deepEqual(rules('Use `the grant` here.'), []);
});

test('RedemptAI is flagged', () => {
  assert.deepEqual(rules('RedemptAI staff add apps.'), ['redemptai']);
  assert.deepEqual(rules('Vector Space staff add apps.'), []);
});

test('a violation reports its line', () => {
  assert.deepEqual(termViolations('Fine.\n\nSpace is here.'), [{ rule: 'space', line: 3, text: 'Space' }]);
});

test('published pages use the current terms', () => {
  const docs = new URL('../docs/', import.meta.url);
  const pages = readdirSync(docs, { recursive: true }).filter((f) => /\.mdx?$/.test(f));
  assert.ok(pages.length > 0);
  for (const page of pages) {
    const violations = termViolations(readFileSync(new URL(page, docs), 'utf8'));
    assert.deepEqual(violations, [], `${page}: ${violations.map((v) => `${v.line} ${v.rule} "${v.text}"`).join(', ')}`);
  }
});

test('diagram labels and text use the current terms', async () => {
  const dir = new URL('../src/diagrams/figures/', import.meta.url);
  for (const file of readdirSync(dir).filter((f) => f.endsWith('.ts'))) {
    const data = await import(new URL(file, dir));
    const text = JSON.stringify(data).replace(/","|":"|[{}[\]]/g, '\n');
    const violations = termViolations(text);
    assert.deepEqual(violations, [], `${file}: ${violations.map((v) => `${v.rule} "${v.text}"`).join(', ')}`);
  }
});
