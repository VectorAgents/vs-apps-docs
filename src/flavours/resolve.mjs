/** Pure logic for the reader's flavour choice. */

/** A full choice, one valid flavour per axis: `saved` where it names a known flavour, else the default. */
export function completeChoice(saved, axes, defaults) {
  const choice = /** @type {Record<string, string>} */ ({});
  for (const axis of Object.keys(axes)) {
    const value = saved?.[axis];
    choice[axis] = typeof value === 'string' && Object.hasOwn(axes[axis], value) ? value : defaults[axis];
  }
  return choice;
}

/** The flavours a query string names, one parameter per axis. Unknown axes and flavours are dropped. */
export function choiceInQuery(search, axes) {
  const params = new URLSearchParams(search);
  const choice = /** @type {Record<string, string>} */ ({});
  for (const axis of Object.keys(axes)) {
    const value = params.get(axis);
    if (value !== null && Object.hasOwn(axes[axis], value)) choice[axis] = value;
  }
  return choice;
}

/** The trigger text of a flavour: its name up to ` + `, so `Node.js + TypeScript` reads `Node.js`. */
export function shortLabel(label) {
  return label.split(' + ')[0];
}
