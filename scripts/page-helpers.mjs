import { existsSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

export const section = (text, title) => text.split(/^## /m).find((s) => s.startsWith(title)) ?? '';

export const linksOf = (text) => [...text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);

export const nextLinks = (text) => linksOf(section(text, 'Next step'));

export const snippetsOf = (text, langs = 'tsx?') =>
  [...text.matchAll(new RegExp(`^\`\`\`(?:${langs})[^\\n]*\\n([\\s\\S]*?)^\`\`\``, 'gm'))].map(([, body]) => body).join('\n');

export const titledSnippets = (text) =>
  [...text.matchAll(/^```tsx?\s+title="([^"]+)"[^\n]*\n([\s\S]*?)^```/gm)].map(([, title, body]) => ({ title, body }));

export const codeOf = (text, titleFile) => titledSnippets(text).find(({ title }) => title.endsWith(titleFile))?.body ?? '';

const defaultGenDir = fileURLToPath(new URL('../docs-gen/', import.meta.url));

/**
 * One `{ tree, text }` per generated copy of `source`. A flavoured page reads from `pairs/` (`tree` is `node` or `react/nest`),
 * a neutral page from `site/` (`tree` '').
 */
export const treesOf = (source, { genDir = defaultGenDir } = {}) => {
  const manifestFile = join(genDir, 'flavours.json');
  if (!existsSync(manifestFile)) throw new Error(`${genDir} has no flavours.json: run pnpm generate first`);
  const page = JSON.parse(readFileSync(manifestFile, 'utf8')).pages.find((p) => p.source === source);
  if (!page) return [{ tree: '', text: readFileSync(join(genDir, 'site', source), 'utf8') }];
  return page.trees.map(({ flavours, file }) => ({ tree: Object.values(flavours).join('/'), text: readFileSync(join(genDir, file), 'utf8') }));
};

/** The page without its front matter. */
export const bodyOf = (text) => text.replace(/^---\n[\s\S]*?\n---\n/, '');

/** The text with each markdown link reduced to its label. */
export const unlink = (text) => text.replace(/\[([^\]]*)\]\([^)]*\)/g, '$1');

/** The rows of the pipe tables in `text`, the header row included, as arrays of trimmed cells. */
export const rowsOf = (text) =>
  text.split('\n').filter((l) => /^\|/.test(l) && !/^\| ?-{3}/.test(l)).map((l) => l.split('|').slice(1, -1).map((c) => c.trim()));

/**
 * The links of `text` that do not resolve. `file` is the page that holds them. A link breaks when its file is missing or,
 * for a glossary, when no `### ` heading carries its anchor.
 */
export const brokenLinks = (text, file) =>
  linksOf(text).filter((link) => {
    const [path, anchor] = link.split('#');
    const target = resolve(dirname(file), path);
    if (!existsSync(target)) return true;
    if (!anchor || !path.endsWith('glossary.md')) return false;
    return !readFileSync(target, 'utf8')
      .split('\n')
      .filter((l) => l.startsWith('### '))
      .some((l) => l.slice(4).toLowerCase().replaceAll(' ', '-') === anchor);
  });

/** The sentences of `text` of more than `max` words. Headings are skipped, and so are table rows when `tables` is false. */
export const longSentences = (text, { max = 25, tables = true } = {}) =>
  (tables ? text : text.replace(/^\|.*$/gm, ''))
    .replace(/^#.*$/gm, '')
    .split(/(?<=[.!?])\s+|\n/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.split(/\s+/).length > max);

/** Names and terms that no concept page uses. */
const BANNED_TERMS = [
  /AuthZEN|XACML|Zanzibar|Yjs/,
  /operating system/i,
  /resource pool/i,
  /actor stamp/i,
  /\bplane\b/i,
  /immutabl|black-box/i,
  /\bgrants?\b/i,
  /(?<!Vector )\bSpace\b/,
];

/** The shared banned terms found in `text`, as pattern strings. "Capability grant" is a term of the platform, so it is allowed, and so is the list term "Space managers" at the start of a list item, and the role terms "Space member", "Space editor", "Space admin" and "Space roles" at the start of a heading or list item. */
export const bannedTermsIn = (text) => {
  const prose = text.replace(/capability grants?/gi, '').replace(/^(\s*[-*] (?:\*\*)?)Space managers\b/gm, '$1').replace(/^(#{2,6} |\s*[-*] (?:\*\*)?)Space (member|editor|admin|roles)\b/gm, '$1$2');
  return BANNED_TERMS.filter((pattern) => pattern.test(prose)).map(String);
};
