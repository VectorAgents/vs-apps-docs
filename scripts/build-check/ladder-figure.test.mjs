import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { roleLadder } from '../../src/diagrams/figures/role-ladder.ts';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const url = '/vector-space/who-can-do-what';
const page = readFileSync(join(root, 'build', url, 'index.html'), 'utf8').replaceAll('<!-- -->', '');
const figure = page.match(/<figure class="ladder-figure"[\s\S]*?<\/figure>/)?.[0] ?? '';
const decode = (s) => s.replaceAll('&#x27;', "'").replaceAll('&amp;', '&');

test('the page shows the real ladder figure, no placeholder, inside the ladder H2 between the two lists', () => {
  assert.ok(figure, 'the page holds a ladder figure');
  assert.ok(!page.includes('figure-placeholder'));
  const h2 = page.split(/<h2 /).find((s) => s.includes('id="space-roles-and-share-levels"')) ?? '';
  const at = (needle) => h2.indexOf(needle);
  assert.ok(at('class="ladder-figure"') > at('>Space admin</a>'), 'after the space-roles list');
  assert.ok(at('class="ladder-figure"') < at('>Can use</a>'), 'before the share-levels list');
});

test('the figure is named, described, and carries its Fig. 1 caption', () => {
  assert.match(figure, new RegExp(`<figure class="ladder-figure" role="group" aria-label="${roleLadder.title}" aria-describedby="([^"]+)"`));
  const id = figure.match(/aria-describedby="([^"]+)"/)[1];
  assert.ok(decode(figure).includes(`<p id="${id}" class="ladder-figure__desc">${roleLadder.desc}</p>`));
  assert.ok(figure.includes(`<figcaption>Fig. 1 · ${roleLadder.caption}</figcaption>`));
});

test('the steps are an ordered list of three, each with its name, its share level and its acts as real text', () => {
  const ol = figure.match(/<ol class="ladder-figure__steps">[\s\S]*?<\/ol>/)?.[0] ?? '';
  const items = ol.split(/<li class="ladder-figure__step"/).slice(1);
  assert.equal(items.length, 3);
  items.forEach((item, i) => {
    const step = roleLadder.steps[i];
    assert.ok(item.includes(`<span class="ladder-figure__name">${step.label}</span>`), step.id);
    assert.ok(item.includes(`<span class="ladder-figure__tag">${step.holds}</span>`), step.id);
    if (step.plus) assert.ok(item.includes(`>${step.plus}</p>`), step.id);
    for (const act of step.adds) assert.ok(decode(item).includes(`<li>${act}</li>`), act);
  });
});

test('the custom role and the organization admin are two dashed side boxes, outside the ordered list', () => {
  const asides = figure.match(/<ul class="ladder-figure__asides">[\s\S]*?<\/ul>/)?.[0] ?? '';
  assert.equal((asides.match(/<li class="ladder-figure__aside"/g) ?? []).length, 2);
  for (const a of roleLadder.asides) assert.ok(decode(asides).includes(`<strong>${a.label}</strong> ${a.text}`), a.id);
});

test('there is no hover or button path: no button, no link, no details, no SVG', () => {
  assert.doesNotMatch(figure, /<button|<a |<details|<svg|tabindex/);
});

test('the stylesheet stacks the steps on a narrow screen and has no hard-coded colour in the ladder rules', () => {
  const dir = join(root, 'build/assets/css');
  const css = readdirSync(dir).map((f) => readFileSync(join(dir, f), 'utf8')).join('\n');
  assert.match(css, /\.ladder-figure__steps\{[^}]*flex-direction:column-reverse/);
  assert.match(css, /\.ladder-figure__step\{[^}]*margin-left:calc\(var\(--i\)\*6%\)/);
  assert.match(css, /@media \(max-width:700px\)\{\.ladder-figure__steps\{flex-direction:column\}\.ladder-figure__step\{margin-left:0\}/);
  const rules = [...css.matchAll(/\.ladder-figure[^{]*\{[^}]*\}/g)].map((m) => m[0]).join('\n');
  assert.doesNotMatch(rules, /#[0-9a-f]{3,8}\b|rgb\(/i);
});

test('search indexes the step names, the acts and the asides', () => {
  const index = JSON.parse(readFileSync(join(root, 'build/search-index.json'), 'utf8'));
  const text = index
    .flatMap((part) => part.documents)
    .filter((doc) => doc.u.startsWith(url))
    .map((doc) => doc.t)
    .join(' ');
  for (const step of roleLadder.steps) {
    assert.ok(text.includes(step.holds), step.holds);
    for (const act of step.adds) assert.ok(text.includes(act), act);
  }
  for (const a of roleLadder.asides) assert.ok(text.includes(a.text), a.id);
});
