import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');

/**
 * Registers the build checks that every page with one structure figure shares: its accessible name, caption, legend and card,
 * one name and one button per part and slab, dashed remote links and no arrows, and its labels in the search index. Returns the
 * built `page` and `figure` markup for the checks that belong to one page.
 *
 * @param {{ url: string, data: import('../../src/diagrams/figure/types.ts').StructureData, searchLabels: string[], remoteLinks: number }} spec
 */
export function structureFigureChecks({ url, data, searchLabels, remoteLinks }) {
  const page = readFileSync(join(root, 'build', url, 'index.html'), 'utf8').replaceAll('<!-- -->', '');
  const figure = page.match(/<figure class="structure-figure">[\s\S]*?<\/figure>/)?.[0] ?? '';

  test('the SVG is an image named and described by its own title and desc', () => {
    const svg = figure.match(/<svg [^>]*>/)[0];
    assert.match(svg, /role="img"/);
    const [, titleId, descId] = svg.match(/aria-labelledby="([^" ]+) ([^" ]+)"/);
    assert.match(figure, new RegExp(`<title id="${titleId}">${data.title}</title>`));
    assert.match(figure, new RegExp(`<desc id="${descId}">[^<]+</desc>`));
    assert.doesNotMatch(figure, /<img\b|<image\b/);
  });

  test(`the figure carries its Fig. 1 caption, a legend of ${data.legend.length} and the detail card as a polite live region`, () => {
    assert.match(figure, new RegExp(`<figcaption>Fig\\. 1 · ${data.caption}</figcaption>`));
    assert.equal((figure.match(/<ul class="structure-figure__legend"[\s\S]*?<\/ul>/)[0].match(/<li>/g) ?? []).length, data.legend.length);
    assert.match(figure, /<div class="structure-figure__card" aria-live="polite">/);
  });

  test('every part and slab has a name in the picture and one button', () => {
    const names = [...figure.matchAll(/<text class="fig-label[^"]*"[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]);
    const buttons = [...figure.matchAll(/<button type="button" aria-pressed="false">([^<]+)<\/button>/g)].map((m) => m[1]);
    const labels = [...data.parts, ...data.slabs].map((i) => i.label);
    assert.deepEqual(names.sort(), [...labels].sort());
    assert.deepEqual(buttons.sort(), [...labels].sort());
  });

  test(`the picture has no arrow heads and draws its ${remoteLinks} remote links dashed`, () => {
    const svg = figure.match(/<svg class="fig-svg"[\s\S]*?<\/svg>/)[0];
    assert.ok(!/marker-end|arrow/i.test(svg));
    assert.equal((svg.match(/class="fig-link fig-link-remote"/g) ?? []).length, remoteLinks);
  });

  test('search indexes the labels of the figure', () => {
    const text = searchText(url);
    for (const label of searchLabels) assert.ok(text.includes(label), label);
  });

  return { page, figure };
}

/** The indexed text of every search document at `url` or under it. */
export function searchText(url) {
  const index = JSON.parse(readFileSync(join(root, 'build/search-index.json'), 'utf8'));
  return index
    .flatMap((entry) => entry.documents)
    .filter((doc) => doc.u.startsWith(url))
    .map((doc) => doc.t)
    .join(' ');
}
