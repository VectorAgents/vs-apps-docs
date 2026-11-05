import { copyFileSync, mkdirSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const pageFile = /\.mdx?$/;
const openMarker = /^<!-- flavour (\S+)( todo)? -->$/;
const closeMarker = '<!-- /flavour -->';

const walk = (dir) =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
    entry.isDirectory() ? walk(join(dir, entry.name)).map((f) => `${entry.name}/${f}`) : [entry.name],
  );

const markerLike = /^<!--\s*\/?flavour\b/;

/** Syntax problems go to `errors` as `where:line: message`. */
function parse(text, where, knownFlavour, errors) {
  const parts = [{ lines: [] }];
  let open = null;
  const fail = (line, message) => errors.push(`${where}:${line}: ${message}`);
  text.split('\n').forEach((raw, index) => {
    const line = raw.trimEnd();
    const at = index + 1;
    const opening = openMarker.exec(line);
    if (opening) {
      if (open) fail(at, `block "${opening[1]}" opens inside block "${open.flavour}"`);
      else if (!knownFlavour(opening[1])) fail(at, `unknown flavour "${opening[1]}"`);
      open = { flavour: opening[1], at };
      parts.push({ flavour: opening[1], todo: Boolean(opening[2]), lines: [] });
    } else if (line === closeMarker) {
      if (!open) fail(at, 'closing marker outside a block');
      open = null;
      parts.push({ lines: [] });
    } else if (markerLike.test(line)) {
      fail(at, `malformed marker "${line}"`);
    } else {
      parts.at(-1).lines.push(raw);
    }
  });
  if (open) fail(open.at, `block "${open.flavour}" is not closed`);
  return parts;
}

/** The anchor slug of heading text, as Docusaurus makes it: markup dropped, lowercase, punctuation removed, spaces to hyphens. */
const slugOf = (text) =>
  text
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/[`*]/g, '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\p{M}_ -]/gu, '')
    .replace(/ /g, '-');

/**
 * `lines` with every heading given the explicit id `<flavour>-<slug>`, so ids in different blocks never collide and
 * the reader view can tell a heading's flavour from its id. `taken` counts the ids made so far on the page.
 */
function prefixHeadingIds(lines, flavour, taken) {
  let fence = null;
  return lines.map((line) => {
    const opening = /^\s*(`{3,}|~{3,})/.exec(line);
    if (opening) fence = fence === null ? opening[1][0] : fence === opening[1][0] ? null : fence;
    if (opening || fence !== null) return line;
    const heading = /^(#{1,6}) +(.+?)(?: +\{#([^}\s]+)\})?\s*$/.exec(line);
    if (!heading) return line;
    const id = `${flavour}-${heading[3] ?? slugOf(heading[2])}`;
    const count = taken.get(id) ?? 0;
    taken.set(id, count + 1);
    return `${heading[1]} ${heading[2]} {#${count ? `${id}-${count}` : id}}`;
  });
}

export const combinations = (axes, names) =>
  names.reduce((acc, axis) => acc.flatMap((c) => Object.keys(axes[axis]).map((f) => ({ ...c, [axis]: f }))), [{}]);

const urlOf = (rel) => `/${rel.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '')}`;

