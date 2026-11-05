import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const config = JSON.parse(readFileSync(join(root, 'flavours.config.json'), 'utf8'));
const { pages } = JSON.parse(readFileSync(join(root, config.outDir, 'flavours.json'), 'utf8'));
const html = (url) => readFileSync(join(root, 'build', url, 'index.html'), 'utf8');

const CATEGORY = '<li class="theme-doc-sidebar-item-category theme-doc-sidebar-item-category-level-1';

test('the site has flavoured pages to check', () => assert.ok(pages.length > 0));

for (const { url, axes } of pages) {
  test(`${url} opens at its plain URL with a labelled block for every flavour of its axes`, () => {
    const page = html(url);
    for (const axis of axes) {
      for (const [flavour, label] of Object.entries(config.axes[axis])) {
        assert.match(page, new RegExp(`data-axis="${axis}"[^>]*data-flavour="${flavour}"`), `${axis} ${flavour}`);
        assert.ok(page.includes(`<p class="flavour-label">${label}</p>`), label);
      }
    }
    assert.doesNotMatch(page, /<!-- \/?flavour/);
  });

  test(`${url} has an active sidebar link, an open category when it sits in one, breadcrumbs and pagination`, () => {
    const page = html(url);
    assert.match(page, new RegExp(`aria-current="page"[^>]*href="${url}"`));
    // Part 0 holds the navbar and the items before the first category, so only the parts after a category opening count.
    const category = page.split(CATEGORY).slice(1).find((part) => part.includes('aria-current="page"'));
    if (category) assert.doesNotMatch(category.slice(0, category.indexOf('>')), /menu__list-item--collapsed/);
    // Home and page, plus the category when the page sits in one.
    assert.ok((page.match(/class="breadcrumbs__item/g) ?? []).length >= (category ? 3 : 2), 'breadcrumbs');
    assert.match(page, /pagination-nav__link--(prev|next)/);
  });
}

test('no page is published under a flavour address', () => {
  const flavours = Object.values(config.axes).flatMap((flavoured) => Object.keys(flavoured));
  for (const flavour of flavours) assert.equal(existsSync(join(root, 'build', flavour)), false, `build/${flavour}`);
});

test('the site has one search index and no per-pair index', () => {
  const files = readdirSync(join(root, 'build'));
  assert.ok(files.includes('search-index.json'));
  assert.deepEqual(files.filter((f) => /^search-index-.+\.json$/.test(f)), []);
});

test('the search bar and the results page ask for hits through the flavour ranking', () => {
  const scripts = join(root, 'build/assets/js');
  const bundles = readdirSync(scripts).filter((f) => f.endsWith('.js')).map((f) => readFileSync(join(scripts, f), 'utf8'));
  assert.ok(bundles.some((code) => /`only in \$\{[a-z]\} (\\xb7|·) /.test(code)), 'rankByFlavour is in the client bundle');
});

test('the index keeps the anchor of a heading in a flavour block prefixed with its flavour', () => {
  const flavours = Object.values(config.axes).flatMap((flavoured) => Object.keys(flavoured));
  const [titles, headings] = JSON.parse(readFileSync(join(root, 'build/search-index.json'), 'utf8'));
  const flavoured = new Set(pages.map((page) => page.url));
  const hashes = headings.documents.filter((doc) => flavoured.has(doc.u) && doc.h).map((doc) => doc.h.slice(1));
  assert.ok(titles.documents.length > 0);
  assert.ok(hashes.some((hash) => flavours.some((flavour) => hash.startsWith(`${flavour}-`))));
});
