import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { approvalsFlow } from '../../src/diagrams/figures/approvals-flow.ts';
import { extendingFlow } from '../../src/diagrams/figures/extending-flow.ts';
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

const flows = [
  { data: approvalsFlow, page: 'approvals-and-the-command-center', title: 'Three ways a write is cleared', legend: 2, pills: 3 },
  { data: extendingFlow, page: 'extending-a-space', title: 'How a space calls outside code', legend: 4, pills: 4 },
];

for (const { data, page: slug, title, legend, pills } of flows) {
  const html = readFileSync(join(root, 'build/vector-space', slug, 'index.html'), 'utf8').replaceAll('<!-- -->', '');
  const flow = html.match(/<figure class="flow-figure">[\s\S]*?<\/figure>/)?.[0] ?? '';
  const picture = flow.match(/<svg class="fig-svg"[\s\S]*?<\/svg>/)?.[0] ?? '';

  test(`${data.id}: the page shows the real flow figure with its Fig. 1 caption, and no placeholder`, () => {
    assert.ok(flow, 'the page holds a flow figure');
    assert.ok(!html.includes('figure-placeholder'));
    assert.ok(flow.includes(`<figcaption>Fig. 1 · ${data.caption}</figcaption>`));
  });

  test(`${data.id}: the SVG is an image named and described by its own title and desc, with a name on every part and slab`, () => {
    assert.match(picture, /role="img"/);
    assert.match(picture, new RegExp(`<title id="[^"]+">${title}</title>`));
    assert.match(picture, /<desc id="[^"]+">[^<]+<\/desc>/);
    const names = [...picture.matchAll(/<text class="fig-label[^"]*"[^>]*>([^<]+)<\/text>/g)].map((m) => m[1]);
    assert.deepEqual(names.sort(), [...data.parts, ...data.slabs].map((i) => i.label).sort());
  });

  test(`${data.id}: the legend has ${legend} items, the pills number the ${pills} steps and all work, and the caption is a polite live region`, () => {
    assert.equal((flow.match(/<ul class="[^"]*structure-figure__legend"[\s\S]*?<\/ul>/)[0].match(/<li>/g) ?? []).length, legend);
    const found = [...flow.matchAll(/<button type="button"( disabled="")? aria-label="Step (\d)"[^>]*>(\d)<\/button>/g)];
    assert.deepEqual(found.map((m) => m[3]), Array.from({ length: pills }, (_, i) => String(i + 1)));
    assert.ok(found.every((m) => m[1] === undefined));
    assert.match(flow, /<p class="flow-figure__caption" aria-live="polite">[^<]+/);
  });

  test(`${data.id}: the record of work is a real table with no row at rest, and the text version is a collapsed list of the steps`, () => {
    const table = flow.match(/<table>[\s\S]*?<\/table>/)?.[0] ?? '';
    assert.match(table, /<caption>Record of work<\/caption>/);
    assert.equal((table.match(/<th scope="col">/g) ?? []).length, 2);
    assert.ok(!/<td>/.test(table));
    const details = flow.match(/<details class="flow-figure__text">[\s\S]*?<\/details>/)?.[0] ?? '';
    assert.ok(details && !/<details[^>]* open/.test(details));
    assert.equal((details.match(/<li>/g) ?? []).length, data.steps.length);
  });

  test(`${data.id}: one icon button plays, pauses and replays`, () => {
    assert.equal((flow.match(/class="flow-figure__play"/g) ?? []).length, 1);
  });
}
