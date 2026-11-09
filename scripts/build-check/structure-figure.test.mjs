import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { spaceStructure } from '../../src/diagrams/figures/space-structure.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const url = '/vector-space/what-vector-space-is';
const page = readFileSync(join(root, 'build', url, 'index.html'), 'utf8').replaceAll('<!-- -->', '');
const figure = page.match(/<figure class="structure-figure">[\s\S]*?<\/figure>/)?.[0] ?? '';

test('the overview page shows the real figure and no placeholder', () => {
  assert.ok(figure, 'the page holds a structure figure');
  assert.ok(!page.includes('figure-placeholder'));
});

test('the SVG is an image named and described by its own title and desc', () => {
  const svg = figure.match(/<svg [^>]*>/)[0];
  assert.match(svg, /role="img"/);
  const [, titleId, descId] = svg.match(/aria-labelledby="([^" ]+) ([^" ]+)"/);
  assert.match(figure, new RegExp(`<title id="${titleId}">[^<]+</title>`));
  assert.match(figure, new RegExp(`<desc id="${descId}">[^<]+</desc>`));
  assert.doesNotMatch(figure, /<img\b|<image\b/);
});

test('the figure carries its Fig. 1 caption, the legend of 3 and the detail card as a polite live region', () => {
  assert.match(figure, /<figcaption>Fig\. 1 · [^<]+<\/figcaption>/);
  assert.equal((figure.match(/<ul class="structure-figure__legend"[\s\S]*?<\/ul>/)[0].match(/<li>/g) ?? []).length, 3);
  assert.match(figure, /<div class="structure-figure__card" aria-live="polite">/);
});

test('every part and slab has a name in the picture and one button', () => {
  const names = [...figure.matchAll(/<text class="fig-label[^"]*"[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]);
  const buttons = [...figure.matchAll(/<button type="button" aria-pressed="false">([^<]+)<\/button>/g)].map((m) => m[1]);
  const labels = [...spaceStructure.parts, ...spaceStructure.slabs].map((i) => i.label);
  assert.deepEqual(names.sort(), [...labels].sort());
  assert.deepEqual(buttons.sort(), [...labels].sort());
});

test('the picture has no arrow heads and draws the three remote links dashed', () => {
  const svg = figure.match(/<svg class="fig-svg"[\s\S]*?<\/svg>/)[0];
  assert.ok(!/marker-end|arrow/i.test(svg));
  assert.equal((svg.match(/class="fig-link fig-link-remote"/g) ?? []).length, 3);
});

test('search indexes the labels of the figure', () => {
  const index = JSON.parse(readFileSync(join(root, 'build/search-index.json'), 'utf8'));
  const text = index
    .flatMap((part) => part.documents)
    .filter((doc) => doc.u.startsWith(url))
    .map((doc) => doc.t)
    .join(' ');
  for (const label of ['Orchestrator agent', 'Command Center', 'Context Hub', 'Vector Modules']) assert.ok(text.includes(label), label);
});
