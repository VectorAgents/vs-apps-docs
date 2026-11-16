import assert from 'node:assert/strict';
import { linksOf, section } from './page-helpers.mjs';

/** The links of `text` that point at a glossary entry (a path to a glossary file with an anchor). */
const entryLinks = (text) => linksOf(text).filter((link) => /glossary\.md#/.test(link));

/**
 * The T1 breaks of a concept page: a glossary entry linked more than once, and a sentence that links more than 3 entries.
 * Front matter and the "Where to go next" section are skipped.
 */
export const glossaryLinkProblems = (text) => {
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, '').replace(section(text, 'Where to go next'), '');
  const problems = [];
  const seen = new Set();
  for (const link of entryLinks(body)) {
    if (seen.has(link)) problems.push(`linked twice: ${link}`);
    seen.add(link);
  }
  for (const sentence of body.split(/(?<=[.!?])\s+|\n/)) {
    if (entryLinks(sentence).length > 3) problems.push(`more than 3 links: ${sentence}`);
  }
  return problems;
};

/**
 * The C4 shape of the last section: a result sentence ("You now know ..."), one sentence with the primary link, then
 * "Related:" with `related` page links and the glossary link, and nothing else.
 */
export const assertWhereNext = (text, { primary, related }) => {
  assert.ok(text.trimEnd().split(/^## /m).pop().startsWith('Where to go next'), 'Where to go next is the last section');
  const [heading, result, step, relatedLabel, ...rest] = section(text, 'Where to go next').trimEnd().split('\n\n');
  assert.equal(heading, 'Where to go next');
  assert.match(result, /^You now know [^\n]+\.$/);
  assert.doesNotMatch(result, /\]\(/, 'the result sentence has no link');
  assert.deepEqual(linksOf(step), [primary]);
  assert.match(step, /^(Read|Open|Start) \[[^\]]+\]\([^)]+\) [^\n]+\.$/);
  assert.equal(relatedLabel, 'Related:');
  assert.equal(rest.length, 1, 'one list after Related');
  const items = rest[0].split('\n');
  assert.ok(items.length <= 4, 'at most 3 related links plus the glossary');
  for (const item of items) assert.match(item, /^- \[[^\]]+\]\([^)]+\): [^\n]+\.$/, item);
  assert.deepEqual(linksOf(rest[0]), [...related, './glossary.md']);
};
