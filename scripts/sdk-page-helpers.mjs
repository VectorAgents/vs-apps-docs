import { bodyOf, unlink } from './page-helpers.mjs';

/** The `description` of the front matter, or `undefined`. */
export const descriptionOf = (text) => text.match(/^---\n[\s\S]*?^description: (.+)$/m)?.[1];

/** The words of `text`, with each code span counted as one word and each link as its label. */
export const wordCount = (text) => unlink(text).replace(/`[^`]*`/g, 'CODE').trim().split(/\s+/).filter(Boolean).length;

/** The sentence count of `text`, with code spans reduced to one word. */
const sentenceCount = (text) => unlink(text).replace(/`[^`]*`/g, 'CODE').split(/(?<=[.!?])\s+/).filter((s) => s.trim()).length;

/** The cells of the pipe tables of `text`, the separator rows left out. */
export const cellsOf = (text) =>
  text
    .replace(/^```[^\n]*\n[\s\S]*?^```/gm, '')
    .split('\n')
    .filter((line) => /^\s*\|/.test(line) && !/^\s*\|[\s:|-]+\|\s*$/.test(line))
    .flatMap((line) => line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim()));

/** The pipe tables of `text` outside codeblocks, as `{ header, rows }` of trimmed cells. */
export const tablesOf = (text) => {
  const tables = [];
  let current = null;
  for (const line of text.replace(/^```[^\n]*\n[\s\S]*?^```/gm, '').split('\n')) {
    if (!/^\s*\|/.test(line)) {
      current = null;
    } else if (/^\s*\|[\s:|-]+\|\s*$/.test(line)) {
      continue;
    } else {
      const cells = line.trim().replace(/^\||\|$/g, '').split(/(?<!\\)\|/).map((c) => c.trim());
      if (current) current.rows.push(cells);
      else tables.push((current = { header: cells, rows: [] }));
    }
  }
  return tables;
};

/** The text of a page without its codeblocks and code spans. */
export const withoutCode = (text) => bodyOf(text).replace(/^```[^\n]*\n[\s\S]*?^```/gm, '').replace(/`[^`]*`/g, '');

/** The table cells that hold more than one sentence or more than `max` words. */
export const longCells = (text, max = 15) => cellsOf(text).filter((cell) => wordCount(cell) > max || sentenceCount(cell) > 1);

/** The prose of a page: no front matter, no codeblock, no table, no heading, no html comment, no admonition marker. */
export const proseOf = (text) =>
  bodyOf(text)
    .replace(/^(```|~~~)[^\n]*\n[\s\S]*?^\1/gm, '')
    .replace(/^\s*\|.*$/gm, '')
    .replace(/^#{1,6} .*$/gm, '')
    .replace(/^<!--.*-->$/gm, '')
    .replace(/^:::.*$/gm, '');

/** The first paragraph of the body that is not an import, an html comment or a heading. */
export const openingParagraph = (text) =>
  bodyOf(text)
    .split(/\n\n+/)
    .map((p) => p.trim())
    .find((p) => p && !/^(import |<!--|#|```|:::)/.test(p));

/** The sentences of the prose that run over `max` words. */
export const overlong = (text, max = 35) =>
  proseOf(text)
    .replace(/^\s*(?:[-*+]|\d+\.)\s+/gm, '')
    .split(/(?<=[.!?])\s+|\n/)
    .filter((sentence) => wordCount(sentence) > max);

/** The H2 sections of a page as `{ title, body }`. */
export const h2Sections = (text) =>
  bodyOf(text)
    .split(/^## /m)
    .slice(1)
    .map((s) => ({ title: s.split('\n')[0].trim(), body: s }));
