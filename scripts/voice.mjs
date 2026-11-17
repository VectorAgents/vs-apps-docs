const SENTENCE_MAX = 35;
const PARAGRAPH_MAX = 5;
const CONTRACTION = /\b(?:\w+n['’]t|\w+['’](?:re|ve|ll|d|m)|(?:it|that|there|here|what|let|he|she|who|how|where|when|why)['’]s)\b/i;
const CHECKBOX = /^\[[ xX]\]\s+/;
const LIST_ITEM = /^\s*(?:[-*+]|\d+\.)\s+/;
const DESCRIPTION_MAX = 160;
const DESCRIPTION_OPENER = /^(?:this page|learn)\b/i;
const BANNED_LINK_TEXT = new Set(['here', 'this page', 'read more', 'learn more']);
const BARE_URL = /^(?:https?:\/\/|www\.)\S+$/i;

/** Splits markdown into prose blocks, skipping frontmatter, code blocks (the directory tree is one), tables, headings and admonition markers. */
function blocks(markdown) {
  const lines = markdown.replace(/^---\n[\s\S]*?\n---\n/, '').split('\n');
  const out = [];
  let current = null;
  let inCodeBlock = false;
  const flush = () => {
    if (current) out.push(current);
    current = null;
  };
  for (const line of lines) {
    if (/^\s*(```|~~~)/.test(line)) {
      flush();
      inCodeBlock = !inCodeBlock;
    } else if (inCodeBlock || /^\s*\|/.test(line) || /^#{1,6}\s/.test(line) || /^\s*:::/.test(line)) {
      flush();
    } else if (line.trim() === '') {
      flush();
    } else if (LIST_ITEM.test(line)) {
      flush();
      current = { item: true, text: line.replace(LIST_ITEM, '').replace(CHECKBOX, '') };
    } else if (current) {
      current.text += ` ${line.trim()}`;
    } else {
      current = { item: false, text: line.trim() };
    }
  }
  flush();
  return out;
}

/**
 * Reports shared-voice breaks in prose: sentence over 35 words and paragraph
 * over 5 sentences. Inline code counts as one word. A list item is not counted
 * as a paragraph.
 * @returns {{ rule: string, text: string }[]}
 */
export function voiceViolations(markdown) {
  const violations = [];
  for (const block of blocks(markdown)) {
    const text = block.text
      .replace(/`[^`]*`/g, 'CODE')
      .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');
    const sentences = text.split(/(?<=[.!?])\s+/).filter((s) => s.trim());
    for (const sentence of sentences) {
      if (sentence.split(/\s+/).length > SENTENCE_MAX) {
        violations.push({ rule: 'sentence-length', text: sentence });
      }
    }
    if (!block.item && sentences.length > PARAGRAPH_MAX) {
      violations.push({ rule: 'paragraph-length', text });
    }
  }
  return violations;
}

/** The page with codeblocks and inline code removed, so what is left is prose, tables, headings and front matter. */
function proseOf(markdown) {
  return markdown
    .replace(/^\s*(```|~~~)[^\n]*\n[\s\S]*?^\s*\1[^\n]*$/gm, '')
    .replace(/`[^`\n]*`/g, 'CODE');
}

/** The lines of `markdown` outside codeblocks and inline code, with link targets removed. */
function proseLines(markdown) {
  return proseOf(markdown)
    .replace(/\]\([^)\n]*\)/g, ']')
    .split('\n');
}

/**
 * Reports contractions (V9) in prose, list items, table cells, headings and
 * front matter. Code spans, codeblocks and link targets are skipped, and a
 * possessive is not a contraction.
 * @returns {{ rule: string, text: string }[]}
 */
export function contractionViolations(markdown) {
  return proseLines(markdown)
    .filter((line) => CONTRACTION.test(line))
    .map((line) => ({ rule: 'contraction', text: line.trim() }));
}

/**
 * Reports em dashes, en dashes and spaced hyphens (V7) in prose, tables,
 * headings and front matter. Code spans, codeblocks, list markers and
 * hyphens inside a word are skipped.
 * @returns {{ rule: string, text: string }[]}
 */
export function dashViolations(markdown) {
  return proseLines(markdown)
    .filter((line) => /[\u2014\u2013]|\s-\s/.test(line.replace(LIST_ITEM, '')))
    .map((line) => ({ rule: 'dash', text: line.trim() }));
}

/**
 * Reports links whose text is "here", "this page", "read more", "learn more"
 * or a bare URL (P2), in markdown links and in `<a>` and `<Link>` tags.
 * Images are skipped.
 * @returns {{ rule: string, text: string }[]}
 */
export function linkTextViolations(markdown) {
  const text = proseOf(markdown);
  const labels = [
    ...[...text.matchAll(/(?<!!)\[([^\]\n]*)\]\([^)\n]*\)/g)].map((m) => m[1]),
    ...[...text.matchAll(/<(?:a|Link)\b[^>]*>([^<]*)<\/(?:a|Link)>/g)].map((m) => m[1]),
  ];
  return labels
    .map((label) => label.trim().replace(/[.:]+$/, ''))
    .filter((label) => BANNED_LINK_TEXT.has(label.toLowerCase()) || BARE_URL.test(label))
    .map((label) => ({ rule: 'link-text', text: label }));
}

/**
 * Reports a missing or empty front matter `description`, one over 160
 * characters, and one that opens with "This page" or "Learn" (P1).
 * @returns {{ rule: string, text: string }[]}
 */
export function descriptionViolations(markdown) {
  const front = markdown.match(/^---\n([\s\S]*?)\n---\n/)?.[1] ?? '';
  const raw = front.match(/^description:[ \t]*(.*)$/m)?.[1].trim();
  const description = raw?.replace(/^(["'])(.*)\1$/, '$2');
  if (!description) return [{ rule: 'description', text: 'missing' }];
  if (description.length > DESCRIPTION_MAX || DESCRIPTION_OPENER.test(description)) {
    return [{ rule: 'description', text: description }];
  }
  return [];
}
