import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { installedSdkVersion } from './starter-sync.mjs';
import { linksOf, section } from './page-helpers.mjs';

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

test('the overview names the SDK version it describes', () => {
  assert.match(text, new RegExp(`\`@vectoragents/vs-apps\` ${installedSdkVersion().replaceAll('.', '\\.')}\\b`));
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
