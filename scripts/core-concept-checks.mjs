import assert from 'node:assert/strict';
import { bodyOf } from './page-helpers.mjs';

const BANNED_OPENER = /^(?:This page|Learn)\b/;
const BANNED_LINK_TEXT = /^(?:here|this page|read more|learn more|https?:\/\/\S+)$/i;
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
