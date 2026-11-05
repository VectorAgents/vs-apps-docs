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

/** Splits a page into shared text and flavour blocks; syntax problems go to `errors` as `where:line: message`. */
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

/** Every value combination of the axes in `names`, as objects of axis to flavour. */
export const combinations = (axes, names) =>
  names.reduce((acc, axis) => acc.flatMap((c) => Object.keys(axes[axis]).map((f) => ({ ...c, [axis]: f }))), [{}]);

const splitFrontMatter = (text) => {
  const m = /^---\n[\s\S]*?\n---\n/.exec(text);
  return m ? { front: m[0], body: text.slice(m[0].length) } : { front: '', body: text };
};

/** `text` with `key: value` added to its front matter, which is created when the page has none. */
const withFrontMatter = (text, entry) => {
  const { front, body } = splitFrontMatter(text);
  return front ? front.replace(/\n---\n$/, `\n${entry}\n---\n`) + body : `---\n${entry}\n---\n${body}`;
};

/** Route of the page at `rel`: no extension, and a folder index sits at its folder. */
const urlOf = (rel) => `/${rel.replace(/\.mdx?$/, '').replace(/(^|\/)index$/, '')}`;

/**
 * Writes two trees under `config.outDir` from the source pages under `config.docsRoot`. `site/` is what Docusaurus
 * publishes: one page per source, every flavour block wrapped and labelled, a neutral page flagged in front matter.
 * `pairs/<client>/<server>/` holds one copy of each flavoured page per pair, for checks only.
 */
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
  const wrapped = (p) => [
    '',
    `<div className="flavour-block" data-axis="${axisOf(p.flavour)}" data-flavour="${p.flavour}">`,
    '',
    `<p className="flavour-label">${axes[axisOf(p.flavour)][p.flavour]}</p>`,
    '',
    ...(p.todo ? notice(p.flavour) : p.lines),
    '',
    '</div>',
    '',
  ];

  // Counts source blocks, so a second client flavour does not double a gap.
  let todos = 0;
  const manifest = [];
  for (const [rel, { text, parts, used }] of pages) {
    if (!used.length) {
      if (text === null) {
        mkdirSync(dirname(join(out, 'site', rel)), { recursive: true });
        copyFileSync(join(source, rel), join(out, 'site', rel));
      } else {
        emit(`site/${rel}`, withFrontMatter(text, 'neutral: true'));
      }
      continue;
    }
    todos += parts.filter((p) => p.todo).length;
    emit(`site/${rel}`, parts.flatMap((p) => (p.flavour ? wrapped(p) : p.lines)).join('\n'));
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
