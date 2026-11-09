/** `href` with one parameter per axis of `choice`, so the link opens on the same flavours; other parameters and the hash stay. */
export function shareUrl(href, choice) {
  const url = new URL(href);
  for (const [axis, flavour] of Object.entries(choice)) url.searchParams.set(axis, flavour);
  return url.href;
}

/** The trigger text of a flavour: its name up to ` + `, so `Node.js + TypeScript` reads `Node.js`. */
export function shortLabel(label) {
  return label.split(' + ')[0];
}
