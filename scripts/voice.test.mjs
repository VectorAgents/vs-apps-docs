import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import {
  contractionViolations,
  dashViolations,
  descriptionViolations,
  linkTextViolations,
  voiceViolations,
} from './voice.mjs';

const words = (n) => Array.from({ length: n }, () => 'word').join(' ');
const rules = (md) => voiceViolations(md).map((v) => v.rule);

test('sentence-length: 35 words pass, 36 fail, in prose and list items', () => {
  assert.deepEqual(rules(`${words(35)}.`), []);
  assert.deepEqual(rules(`${words(36)}.`), ['sentence-length']);
  assert.deepEqual(rules(`1. ${words(36)}.`), ['sentence-length']);
});

test('paragraph-length: 5 sentences pass, 6 fail', () => {
  assert.deepEqual(rules('One. Two. Three. Four. Five.'), []);
  assert.deepEqual(rules('One. Two. Three. Four. Five. Six.'), ['paragraph-length']);
});

test('a semicolon and a 21-word step are not violations', () => {
  assert.deepEqual(rules('Run it; then stop.'), []);
  assert.deepEqual(rules(`- ${words(21)}.`), []);
});

test('skips frontmatter, code blocks, tables and headings', () => {
  const md = [
    '---', `title: ${words(50)}`, '---',
    `# ${words(50)}`,
    '```', words(50), '```',
    `| ${words(50)} |`,
    '', 'Short.',
  ].join('\n');
  assert.deepEqual(rules(md), []);
});

test('skips the directory tree code block', () => {
  assert.deepEqual(rules(['```text', `client/ ${words(50)}`, '```'].join('\n')), []);
});

test('a list item is not part of a paragraph count', () => {
  assert.deepEqual(rules('Intro.\n- One. Two. Three. Four. Five. Six.'), []);
});

const contractions = (md) => contractionViolations(md).map((v) => v.rule);

test('contraction: flagged in prose, list items, table cells and headings', () => {
  assert.deepEqual(contractions('You do not need it.'), []);
  assert.deepEqual(contractions("You don't need it."), ['contraction']);
  assert.deepEqual(contractions("- It's here."), ['contraction']);
  assert.deepEqual(contractions("| Name | It’s a name |"), ['contraction']);
  assert.deepEqual(contractions("## What's next"), ['contraction']);
  assert.deepEqual(contractions("---\ndescription: You can't skip it.\n---\nBody."), ['contraction']);
});

test('contraction: who is, how is, where is, when is and why is forms are flagged', () => {
  for (const word of ["who's", "how's", "where's", "when's", "why's"]) {
    assert.deepEqual(contractions(`See ${word} next.`), ['contraction'], word);
  }
});

test('contraction: a possessive passes', () => {
  assert.deepEqual(contractions("Maya's request reaches Acme's space."), []);
});

test('contraction: allowed in code spans, codeblocks and link targets', () => {
  assert.deepEqual(contractions("Use `don't` here."), []);
  assert.deepEqual(contractions(["```ts", "// don't", "```"].join('\n')), []);
  assert.deepEqual(contractions("[Page](./it's.md)"), []);
});

const dashes = (md) => dashViolations(md).map((v) => v.rule);

test('dash: em dash, en dash and spaced hyphen are flagged in prose, tables and headings', () => {
  assert.deepEqual(dashes('One \u2014 two.'), ['dash']);
  assert.deepEqual(dashes('Pages 2\u20133.'), ['dash']);
  assert.deepEqual(dashes('One - two.'), ['dash']);
  assert.deepEqual(dashes('| One | a - b |'), ['dash']);
  assert.deepEqual(dashes('## One \u2014 two'), ['dash']);
});

test('dash: a compound hyphen, a list marker and a table rule pass', () => {
  assert.deepEqual(dashes('A well-known, read-only page.'), []);
  assert.deepEqual(dashes('- One\n  - Two\n1. Three'), []);
  assert.deepEqual(dashes('| A | B |\n| --- | :-: |'), []);
  assert.deepEqual(dashes('---\ntitle: A\n---\nBody.'), []);
});

test('dash: allowed in code spans and codeblocks', () => {
  assert.deepEqual(dashes('Run `a - b` and `a \u2014 b`.'), []);
  assert.deepEqual(dashes(['```text', 'a - b \u2014 c', '```'].join('\n')), []);
});

const links = (md) => linkTextViolations(md).map((v) => v.rule);

test('link-text: here, this page, read more, learn more and a bare URL are flagged', () => {
  assert.deepEqual(links('See [here](./a.md).'), ['link-text']);
  assert.deepEqual(links('See [This page](./a.md).'), ['link-text']);
  assert.deepEqual(links('[Read more](./a.md)'), ['link-text']);
  assert.deepEqual(links('[learn more](./a.md)'), ['link-text']);
  assert.deepEqual(links('[https://example.com/a](https://example.com/a)'), ['link-text']);
  assert.deepEqual(links('<Link to="/a">here</Link>'), ['link-text']);
});

test('link-text: a link that names its target passes, and a banned phrase inside a longer label passes', () => {
  assert.deepEqual(links('See [the quickstart](./quickstart.md) and [what is here](./a.md).'), []);
  assert.deepEqual(links('![here](./a.png)'), []);
  assert.deepEqual(links('`[here](./a.md)`'), []);
});

const descriptions = (md) => descriptionViolations(md).map((v) => v.rule);
const page = (description) => `---\ntitle: T\n${description}---\nBody.`;

test('description: missing, empty, over 160 characters and banned openers are flagged', () => {
  assert.deepEqual(descriptions('---\ntitle: T\n---\nBody.'), ['description']);
  assert.deepEqual(descriptions('No front matter.'), ['description']);
  assert.deepEqual(descriptions(page('description:\n')), ['description']);
  assert.deepEqual(descriptions(page(`description: ${'a'.repeat(161)}\n`)), ['description']);
  assert.deepEqual(descriptions(page('description: This page lists the exports.\n')), ['description']);
  assert.deepEqual(descriptions(page('description: Learn what a space is.\n')), ['description']);
  assert.deepEqual(descriptions(page('description: Learn more about spaces.\n')), ['description']);
});

test('description: 160 characters and a plain opener pass, quoted or not', () => {
  assert.deepEqual(descriptions(page(`description: ${'a'.repeat(160)}\n`)), []);
  assert.deepEqual(descriptions(page('description: Gate an app page by capability.\n')), []);
  assert.deepEqual(descriptions(page('description: "Gate an app page: by capability."\n')), []);
  assert.deepEqual(descriptions(page(`description: "${'a'.repeat(160)}"\n`)), []);
});

const docsDir = fileURLToPath(new URL('../docs/', import.meta.url));
const pages = readdirSync(docsDir, { recursive: true })
  .filter((file) => /\.mdx?$/.test(file))
  .map((file) => ({ file, markdown: readFileSync(join(docsDir, file), 'utf8') }));

for (const [name, check] of [
  ['no contractions', contractionViolations],
  ['no em dash, en dash or spaced hyphen', dashViolations],
  ['no banned link text', linkTextViolations],
  ['a description of at most 160 characters with no banned opener', descriptionViolations],
]) {
  test(`every page under docs/: ${name}`, () => {
    assert.ok(pages.length > 40);
    const found = pages.flatMap(({ file, markdown }) => check(markdown).map((v) => `${file}: ${v.text}`));
    assert.deepEqual(found, []);
  });
}
