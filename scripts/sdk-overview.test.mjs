import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { installedSdkVersion } from './starter-sync.mjs';
import { linksOf, section } from './page-helpers.mjs';
import { descriptionOf, longCells, overlong, tablesOf, withoutCode } from './sdk-page-helpers.mjs';

const file = fileURLToPath(new URL('../docs/sdk/overview.md', import.meta.url));
const text = readFileSync(file, 'utf8');
const pkg = JSON.parse(readFileSync(new URL('../node_modules/@vectoragents/vs-apps/package.json', import.meta.url), 'utf8'));

const importPath = (subpath) => (subpath === '.' ? '@vectoragents/vs-apps' : `@vectoragents/vs-apps/${subpath.slice(2)}`);
const subpaths = Object.keys(pkg.exports).filter((key) => key !== './package.json');

test('the overview lists the nine subpaths of the installed package and no other', () => {
  assert.equal(subpaths.length, 9);
  const rows = section(text, 'Subpaths')
    .split('\n')
    .filter((line) => /^\| `/.test(line))
    .map((line) => line.match(/^\| `([^`]+)`/)[1]);
  assert.deepEqual(rows, subpaths.map(importPath));
});

test('the overview holds no SDK version and has a description of 160 characters or fewer', () => {
  assert.doesNotMatch(text, new RegExp(installedSdkVersion().replaceAll('.', '\\.')));
  const description = descriptionOf(text);
  assert.ok(description && description.length <= 160);
  assert.doesNotMatch(description, /^(This page|Learn)\b/);
});

test('the one table has a row per subpath: import path, one-sentence use and a link', () => {
  const tables = tablesOf(section(text, 'Subpaths'));
  assert.equal(tables.length, 1);
  assert.deepEqual(tables[0].header, ['Import', 'What it is for', 'Reference']);
  for (const row of tables[0].rows) assert.match(row[2], /^\[[^\]]+\]\([^)]+\)$/, row[0]);
  assert.deepEqual(longCells(text), []);
  assert.deepEqual(overlong(text), []);
});

test('the subpath without a reference page says where its docs are', () => {
  const nest = tablesOf(text)[0].rows.find(([importPath]) => importPath.includes('/nest'));
  assert.match(nest[2], /\(\/vector-apps\/category\/guides\)/);
});

test('the overview writes "member", never "user", and ends with Next steps of 1 to 3 links with a reason', () => {
  assert.doesNotMatch(withoutCode(text), /\busers?\b/i);
  const next = text.split(/^## /m).at(-1);
  assert.match(next, /^Next steps\n/);
  const items = next.split('\n').slice(1).filter((l) => l.trim());
  assert.ok(items.length >= 1 && items.length <= 3);
  for (const item of items) assert.match(item, /^- \[[^\]]+\]\([^)]+\): .*\S\.$/);
});

test('the overview covers the dev harness', () => {
  assert.match(section(text, 'Dev harness'), /VectorAppsHarness/);
});

test('access is stated as a fact: GitHub Packages, read:packages, ask Vector staff', () => {
  const access = section(text, 'Get access');
  assert.match(access, /GitHub Packages/);
  assert.match(access, /`read:packages`/);
  assert.match(access, /ask Vector staff/i);
  assert.doesNotMatch(access, /https?:\/\/[^\s)]*(form|mailto)|@[a-z-]+\.(com|io|ai)\b|\bform\b/i);
});

test('the page leaves out NDA text, onboarding, the dev-only claim and the old company name', () => {
  assert.doesNotMatch(text, /\bNDA\b|confidential|RedemptAI|dev only|onboarding|not yet public|public soon|publicly available/i);
});

test('every link points at an existing page', () => {
  const links = linksOf(text);
  assert.ok(links.length > 0);
  for (const link of links.filter((l) => l.startsWith('.'))) {
    assert.ok(existsSync(resolve(dirname(file), link.split('#')[0])), link);
  }
});
