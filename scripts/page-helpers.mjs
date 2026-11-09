import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
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
