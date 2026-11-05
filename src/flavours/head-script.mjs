/** The `localStorage` key that holds the saved choice, as JSON of axis to flavour. */
export const storageKey = 'vs-apps-docs.flavours';

/**
 * The flavour of each axis, and the saved choice to write back (null when nothing changes). A flavour that the
 * address names beats the saved choice: a `?<axis>=<flavour>` parameter, else a bare anchor that starts with
 * `<flavour>-`. A flavour that the address names overwrites the saved one.
 *
 * Inlined into the head script through `toString()`, so it uses no outer binding.
 */
export function chooseFlavours({ search, hash, saved, axes, defaults }) {
  const params = new URLSearchParams(search);
  let anchor = '';
  try {
    anchor = decodeURIComponent(hash.replace(/^#/, ''));
  } catch (error) {}
  const base = saved && typeof saved === 'object' ? saved : {};
  const choice = {};
  const named = {};
  for (const axis of Object.keys(axes)) {
    const known = (flavour) => typeof flavour === 'string' && Object.prototype.hasOwnProperty.call(axes[axis], flavour);
    let flavour = params.get(axis);
    if (!known(flavour)) {
      flavour = null;
      for (const candidate of Object.keys(axes[axis])) {
        if (anchor.indexOf(candidate + '-') === 0 && (flavour === null || candidate.length > flavour.length)) flavour = candidate;
      }
    }
    if (flavour !== null && flavour !== base[axis]) named[axis] = flavour;
    choice[axis] = flavour !== null ? flavour : known(base[axis]) ? base[axis] : defaults[axis];
  }
  return { choice, save: Object.keys(named).length ? { ...base, ...named } : null };
}

/** The inline `<head>` script: sets `data-<axis>` on `<html>` before first paint and saves what the address names. */
export function headScript(axes, defaults) {
  const data = JSON.stringify({ axes, defaults, key: storageKey }).replace(/</g, '\\u003c');
  return `(function(){try{var d=${data};var choose=${chooseFlavours.toString()};var saved=null;try{saved=JSON.parse(localStorage.getItem(d.key))}catch(e){}var r=choose({search:location.search,hash:location.hash,saved:saved,axes:d.axes,defaults:d.defaults});for(var a in r.choice)document.documentElement.setAttribute('data-'+a,r.choice[a]);if(r.save)try{localStorage.setItem(d.key,JSON.stringify(r.save))}catch(e){}}catch(e){}})();`;
}

/**
 * The inline `<head>` style. Rules apply only once the head script has set the attribute, so a reader without
 * JavaScript sees every block. A contents entry hides with its heading: heading ids in a block start `<flavour>-`.
 */
export function flavourStyle(axes) {
  const rules = [];
  for (const [axis, flavours] of Object.entries(axes)) {
    for (const flavour of Object.keys(flavours)) {
      const other = `html[data-${axis}]:not([data-${axis}="${flavour}"])`;
      rules.push(`${other} .flavour-block[data-axis="${axis}"][data-flavour="${flavour}"]{display:none}`);
      rules.push(`${other} .table-of-contents li:has(> a[href^="#${flavour}-"]){display:none}`);
    }
  }
  rules.push(`${Object.keys(axes).map((axis) => `html:not([data-${axis}]) .flavour-picker`).join(',')}{display:none}`);
  return rules.join('\n');
}
