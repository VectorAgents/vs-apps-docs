/** Heading text as the anchor slug Docusaurus makes: markup dropped, lowercase, punctuation removed, spaces to hyphens. */
export const slugOf = (text) =>
  text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}_ -]/gu, '')
    .replace(/ /g, '-');

const plain = (text) =>
  text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/[`*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * One entry per `###` heading of each glossary, keyed `<section>#<anchor>`: the term, the first paragraph as the
 * definition and the `Owner` line, all as plain text. The hover card of `src/theme/MDXComponents/A.tsx` reads it.
 *
 * @param texts glossary source text by section folder name
 */
export function glossaryIndex(texts) {
  const index = {};
  for (const [section, text] of Object.entries(texts)) {
    for (const block of text.split(/^### /m).slice(1)) {
      const [head, ...rest] = block.split('\n');
      const explicit = /\s*\{#([^}\s]+)\}\s*$/.exec(head);
      const term = plain(head.replace(/\s*\{#[^}]*\}\s*$/, ''));
      const body = rest.join('\n').trim();
      const owner = /^- Owner: (.*?)\.?$/m.exec(body)?.[1];
      index[`${section}#${explicit?.[1] ?? slugOf(head)}`] = {
        term,
        definition: plain(body.split(/\n\s*\n/)[0]),
        ...(owner && { owner: plain(owner) }),
      };
    }
  }
  return index;
}
