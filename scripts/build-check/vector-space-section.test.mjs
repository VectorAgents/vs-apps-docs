import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { slots } from '../../src/diagrams/figures/slots.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const built = (url) => readFileSync(join(root, 'build', url, 'index.html'), 'utf8');
const pages = [
  'what-vector-space-is',
  'organizations-and-spaces',
  'what-a-space-holds',
  'agents-in-a-space',
  'who-can-do-what',
  'why-vector-space',
  'one-access-model',
  'the-record-of-work',
  'agent-studio',
  'how-work-moves-through-a-space',
  'approvals-and-the-command-center',
  'extending-a-space',
];

test('the Vector Space navbar tab opens What Vector Space is', () => {
  const nav = built('vector-space/glossary').match(/<a [^>]*class="navbar__item navbar__link[^"]*"[^>]*>Vector Space<\/a>/)?.[0] ?? '';
  assert.match(nav, /href="[^"]*\/vector-space\/what-vector-space-is"/);
});

test('the sidebar lists Core concepts, Architecture and governance and Workflows and extensions with the 12 pages in order, then the glossary', () => {
  const sidebar = built('vector-space/what-vector-space-is').match(/<nav[^>]*menu[^>]*>[\s\S]*?<\/nav>/)?.[0] ?? '';
  const hrefs = [...sidebar.matchAll(/<a class="menu__link(?: menu__link--active)?"[^>]*href="[^"]*\/vector-space\/([\w-]+)"/g)].map((m) => m[1]);
  assert.deepEqual(hrefs, [...pages, 'glossary']);
  const labels = [...sidebar.matchAll(/<span class="categoryLinkLabel_\w+">([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(labels, ['Core concepts', 'Architecture and governance', 'Workflows and extensions']);
});

const source = (slot) => readFileSync(join(root, 'docs/vector-space', `${slot.page}.md`), 'utf8');
const placeholderSlots = slots.filter((s) => source(s).includes('<FigurePlaceholder'));

test('each slot without a real figure yet shows a labelled figure with a dashed frame, "Diagram in progress" and its caption', () => {
  for (const slot of placeholderSlots) {
    const html = built(`vector-space/${slot.page}`).replaceAll('<!-- -->', '');
    const figure = html.match(/<figure class="figure-placeholder"[\s\S]*?<\/figure>/)?.[0] ?? '';
    assert.ok(figure, slot.page);
    assert.match(figure, /role="img"/);
    assert.ok(figure.includes(`aria-label="${slot.caption}"`), slot.page);
    assert.match(figure, new RegExp(`figure-placeholder__frame--${slot.kind}">Diagram in progress<`));
    assert.ok(figure.includes(`<figcaption>Fig. 1 · ${slot.caption}</figcaption>`), slot.page);
  }
});

test('a page without a placeholder slot shows no placeholder', () => {
  const withSlot = new Set(placeholderSlots.map((s) => s.page));
  for (const page of pages.filter((p) => !withSlot.has(p))) assert.ok(!built(`vector-space/${page}`).includes('figure-placeholder'), page);
});

test('the deleted at-a-glance page is not built', () => {
  assert.throws(() => built('vector-space/vector-space-at-a-glance'), /ENOENT/);
});
