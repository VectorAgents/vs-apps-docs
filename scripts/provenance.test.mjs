import assert from 'node:assert/strict';
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const url = new URL('../.agents/provenance.md', import.meta.url);
const text = readFileSync(url, 'utf8');
const lostFolders = ['quickstart-review', 'quickstart-review-build', 'quickstart-revamp'];
const linkTargets = [...text.matchAll(/\]\(([^)]+)\)/g)].map(([, target]) => target);

test('no link points into a lost scratch folder', () => {
  for (const folder of lostFolders) {
    assert.ok(!linkTargets.some((target) => target.includes(`.scratch/${folder}/`)), folder);
  }
});

test('every relative link outside .scratch resolves', () => {
  const relative = linkTargets.filter((target) => !target.startsWith('#') && !target.includes('.scratch/') && !/^[a-z]+:/.test(target));
  assert.ok(relative.length > 0);
  for (const target of relative) assert.ok(existsSync(new URL(target.split('#')[0], url)), target);
});

test('no runbook or CLAUDE.md names a master doc under the old systems/ folder', () => {
  const agents = new URL('../.agents/', import.meta.url);
  const files = readdirSync(agents).filter((name) => name.endsWith('.md')).map((name) => new URL(name, agents));
  files.push(new URL('../CLAUDE.md', import.meta.url));
  for (const file of files) assert.doesNotMatch(readFileSync(file, 'utf8'), /(^|[^\w-])systems\//m, file.pathname);
});
