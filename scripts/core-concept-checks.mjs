import assert from 'node:assert/strict';
import { bodyOf } from './page-helpers.mjs';
import { contractionViolations, dashViolations, descriptionViolations, linkTextViolations } from './voice.mjs';

const DIRECTIONAL = /\b(?:above|as shown|earlier)\b/i;

/** The prose of `text` with front matter, imports, codeblocks and figure tags removed and each link reduced to its label. */
const proseOf = (text) =>
  bodyOf(text).replace(/^import .*$/gm, '').replace(/^\s*(?:[-*]|\d+\.) /gm, '').replace(/^```[\s\S]*?^```/gm, '').replace(/<[A-Z]\w+[^>]*\/>/g, '').replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

/**
 * Checks the rules of the Core concepts pages that need no page-specific wording: P1 description, P2 link text,
 * P3 directional words, V7 dashes, V9 contractions, and C8 parts list (a list item that opens with bold has a colon after it).
 */
export function assertCoreRules(text) {
  const description = text.match(/^description: (.+)$/m)?.[1];
  assert.deepEqual(descriptionViolations(text), []);
  assert.equal(description.split(/(?<=[.!?])\s+/).length, 1, 'description is one sentence');
  assert.deepEqual(linkTextViolations(text), []);
  assert.deepEqual(dashViolations(text), []);
  assert.deepEqual(contractionViolations(text), []);

  const prose = proseOf(text);
  assert.doesNotMatch(prose, DIRECTIONAL);
  assert.doesNotMatch(prose, /\b(?:bedrock|absolute|heavily governed|seamless|powerful|robust|simply|just|easily)\b/i, 'no intensifier');

  for (const item of bodyOf(text).split('\n').filter((l) => /^\s*- \*\*/.test(l))) {
    assert.match(item, /^\s*- \*\*(?:[^*]|\*(?!\*))+\*\*: /, `parts list item needs a bold term and a colon: ${item.slice(0, 60)}`);
  }
}
