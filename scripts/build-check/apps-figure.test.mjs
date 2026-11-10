import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { appsOverview } from '../../src/diagrams/figures/apps-overview.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const url = '/vector-apps/how-a-vector-app-works';
const page = readFileSync(join(root, 'build', url, 'index.html'), 'utf8').replaceAll('<!-- -->', '');
const figure = page.match(/<figure class="structure-figure">[\s\S]*?<\/figure>/)?.[0] ?? '';

test('the page holds one structure figure and no iso-diagram markup', () => {
  assert.ok(figure, 'the page holds a structure figure');
  assert.equal(page.match(/<figure class="structure-figure">/g)?.length, 1);
  assert.doesNotMatch(page, /iso-diagram|iso-legend|iso-badge/);
});

test('the SVG is an image named and described by its own title and desc', () => {
  const svg = figure.match(/<svg [^>]*>/)[0];
  assert.match(svg, /role="img"/);
  const [, titleId, descId] = svg.match(/aria-labelledby="([^" ]+) ([^" ]+)"/);
  assert.match(figure, new RegExp(`<title id="${titleId}">${appsOverview.title}</title>`));
  assert.match(figure, new RegExp(`<desc id="${descId}">[^<]+</desc>`));
  assert.doesNotMatch(figure, /<img\b|<image\b/);
});

test('the figure carries a Fig. 1 caption, a legend of 3 and the detail card as a polite live region', () => {
  assert.match(figure, new RegExp(`<figcaption>Fig\\. 1 · ${appsOverview.caption}</figcaption>`));
  assert.equal((figure.match(/<ul class="structure-figure__legend"[\s\S]*?<\/ul>/)[0].match(/<li>/g) ?? []).length, 3);
  assert.match(figure, /<div class="structure-figure__card" aria-live="polite">/);
});

test('every part and slab has a name in the picture and one button', () => {
  const names = [...figure.matchAll(/<text class="fig-label[^"]*"[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]);
  const buttons = [...figure.matchAll(/<button type="button" aria-pressed="false">([^<]+)<\/button>/g)].map((m) => m[1]);
  const labels = [...appsOverview.parts, ...appsOverview.slabs].map((i) => i.label);
  assert.deepEqual(names.sort(), [...labels].sort());
  assert.deepEqual(buttons.sort(), [...labels].sort());
});

test('the picture has no arrow heads and draws its three links dashed', () => {
  const svg = figure.match(/<svg class="fig-svg"[\s\S]*?<\/svg>/)[0];
  assert.ok(!/marker-end|arrow/i.test(svg));
  assert.equal((svg.match(/class="fig-link fig-link-remote"/g) ?? []).length, 3);
  assert.equal((svg.match(/class="fig-link"/g) ?? []).length, 0);
});

test('search indexes the labels of the figure', () => {
  const index = JSON.parse(readFileSync(join(root, 'build/search-index.json'), 'utf8'));
  const text = index
    .flatMap((part) => part.documents)
    .filter((doc) => doc.u === url)
    .map((doc) => doc.t)
    .join(' ');
  for (const label of ['Your client', 'Your server', 'Manifest', 'Platform data', 'AI gateway', 'Your origin']) assert.ok(text.includes(label), label);
  assert.doesNotMatch(text, /spaceVector|SpaceYour|\d{3,}/);
});
