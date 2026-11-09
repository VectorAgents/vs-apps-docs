import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { storageKey } from '../../src/flavours/head-script.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '../..');
const config = JSON.parse(readFileSync(join(root, 'flavours.config.json'), 'utf8'));
const { pages } = JSON.parse(readFileSync(join(root, config.outDir, 'flavours.json'), 'utf8'));
const html = (url) => readFileSync(join(root, 'build', url === '/' ? '' : url, 'index.html'), 'utf8');
const head = (page) => page.slice(0, page.indexOf('</head>'));

test('every page sets the flavours on <html> from an inline head script before the body', () => {
  for (const url of ['/', ...pages.map((page) => page.url)]) {
    const script = /<script>([^<]*)<\/script>/g;
    const ours = [...head(html(url)).matchAll(script)].map((m) => m[1]).find((code) => code.includes(storageKey));
    assert.ok(ours, `${url}: head script`);
    assert.match(ours, /documentElement\.setAttribute\("data-"\s*\+/, url);
  }
});

test('every page carries the rules that hide the blocks and contents entries of other flavours', () => {
  for (const [axis, flavours] of Object.entries(config.axes)) {
    for (const flavour of Object.keys(flavours)) {
      const start = head(html('/'));
      assert.ok(start.includes(`html[data-${axis}]:not([data-${axis}="${flavour}"]) .flavour-block[data-axis="${axis}"][data-flavour="${flavour}"]{display:none}`), `${axis} ${flavour}`);
      assert.ok(start.includes(`li:has(> a[href^="#${flavour}-"]){display:none}`), `contents ${flavour}`);
    }
  }
});

test('the entry page holds no flavour block, and every page has the picker in its navbar', () => {
  assert.doesNotMatch(html('/'), /class="flavour-block"/);
  for (const url of ['/', ...pages.map((page) => page.url)]) assert.match(html(url), /class="flavour-picker/, url);
});

test('the picker is hidden on every page that holds no flavour block', () => {
  const css = readFileSync(join(root, 'src/css/custom.css'), 'utf8');
  assert.match(css, /html:not\(:has\(\.flavour-block\)\) \.flavour-picker \{\s*display: none;/);
});

for (const { source, url } of pages) {
  const ids = [...readFileSync(join(root, config.outDir, 'site', source), 'utf8').matchAll(/\{#([^}\s]+)\}$/gm)].map((m) => m[1]);
  test(`${url}: each heading id in a block is prefixed with a flavour, on the heading and in the contents`, () => {
    const flavours = Object.values(config.axes).flatMap((names) => Object.keys(names));
    const page = html(url);
    for (const id of ids) {
      assert.ok(flavours.some((flavour) => id.startsWith(`${flavour}-`)), id);
      assert.ok(page.includes(`id="${id}"`), `heading ${id}`);
      assert.ok(page.includes(`href="#${id}"`), `contents ${id}`);
    }
  });
}

for (const { source, url } of pages) {
  const todos = [...readFileSync(join(root, config.outDir, 'site', source), 'utf8').matchAll(/data-target="([^"]+)"/g)].map((m) => m[1]);
  if (!todos.length) continue;
  test(`${url}: each todo notice has a switch button whose target block is on the page`, () => {
    const page = html(url);
    assert.match(page, /Not yet written for /);
    for (const target of todos) {
      assert.ok(page.includes(`data-target="${target}"`), `button ${target}`);
      assert.match(page, new RegExp(`class="flavour-block"[^>]*id="${target}"`), `block ${target}`);
    }
  });
}
