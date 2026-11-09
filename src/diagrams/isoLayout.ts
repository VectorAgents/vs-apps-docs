/** `plug` is the one accent, for pluggable parts. `slab` and `core` are neutral. */
export type IsoTone = 'slab' | 'core' | 'plug';

/** A box on the grid: column `c`, row `r`, height above ground `z`, then width `w`, depth `d` and height `h`. */
interface IsoBox {
  id: string;
  label: string;
  text: string;
  tone: IsoTone;
  c: number;
  r: number;
  w: number;
  d: number;
  h: number;
  z: number;
}

/** A numbered part. The badge in the picture and the legend marker are the same number. */
export interface IsoPart extends IsoBox {
  badge: number;
}

/** A line between two grid points at height `z`. A `badge` letter needs `text` for the legend. */
export interface IsoLink {
  id: string;
  from: readonly [c: number, r: number];
  to: readonly [c: number, r: number];
  z: number;
  badge?: string;
  text?: string;
  remote?: boolean;
}

export interface IsoDiagramData {
  title: string;
  desc: string;
  caption: string;
  legendTitles: { places: string; parts: string; links: string };
  /** Ground plates. Each name is drawn under its front corner and listed unmarked in the legend. */
  slabs: IsoBox[];
  parts: IsoPart[];
  links: IsoLink[];
}

export interface IsoLegendItem {
  /** The number or letter shown in the picture, or null for a slab. */
  marker: string | null;
  text: string;
}

export type IsoShape =
  | { kind: 'block'; id: string; tone: IsoTone; glow: boolean; highlight: string | null; top: string; left: string; right: string }
  | { kind: 'slabLabel'; id: string; text: string; x: number; y: number; anchor: 'start' | 'middle' }
  | { kind: 'badge'; id: string; text: string; x: number; y: number; link: boolean }
  | { kind: 'link'; id: string; line: string; head: string; remote: boolean };

/** Plain geometry and text for one diagram, in paint order. The component only maps it to elements. */
export interface IsoScene {
  viewBox: string;
  title: string;
  desc: string;
  caption: string;
  shapes: IsoShape[];
  legend: { titles: IsoDiagramData['legendTitles']; places: IsoLegendItem[]; parts: IsoLegendItem[]; path: IsoLegendItem[] };
}

const COS30 = Math.cos(Math.PI / 6);
const UNIT = 22;
export const BADGE_RADIUS = 11;
const HEAD_LENGTH = 9;
const HEAD_HALF_WIDTH = 4.5;
const PAD = 28;
const LABEL_DROP = 18;

/** True 30 degree isometric: column steps go right and down, row steps go left and down, height goes up. */
const project = (c: number, r: number, z: number): [number, number] => [(c - r) * UNIT * COS30, (c + r) * UNIT * 0.5 - z];

const round = (n: number): number => Math.round(n * 10) / 10;
const points = (list: [number, number][]): string => list.map(([x, y]) => `${round(x)},${round(y)}`).join(' ');
const depth = (b: IsoBox): number => b.c + b.w + b.r + b.d;

function block(b: IsoBox, slab: boolean): IsoShape {
  const top = b.z + b.h;
  const a = project(b.c, b.r, top);
  const bb = project(b.c + b.w, b.r, top);
  const c = project(b.c + b.w, b.r + b.d, top);
  const d = project(b.c, b.r + b.d, top);
  const cb = project(b.c + b.w, b.r + b.d, b.z);
  const bbb = project(b.c + b.w, b.r, b.z);
  const db = project(b.c, b.r + b.d, b.z);
  const accent = b.tone === 'plug' && !slab;
  return {
    kind: 'block',
    id: b.id,
    tone: b.tone,
    glow: accent,
    highlight: accent ? points([d, a, bb]) : null,
    top: points([a, bb, c, d]),
    left: points([d, c, cb, db]),
    right: points([bb, c, cb, bbb]),
  };
}

