import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const url = '/vector-apps/how-a-vector-app-works';
const page = readFileSync(join(root, 'build', url, 'index.html'), 'utf8');
const diagram = page.match(/<div class="iso-diagram">[\s\S]*?<\/figure>/)?.[0] ?? '';

test('the diagram is inline SVG with a name and a description from its own title and desc', () => {
  assert.ok(diagram, 'the page holds an iso-diagram');
  const svg = diagram.match(/<svg [^>]*>/)[0];
  assert.match(svg, /role="img"/);
  const [, titleId, descId] = svg.match(/aria-labelledby="([^" ]+) ([^" ]+)"/);
  assert.match(diagram, new RegExp(`<title id="${titleId}">[^<]+</title>`));
  assert.match(diagram, new RegExp(`<desc id="${descId}">[^<]+</desc>`));
  assert.doesNotMatch(diagram, /<img\b|<image\b/);
});

test('the figure carries a Fig. 1 caption', () => {
  assert.match(diagram.replaceAll('<!-- -->', ''), /<figcaption>Fig\. 1 · [^<]+<\/figcaption>/);
});

test('the legend lists five numbered parts and the four token-path letters under the diagram', () => {
  const legend = page.match(/<div class="iso-legend">[\s\S]*?<\/div>/)[0];
  const keys = [...legend.matchAll(/<span class="iso-key[^"]*">([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(keys, ['1', '2', '3', '4', '5', 'a', 'b', 'c', 'd']);
});

test('search indexes the SVG text and the words of neighbouring SVG elements stay apart', () => {
  const index = JSON.parse(readFileSync(join(root, 'build/search-index.json'), 'utf8'));
  const text = index
    .flatMap((part) => part.documents)
    .filter((doc) => doc.u === url && doc.t.includes('Fig. 1'))
    .map((doc) => doc.t)
    .join(' ');
  assert.ok(text, 'the section that holds the diagram is indexed');
  assert.match(text, /How a Vector App fits in a space Vector Space embeds your client/);
  assert.match(text, /Vector Space Your origin/);
  assert.doesNotMatch(text, /spaceVector|SpaceYour|\d{3,}/);
});

const glance = readFileSync(join(root, 'build/vector-space/vector-space-at-a-glance/index.html'), 'utf8');

test('the Space diagram is Fig. 1 on the glance page, with eight numbered parts and no lettered line', () => {
  const figure = glance.match(/<div class="iso-diagram">[\s\S]*?<\/figure>/)?.[0] ?? '';
  assert.match(figure, /<svg [^>]*role="img"/);
  assert.match(figure.replaceAll('<!-- -->', ''), /<figcaption>Fig\. 1 · [^<]+<\/figcaption>/);
  const legend = glance.match(/<div class="iso-legend">[\s\S]*?<\/div>/)[0];
  const keys = [...legend.matchAll(/<span class="iso-key[^"]*">([^<]+)<\/span>/g)].map((m) => m[1]);
  assert.deepEqual(keys, ['1', '2', '3', '4', '5', '6', '7', '8']);
});
