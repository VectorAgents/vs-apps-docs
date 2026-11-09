import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { workedExampleFlow } from '../../src/diagrams/figures/worked-example-flow.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const url = '/vector-space/how-work-moves-through-a-space';
const page = readFileSync(join(root, 'build', url, 'index.html'), 'utf8').replaceAll('<!-- -->', '');
const figure = page.match(/<figure class="flow-figure">[\s\S]*?<\/figure>/)?.[0] ?? '';
const svg = figure.match(/<svg class="fig-svg"[\s\S]*?<\/svg>/)?.[0] ?? '';

test('the worked example page shows the real flow figure and no placeholder', () => {
  assert.ok(figure, 'the page holds a flow figure');
  assert.ok(!page.includes('figure-placeholder'));
});

test('the SVG is an image named and described by its own title and desc, and the figure has its Fig. 1 caption', () => {
  const [, titleId, descId] = svg.match(/aria-labelledby="([^" ]+) ([^" ]+)"/);
  assert.match(svg, /role="img"/);
  assert.match(svg, new RegExp(`<title id="${titleId}">How one request moves through a space</title>`));
  assert.match(svg, new RegExp(`<desc id="${descId}">[^<]+</desc>`));
  assert.match(figure, /<figcaption>Fig\. 1 · One piece of work, from a search for leads to an approved outreach email<\/figcaption>/);
});

test('every part and slab has a name in the picture, and the legend has 4 items', () => {
  const names = [...svg.matchAll(/<text class="fig-label[^"]*"[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]);
  const labels = [...workedExampleFlow.parts, ...workedExampleFlow.slabs].map((i) => i.label);
  assert.deepEqual(names.sort(), [...labels].sort());
  assert.equal((figure.match(/<ul class="[^"]*structure-figure__legend"[\s\S]*?<\/ul>/)[0].match(/<li>/g) ?? []).length, 4);
});

test('Connectors carries the marks of Apollo, Exa and BrightData, and the files are built', () => {
  const marks = [...svg.matchAll(/<image href="([^"]+)"[^>]*><title>([^<]+)<\/title>/g)];
  assert.deepEqual(marks.map((m) => m[2]), ['Apollo', 'Exa', 'BrightData']);
  for (const [, href] of marks) assert.ok(existsSync(join(root, 'build', href.replace(/^\//, ''))), href);
});

test('the figure opens at rest with the intro caption in a polite live region, and the pills number the six steps', () => {
  assert.match(figure, /<p class="flow-figure__caption" aria-live="polite">A member of a space asks for leads\./);
  const pills = [...figure.matchAll(/<button type="button"( disabled="")? aria-label="Step (\d)"[^>]*>(\d)<\/button>/g)];
  assert.deepEqual(pills.map((m) => [m[2], m[3]]), ['1', '2', '3', '4', '5', '6'].map((n) => [n, n]));
  assert.deepEqual(pills.map((m) => m[1] === undefined), [true, true, true, true, true, true], 'every step has a scene, so every pill works');
});

test('the record of work is a real table with a caption and column headers, and it has no row at rest', () => {
  const table = figure.match(/<table>[\s\S]*?<\/table>/)?.[0] ?? '';
  assert.match(table, /<caption>Record of work<\/caption>/);
  assert.equal((table.match(/<th scope="col">/g) ?? []).length, 2);
  assert.ok(!/<td>/.test(table));
});

test('the text version is a collapsed list of the six steps', () => {
  const details = figure.match(/<details class="flow-figure__text">[\s\S]*?<\/details>/)?.[0] ?? '';
  assert.ok(details && !/<details[^>]* open/.test(details));
  assert.match(details, /<summary>Text version<\/summary>/);
  assert.equal((details.match(/<li>/g) ?? []).length, 6);
});

test('one icon button plays, pauses and replays, and has an accessible name', () => {
  assert.equal((figure.match(/class="flow-figure__play"/g) ?? []).length, 1);
  assert.match(figure, /<button type="button" class="flow-figure__play" aria-label="Play" title="Play">/);
});

test('reduced motion hides the play button and shows Previous and Next, and the lit parts do not lift', () => {
  const dir = join(root, 'build/assets/css');
  const css = readdirSync(dir).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
  const reduced = [...css.matchAll(/@media \(prefers-reduced-motion:\s*reduce\)\{((?:[^{}]|\{[^}]*\})*)\}/g)].map((m) => m[1]).join('\n');
  assert.match(reduced, /\.flow-figure__move\{display:inline-block\}/);
  assert.match(reduced, /\.flow-figure__play\{display:none\}/);
  assert.match(reduced, /\.flow-figure \.fig-lit\{transform:none\}/);
});

test('search indexes the part names and the steps of the text version', () => {
  const index = JSON.parse(readFileSync(join(root, 'build/search-index.json'), 'utf8'));
  const text = index
    .flatMap((part) => part.documents)
    .filter((doc) => doc.u.startsWith(url))
    .map((doc) => doc.t)
    .join(' ');
  for (const label of ['Orchestrator agent', 'Command Center', 'AI gateway', 'Connectors']) assert.ok(text.includes(label), label);
  assert.ok(text.includes('Sending is a write'));
});