function link(l: IsoLink): IsoShape[] {
  const [x1, y1] = project(l.from[0], l.from[1], l.z);
  const [x2, y2] = project(l.to[0], l.to[1], l.z);
  const length = Math.hypot(x2 - x1, y2 - y1);
  const [ux, uy] = [(x2 - x1) / length, (y2 - y1) / length];
  const [bx, by] = [x2 - ux * HEAD_LENGTH, y2 - uy * HEAD_LENGTH];
  const head = points([[x2, y2], [bx - uy * HEAD_HALF_WIDTH, by + ux * HEAD_HALF_WIDTH], [bx + uy * HEAD_HALF_WIDTH, by - ux * HEAD_HALF_WIDTH]]);
  const shapes: IsoShape[] = [{ kind: 'link', id: l.id, line: points([[x1, y1], [bx, by]]), head, remote: l.remote ?? false }];
  if (l.badge) shapes.push({ kind: 'badge', id: l.id, text: l.badge, x: round((x1 + x2) / 2), y: round((y1 + y2) / 2), link: true });
  return shapes;
}

export function layoutDiagram(data: IsoDiagramData): IsoScene {
  const boxes = [...data.slabs.map((b) => ({ box: b as IsoBox, slab: true })), ...data.parts.map((b) => ({ box: b as IsoBox, slab: false }))];
  boxes.sort((a, b) => a.box.z - b.box.z || depth(a.box) - depth(b.box));

  const shapes: IsoShape[] = [];
  for (const { box, slab } of boxes) {
    shapes.push(block(box, slab));
    if (!slab) {
      const [x, y] = project(box.c + box.w / 2, box.r + box.d / 2, box.z + box.h);
      shapes.push({ kind: 'badge', id: box.id, text: String((box as IsoPart).badge), x: round(x), y: round(y), link: false });
    }
  }
  for (const slab of data.slabs) {
    const [x, y] = project(slab.c + slab.w, slab.r + slab.d, slab.z);
    shapes.push({ kind: 'slabLabel', id: slab.id, text: slab.label, x: round(x), y: round(y + LABEL_DROP), anchor: 'middle' });
  }
  for (const l of data.links) shapes.push(...link(l));
  // A link badge is drawn after every line, so no line runs over it.
  shapes.sort((a, b) => Number(a.kind === 'badge' && a.link) - Number(b.kind === 'badge' && b.link));

  const xs: number[] = [];
  const ys: number[] = [];
  for (const b of [...data.slabs, ...data.parts]) {
    for (const [c, r, z] of [[b.c, b.r, b.z + b.h], [b.c + b.w, b.r, b.z + b.h], [b.c + b.w, b.r + b.d, b.z], [b.c, b.r + b.d, b.z]] as const) {
      const [x, y] = project(c, r, z);
      xs.push(x);
      ys.push(y);
    }
  }
  for (const l of data.links) {
    for (const [c, r] of [l.from, l.to]) {
      const [x, y] = project(c, r, l.z);
      xs.push(x);
      ys.push(y);
    }
  }
  const x0 = Math.min(...xs) - PAD;
  const y0 = Math.min(...ys) - PAD;
  const width = Math.max(...xs) + PAD - x0;
  const height = Math.max(...ys) + LABEL_DROP + 12 - y0;

  const item = (label: string, text: string, marker: string | null): IsoLegendItem => ({ marker, text: `${label}. ${text}` });
  return {
    viewBox: [x0, y0, width, height].map(round).join(' '),
    title: data.title,
    desc: data.desc,
    caption: data.caption,
    shapes,
    legend: {
      titles: data.legendTitles,
      places: data.slabs.map((s) => item(s.label, s.text, null)),
      parts: [...data.parts].sort((a, b) => a.badge - b.badge).map((p) => item(p.label, p.text, String(p.badge))),
      path: data.links.filter((l) => l.badge).map((l) => ({ marker: l.badge as string, text: l.text as string })),
    },
  };
}
