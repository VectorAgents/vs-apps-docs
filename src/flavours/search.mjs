import { chooseFlavours } from './head-script.mjs';

export function otherFlavourLabel(hash, { axes, defaults }, shown) {
  const { save } = chooseFlavours({ search: '', hash, saved: {}, axes, defaults });
  for (const [axis, flavour] of Object.entries(save ?? {})) {
    if (flavour !== shown[axis]) return axes[axis][flavour];
  }
  return null;
}

/**
 * Hits in the reader's flavour first, then the others with `only in <label> · ` before the page title, which the
 * hit line cuts last. `markTrees` runs after the reorder because the tree flags depend on the order.
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