/** `site/` is what Docusaurus publishes. `pairs/<client>/<server>/` is for checks only. */
export function generate({ root, config }) {
  const { axes } = config;
  const axisOrder = Object.keys(axes);
  const axisOf = (flavour) => axisOrder.find((a) => flavour in axes[a]);
  const pairs = combinations(axes, axisOrder);
  const pairDir = (pair) => ['pairs', ...axisOrder.map((a) => pair[a])].join('/');

  const source = join(root, config.docsRoot);
  const out = join(root, config.outDir);
  rmSync(out, { recursive: true, force: true });
  const errors = [];
  const emit = (path, text) => {
    mkdirSync(dirname(join(out, path)), { recursive: true });
    writeFileSync(join(out, path), text);
  };

  for (const axis of axisOrder) {
    for (const flavour of Object.keys(axes[axis])) {
      const first = axisOf(flavour);
      if (first !== axis) errors.push(`flavour name "${flavour}" is on both axis "${first}" and axis "${axis}"`);
    }
  }

  const topFolders = new Set(readdirSync(source, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name));
  for (const flavour of axisOrder.flatMap((a) => Object.keys(axes[a]))) {
    if (topFolders.has(flavour)) errors.push(`flavour name "${flavour}" is also a top-level folder of ${config.docsRoot}`);
  }

  const pages = new Map();
  for (const rel of walk(source)) {
    const where = `${config.docsRoot}/${rel}`;
    const text = pageFile.test(rel) ? readFileSync(join(source, rel), 'utf8') : null;
    const parts = text === null ? [] : parse(text, where, axisOf, errors);
    const named = parts.filter((p) => p.flavour && axisOf(p.flavour));
    const used = axisOrder.filter((a) => named.some((p) => axisOf(p.flavour) === a));
    for (const axis of used) {
      const blocks = named.filter((p) => axisOf(p.flavour) === axis);
      for (const flavour of Object.keys(axes[axis])) {
        if (!blocks.some((p) => p.flavour === flavour)) errors.push(`${where}: no block or todo for flavour "${flavour}"`);
      }
      if (blocks.every((p) => p.todo)) errors.push(`${where}: every block of axis "${axis}" is todo`);
    }
    pages.set(rel, { text, parts, used });
  }
  if (errors.length) throw new Error(errors.join('\n'));

  const notice = (flavour) => [':::warning', `Not yet written for ${axes[axisOf(flavour)][flavour]}.`, ':::'];

  /**
   * The id of each block that a todo button scrolls to, as `<flavour>-block-<n>` with n counting the blocks of that
   * flavour on the page, and for each todo block the part it points at: the next written block of its axis in
   * another flavour, else the last one before it. A todo with no such block gets no button.
   */
  function switchTargets(parts) {
    const count = new Map();
    const ids = new Map();
    for (const p of parts) {
      if (!p.flavour) continue;
      count.set(p.flavour, (count.get(p.flavour) ?? 0) + 1);
      ids.set(p, `${p.flavour}-block-${count.get(p.flavour)}`);
    }
    const targets = new Map();
    parts.forEach((p, at) => {
      if (!p.todo) return;
      const written = (q) => q.flavour && !q.todo && axisOf(q.flavour) === axisOf(p.flavour) && q.flavour !== p.flavour;
      targets.set(p, parts.slice(at + 1).find(written) ?? parts.slice(0, at).findLast(written));
    });
    return { ids, targets };
  }

  const wrapped = (p, taken, { ids, targets }) => {
    const target = targets.get(p);
    const targeted = [...targets.values()].includes(p);
    const switcher = (q) =>
      `<button type="button" className="button button--secondary flavour-todo-switch" data-axis="${axisOf(q.flavour)}" data-flavour="${q.flavour}" data-target="${ids.get(q)}">Switch to ${axes[axisOf(q.flavour)][q.flavour]}</button>`;
    return [
      '',
      `<div className="flavour-block" data-axis="${axisOf(p.flavour)}" data-flavour="${p.flavour}"${targeted ? ` id="${ids.get(p)}"` : ''}>`,
      '',
      `<p className="flavour-label">${axes[axisOf(p.flavour)][p.flavour]}</p>`,
      '',
      ...(p.todo ? [...notice(p.flavour).slice(0, -1), ...(target ? ['', switcher(target)] : []), ':::'] : prefixHeadingIds(p.lines, p.flavour, taken)),
      '',
      '</div>',
      '',
    ];
  };

  // Counts source blocks, so a second client flavour does not double a gap.
  let todos = 0;
  const manifest = [];
  for (const [rel, { text, parts, used }] of pages) {
    if (!used.length) {
      mkdirSync(dirname(join(out, 'site', rel)), { recursive: true });
      copyFileSync(join(source, rel), join(out, 'site', rel));
      continue;
    }
    todos += parts.filter((p) => p.todo).length;
    const taken = new Map();
    const switches = switchTargets(parts);
    emit(`site/${rel}`, parts.flatMap((p) => (p.flavour ? wrapped(p, taken, switches) : p.lines)).join('\n'));
    for (const pair of pairs) {
      const body = parts
        .filter((p) => !p.flavour || Object.values(pair).includes(p.flavour))
        .flatMap((p) => (p.todo ? ['', ...notice(p.flavour), ''] : p.lines))
        .join('\n');
      emit(`${pairDir(pair)}/${rel}`, body);
    }
    manifest.push({
      source: rel,
      url: urlOf(rel),
      axes: used,
      trees: combinations(axes, used).map((flavours) => ({
        flavours,
        file: `${pairDir(pairs.find((pair) => Object.entries(flavours).every(([axis, flavour]) => pair[axis] === flavour)))}/${rel}`,
      })),
    });
  }
  emit('flavours.json', `${JSON.stringify({ pages: manifest }, null, 2)}\n`);
  if (todos > config.todoCap) {
    const noun = todos === 1 ? 'notice exceeds' : 'notices exceed';
    throw new Error(`${todos} open todo ${noun} the cap of ${config.todoCap}`);
  }
  return { todos };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..');
  const config = JSON.parse(readFileSync(join(root, 'flavours.config.json'), 'utf8'));
  try {
    const { todos } = generate({ root, config });
    console.log(`${config.outDir} generated, ${todos} open todo notice(s) of ${config.todoCap}`);
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
}
