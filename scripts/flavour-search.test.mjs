import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { rankByFlavour } from '../src/flavours/search.mjs';

const axes = { client: { react: 'React' }, server: { node: 'Node.js + TypeScript', nest: 'Nest.js' } };
const site = { axes, defaults: { client: 'react', server: 'node' } };
const shown = { client: 'react', server: 'node' };

const page = (t) => ({ i: 100, t, b: [] });
const hit = (id, h, p = page('Quickstart')) => ({ document: { i: id, t: `hit ${id}`, h }, type: 1, page: p, isInterOfTree: true });
const ids = (results) => results.map((r) => r.document.i);
const markTrees = (results) => results.forEach((r, i) => (r.treed = i));

test('hits of the reader flavour and unprefixed anchors rank before hits of another flavour, in their order', () => {
  const ranked = rankByFlavour([hit(1, '#nest-start'), hit(2, '#node-start'), hit(3, '#intro'), hit(4, undefined), hit(5, '#nest-end')], site, shown, markTrees);
  assert.deepEqual(ids(ranked), [2, 3, 4, 1, 5]);
});

test('the order follows the reader: a Nest.js reader gets the Nest.js hits first', () => {
  const ranked = rankByFlavour([hit(1, '#node-start'), hit(2, '#nest-start')], site, { ...shown, server: 'nest' }, markTrees);
  assert.deepEqual(ids(ranked), [2, 1]);
});

test('a hit of another flavour carries the flavour in front of its page title, and the others stay untouched', () => {
  const [own, other] = rankByFlavour([hit(1, '#nest-start'), hit(2, '#node-start')], site, shown, markTrees);
  assert.equal(own.page.t, 'Quickstart');
  assert.equal(other.page.t, 'only in Nest.js · Quickstart');
});

test('flagging copies the page, so the shared page object keeps its title', () => {
  const shared = page('Quickstart');
  rankByFlavour([hit(1, '#nest-start', shared)], site, shown, markTrees);
  assert.equal(shared.t, 'Quickstart');
});

test('a hit with no page, such as a title hit, is ranked and not flagged', () => {
  const title = { document: { i: 9, t: 'Quickstart', u: '/quickstart' }, type: 0, page: false };
  assert.deepEqual(ids(rankByFlavour([title], site, shown, markTrees)), [9]);
});

test('tree flags are cleared and recomputed once on the new order', () => {
  const ranked = rankByFlavour([hit(1, '#nest-start'), hit(2, '#node-start')], site, shown, markTrees);
  assert.deepEqual(ranked.map((r) => r.treed), [0, 1]);
  assert.ok(ranked.every((r) => !('isInterOfTree' in r) && !('isLastOfTree' in r)));
});

test('the search plugin still has the seam that the flavour ranking replaces', () => {
  const dir = join(dirname(createRequire(import.meta.url).resolve('@easyops-cn/docusaurus-search-local/package.json')), 'dist/client/client/theme');
  const worker = readFileSync(join(dir, 'searchByWorker.js'), 'utf8');
  assert.match(worker, /export async function searchByWorker\(/);
  assert.match(worker, /export async function fetchIndexesByWorker\(/);
  for (const component of ['SearchBar/SearchBar.jsx', 'SearchPage/SearchPage.jsx']) {
    assert.match(readFileSync(join(dir, component), 'utf8'), /import \{[^}]*searchByWorker[^}]*\} from "\.\.\/searchByWorker";/, component);
  }
  const tree = join(dir, '../utils/processTreeStatusOfSearchResults.js');
  assert.match(readFileSync(tree, 'utf8'), /export function processTreeStatusOfSearchResults\(/);
});
