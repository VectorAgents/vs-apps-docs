import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/why-vector-space.md');
const text = readFileSync(file, 'utf8');

const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

test('the page runs what it is for, who it is for, the three platform rules, next steps', () => {
  assert.deepEqual(headings, ['What Vector Space is for', 'Who it is for', 'The three platform rules', 'Where to go next']);
});

test('the page opens with the definition of Vector Space', () => {
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
  assert.match(body, /^\[Vector Space\]\(\.\/glossary\.md#vector-space\) is the platform /);
});

test('every link resolves, and the page links What Vector Space is, Why Vector Apps and the glossary', () => {
  const links = linksOf(text);
  for (const link of links) {
    const [path, anchor] = link.split('#');
    assert.ok(existsSync(resolve(dirname(file), path)), link);
    if (anchor && path.endsWith('glossary.md')) {
      const terms = readFileSync(resolve(dirname(file), path), 'utf8').split('\n').filter((l) => l.startsWith('### '));
      assert.ok(terms.some((l) => l.slice(4).toLowerCase().replaceAll(' ', '-') === anchor), link);
    }
  }
  for (const target of ['./what-vector-space-is.md', '../vector-apps/why-vector-apps.md', './glossary.md']) assert.ok(links.includes(target), target);
});

test('the three platform rules are one access model, one AI gateway and one record of work, as a list', () => {
  const rules = section(text, 'The three platform rules');
  assert.deepEqual([...rules.matchAll(/^- \*\*(.+?)\.\*\*/gm)].map((m) => m[1]), ['One access model', 'One AI gateway', 'One record of work']);
});

test('the page says who it is for: members, an Organization admin, space managers and people who add code', () => {
  const who = section(text, 'Who it is for');
  for (const term of ['Members', 'Organization admin', 'space managers']) assert.ok(who.includes(term), term);
});

test('the page names no Vector Module and no master doc', () => {
  assert.doesNotMatch(text, /\b(omnibox|contacts|calendar)\b/i);
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|APPS|GLOSSARY|README)\.md/);
});

test('the page writes Vector Space for the platform, space for the place, and never workspace', () => {
  assert.doesNotMatch(text, /workspace/i);
  assert.doesNotMatch(text, /(?<!Vector )\bSpace\b/);
});

test('the page follows the voice checks', () => assert.deepEqual(voiceViolations(text), []));
