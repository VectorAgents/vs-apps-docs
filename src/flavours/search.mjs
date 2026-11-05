import { chooseFlavours } from './head-script.mjs';

/** The label of the flavour that an anchor names when it is not the one the reader has, else null. */
export function otherFlavourLabel(hash, { axes, defaults }, shown) {
  const { save } = chooseFlavours({ search: '', hash, saved: {}, axes, defaults });
  for (const [axis, flavour] of Object.entries(save ?? {})) {
    if (flavour !== shown[axis]) return axes[axis][flavour];
  }
  return null;
}

/**
 * `results` with the hits of the reader's flavour first, in their order, then those of another flavour, each with
 * its flavour in front of the page title, which the hit line cuts last. A hit belongs to a flavour by its anchor: a
 * heading id inside a block starts with `<flavour>-`. `markTrees` sets the tree flags, which depend on the order.
 */
export function rankByFlavour(results, site, shown, markTrees) {
  const labelled = results.map((result) => ({ result, label: otherFlavourLabel(result.document.h ?? '', site, shown) }));
  const ordered = [...labelled.filter((r) => !r.label), ...labelled.filter((r) => r.label)];
  const ranked = ordered.map(({ result }) => {
    const { isInterOfTree, isLastOfTree, ...rest } = result;
    return rest;
  });
  markTrees(ranked);
  return ranked.map((result, at) => {
    const { label } = ordered[at];
    return label && result.page ? { ...result, page: { ...result.page, t: `only in ${label} · ${result.page.t}` } } : result;
  });
}
