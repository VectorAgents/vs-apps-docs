import assert from 'node:assert/strict';
import { existsSync, globSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const { default: sidebars } = await import(join(dirname(fileURLToPath(import.meta.url)), '..', 'sidebars.ts'));
const slugs = Object.values(sidebars).flat().map((item) => item.link?.slug).filter(Boolean);

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pages = {
  'vector-apps/quickstart.md': ['../sdk/app-definition.md', '/vector-apps/category/recipes', '../sdk/reference/harness.md'],
  'sdk/examples.md': ['app-definition.md', '/vector-apps/category/recipes', '/sdk/builder'],
  'sdk/app-definition.md': ['examples.md', '/vector-apps/category/recipes', '/sdk/category/reference'],
};

const withLead = new Set(['sdk/app-definition.md', 'sdk/examples.md']);

const block = (text) => text.split(/^## /m).slice(1).filter((s) => s.startsWith('Next steps\n'));

for (const [file, targets] of Object.entries(pages)) {
  const text = readFileSync(join(root, 'docs', file), 'utf8');

  test(`${file} ends with a Next steps block`, () => {
    assert.equal(block(text).length, 1);
    assert.match(text.split(/^## /m).at(-1), /^Next steps\n/);
  });

  test(`${file} Next steps items are a link plus a one-line reason`, () => {
    const items = block(text)[0].split('\n').slice(1).filter((l) => l.trim());
    if (withLead.has(file)) assert.match(items.shift(), /^[^-.!?][^.!?]*\.$/, 'lead is one non-bullet sentence');
    assert.equal(items.length, targets.length);
    for (const line of items) assert.match(line, /^- \[[^\]]+\]\([^)]+\): [^\n]*\S\.$/);
    const links = items.map((l) => l.match(/\]\(([^)]+)\)/)[1]);
    assert.deepEqual(links.map((l) => l.replace(/^\.\//, '')), targets);
    for (const l of links) {
      if (l.startsWith('./') || l.startsWith('../')) assert.ok(existsSync(resolve(root, 'docs', dirname(file), l)), l);
      if (l.includes('/category/')) assert.ok(slugs.includes(l), l);
    }
  });
}

test('no other page has a Next steps block', () => {
  const files = globSync('docs/**/*.{md,mdx}', { cwd: root });
  const have = files
    .filter((f) => /^## Next steps$/m.test(readFileSync(join(root, f), 'utf8')))
    .map((f) => f.replace('docs/', ''));
  assert.deepEqual(have.sort(), Object.keys(pages).sort());
});
