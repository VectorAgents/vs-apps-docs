import assert from 'node:assert/strict';
import { bodyOf, linksOf, section } from './page-helpers.mjs';

const BANNED_OPENER = /^(?:This page|Learn)\b/;
const BANNED_LINK_TEXT = /^(?:here|this page|read more|learn more|https?:\/\/\S+)$/i;
const DIRECTIONAL = /\b(?:above|as shown|earlier)\b/i;

/** The prose of `text` with front matter, imports, codeblocks and figure tags removed and each link reduced to its label. */
const proseOf = (text) =>
  bodyOf(text).replace(/^import .*$/gm, '').replace(/^\s*(?:[-*]|\d+\.) /gm, '').replace(/^```[\s\S]*?^```/gm, '').replace(/<[A-Z]\w+[^>]*\/>/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

/** T1: a glossary term is linked once per page, and a sentence carries at most 3 glossary links. */
export function assertGlossaryLinks(text) {
  const body = bodyOf(text);
  const targets = [...body.matchAll(/\]\(([^)]*glossary\.md#[^)]+)\)/g)].map((m) => m[1]);
  const twice = targets.filter((t, i) => targets.indexOf(t) !== i);
  assert.deepEqual([...new Set(twice)], [], 'a glossary term is linked once per page');
  for (const line of body.split('\n')) {
    for (const sentence of line.split(/(?<=[.!?])\s+/)) {
      const count = [...sentence.matchAll(/\]\([^)]*glossary\.md#/g)].length;
      assert.ok(count <= 3, `${count} glossary links in one sentence: ${sentence.slice(0, 70)}`);
    }
  }
}

/**
 * Checks the rules of the Core concepts pages that need no page-specific wording: P1 description, P2 link text,
 * P3 directional words, V7 dashes, V9 contractions, and C8 parts list (a list item that opens with bold has a colon after it).
 */
export function assertCoreRules(text) {
  const description = text.match(/^description: (.+)$/m)?.[1];
  assert.ok(description, 'description');
  assert.ok(description.length <= 160, `description is ${description.length} characters`);
  assert.doesNotMatch(description, BANNED_OPENER);
  assert.equal(description.split(/(?<=[.!?])\s+/).length, 1, 'description is one sentence');

  for (const [, label] of bodyOf(text).matchAll(/\[([^\]]*)\]\([^)]*\)/g)) assert.doesNotMatch(label, BANNED_LINK_TEXT, `link text "${label}"`);

  const prose = proseOf(text);
  assert.doesNotMatch(prose, DIRECTIONAL);
  assert.doesNotMatch(prose, /[–—]| - /, 'no em dash, en dash or spaced hyphen');
  assert.doesNotMatch(prose, /\b(?:\w+n['’]t|\w+['’](?:re|ve|ll|d|m)|(?:it|that|there|here|what|let|he|she|who|how|where|when|why)['’]s)\b/i, 'no contraction');
  assert.doesNotMatch(prose, /\b(?:bedrock|absolute|heavily governed|seamless|powerful|robust|simply|just|easily)\b/i, 'no intensifier');

  for (const item of bodyOf(text).split('\n').filter((l) => /^\s*- \*\*/.test(l))) {
    assert.match(item, /^\s*- \*\*(?:[^*]|\*(?!\*))+\*\*: /, `parts list item needs a bold term and a colon: ${item.slice(0, 60)}`);
  }
}

/**
 * Checks C4: the last section "Where to go next" is a result sentence ("You now know ..."), one primary next step as a
 * sentence with its link, a "Related" label with up to 3 links, and a closing sentence that links the glossary.
 * `next` is the primary link, `related` the Related links in order.
 */
export function assertConceptEnding(text, { next, related }) {
  const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);
  assert.equal(headings.at(-1), 'Where to go next');
  const ending = section(text, 'Where to go next').replace(/^Where to go next\n+/, '').trim();
  const [lead, label, ...rest] = ending.split(/\n\n+/);
  const sentences = lead.split(/(?<=[.!?])\s+/);
  assert.match(sentences[0], /^You now know /, 'result sentence');
  assert.deepEqual(linksOf(sentences[0]), [], 'the result sentence has no link');
  assert.deepEqual(linksOf(sentences.slice(1).join(' ')), [next], 'one primary next step');
  assert.equal(label, '**Related**');
  const list = rest.shift();
  assert.ok(related.length >= 1 && related.length <= 3);
  assert.deepEqual(list.split('\n').map((l) => l.match(/^- \[[^\]]+\]\(([^)]+)\): \S/)?.[1]), related);
  assert.equal(rest.length, 1, 'the glossary sentence closes the page');
  assert.match(rest[0], /^Look up any term in the \[Vector Space glossary\]\(\.\/glossary\.md\)\.$/);
}
