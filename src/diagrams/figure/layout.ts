import { HEIGHT_UNIT, clamp, facetsOf, project, round, roundedPlan } from './geometry.ts';
import type { Facet, Point } from './geometry.ts';
import type { IconName } from './icons.ts';
import type { LegendItem, StructureData } from './types.ts';

/** Height of a slab, in height units. */
export const SLAB_HEIGHT = 4;
/** Height of every part, in height units. One part height keeps the parts comparable. */
export const PART_HEIGHT = 2.5;
const SLAB_RADIUS = 1.2;
const PART_RADIUS = 0.5;
/** Screen units a pinned part rises. Reduced motion drops it in CSS. */
export const LIFT = 7;
const PAD = 12;
const SLAB_LABEL_INSET = SLAB_RADIUS + 0.4;
/** Baseline offset that centres 13 unit text on a slab wall. */
const SLAB_LABEL_BASELINE = 4.5;

/** Distance from the middle of a part's top face to the middle of its icon or marks, in screen units. */
export const ICON_RISE = 6;
/** Distance between the middles of two neighbouring marks, in screen units. */
export const MARK_GAP = 19;

/** Where the name of a part or slab is drawn: its text, and the start (slab) or middle (part) of its baseline. */
export interface SceneLabel {
  text: string;
  x: number;
  y: number;
}

/** One slab or part, ready to paint: its wall facets, top face, silhouette and label, in screen units. */
export interface SceneSolid {
  id: string;
  kind: 'slab' | 'part';
  tone: 'slab' | 'core' | 'plug';
  facets: Facet[];
  top: Point[];
  /** The convex silhouette, also the area that answers the pointer. */
  hull: Point[];
  label: SceneLabel;
  /** Icon name of a part; a slab has none. */
  icon?: IconName;
  /** The marks of a part that has them, centred on the icon spot and drawn instead of the icon. */
  marks?: SceneMark[];
  /** Screen units the solid rises when pinned: `LIFT` for a part, 0 for a slab, which carries the parts on it. */
  lift: number;
}

/** One vendor mark, with the middle of its tile in screen units. */
export interface SceneMark {
  name: string;
  src: string;
  x: number;
  y: number;
}

export interface SceneLink {
  id: string;
  /** The two ends of the line. */
  points: [Point, Point];
  remote: boolean;
}

/** What the detail card and the keyboard button of one part or slab show. */
export interface SceneEntry {
  id: string;
  label: string;
  text: string;
  items?: string[];
}

/** Everything a component needs to draw a structure figure. All geometry is final: the component only maps it to elements. */
export interface StructureScene {
  viewBox: string;
  title: string;
  desc: string;
  caption: string;
  /** In paint order: slabs from the lowest level up, then parts from the farthest to the nearest. */
  solids: SceneSolid[];
  /** Painted last, over the solids. */
  links: SceneLink[];
  /** Parts first, then slabs, in data order. */
  entries: SceneEntry[];
  legend: LegendItem[];
}

/** A box on the grid, as a link end sees it. */
interface Footprint {
  c: number;
  r: number;
  w: number;
  d: number;
  /** Height of the line where it meets this box: half a part height above the box's top. */
  z: number;
}

const depth = (b: { c: number; r: number; w: number; d: number }): number => b.c + b.w + b.r + b.d;

/**
 * The two ends of a link between two boxes. Each end is on the side that faces the other box, kept 0.5 cells from the corners.
 * The line is straight along that axis when the boxes' sides overlap, so a row of parts gets level lines.
 */
function ends(from: Footprint, to: Footprint): [Point, Point] {
  const [dc, dr] = [to.c + to.w / 2 - (from.c + from.w / 2), to.r + to.d / 2 - (from.r + from.d / 2)];
  const alongColumns = Math.abs(dc) >= Math.abs(dr);
  const forward = alongColumns ? dc > 0 : dr > 0;
  // Position and size on the axis the line runs along, and on the axis across it.
  const lead = (b: Footprint): [number, number] => (alongColumns ? [b.c, b.w] : [b.r, b.d]);
  const cross = (b: Footprint): [number, number] => (alongColumns ? [b.r, b.d] : [b.c, b.w]);
  const within = (b: Footprint, at: number): number => {
    const [start, size] = cross(b);
    const margin = Math.min(0.5, size / 2);
    return clamp(at, start + margin, start + size - margin);
  };
  const point = (b: Footprint, atEnd: boolean, across: number): Point => {
    const [start, size] = lead(b);
    const along = atEnd ? start + size : start;
    return alongColumns ? project(along, across, b.z) : project(across, along, b.z);
  };
  const [toStart, toSize] = cross(to);
  const across = within(from, toStart + toSize / 2);
  return [point(from, forward, across), point(to, !forward, within(to, across))];
}

/** Lays out a structure figure: wall facets, tops, silhouettes, labels, links and the text entries, in screen units. */
export function layoutStructure(data: StructureData): StructureScene {
  const slabTop = (level: number): number => (level + 1) * SLAB_HEIGHT;
  const footprints = new Map<string, Footprint>();
  for (const s of data.slabs) footprints.set(s.id, { ...s, z: slabTop(s.level) + PART_HEIGHT / 2 });
  const slabs = new Map(data.slabs.map((s) => [s.id, s]));

  const solids: SceneSolid[] = [];
  for (const s of [...data.slabs].sort((a, b) => a.level - b.level || depth(a) - depth(b))) {
    const z = s.level * SLAB_HEIGHT;
    const { facets, top, hull } = facetsOf(roundedPlan(s.c, s.r, s.w, s.d, SLAB_RADIUS), z, SLAB_HEIGHT);
    const [x, y] = project(s.c + SLAB_LABEL_INSET, s.r + s.d, z + SLAB_HEIGHT);
    const label = { text: s.label, x: round(x), y: round(y + (SLAB_HEIGHT * HEIGHT_UNIT) / 2 + SLAB_LABEL_BASELINE) };
    solids.push({ id: s.id, kind: 'slab', tone: 'slab', facets, top, hull, label, lift: 0 });
  }
  for (const p of [...data.parts].sort((a, b) => depth(a) - depth(b) || a.c - b.c)) {
    const slab = slabs.get(p.on);
    if (!slab) throw new Error(`Part "${p.id}" stands on unknown slab "${p.on}"`);
    const z = slabTop(slab.level);
    const { facets, top, hull } = facetsOf(roundedPlan(p.c, p.r, p.w, p.d, PART_RADIUS), z, PART_HEIGHT);
    const [x, y] = project(p.c + p.w / 2, p.r + p.d / 2, z + PART_HEIGHT);
    footprints.set(p.id, { ...p, z: z + PART_HEIGHT / 2 });
    const marks = p.marks?.map(({ name, src }, i, all): SceneMark => ({ name, src, x: round(x + (i - (all.length - 1) / 2) * MARK_GAP), y: round(y - ICON_RISE) }));
    solids.push({ id: p.id, kind: 'part', tone: p.tone, facets, top, hull, label: { text: p.label, x: round(x), y: round(y) }, icon: p.icon, ...(marks && { marks }), lift: LIFT });
  }

  const links: SceneLink[] = data.links.map((l) => {
    const from = footprints.get(l.from);
    const to = footprints.get(l.to);
    if (!from || !to) throw new Error(`Link "${l.id}" names unknown end "${footprints.has(l.from) ? l.to : l.from}"`);
    const [a, b] = ends(from, to);
    return { id: l.id, points: [[round(a[0]), round(a[1])], [round(b[0]), round(b[1])]], remote: l.remote ?? false };
  });

  const xs: number[] = [];
  const ys: number[] = [];
  for (const s of solids) {
    for (const [x, y] of s.hull) {
      xs.push(x);
      ys.push(y - s.lift);
    }
  }
  for (const l of links) {
    for (const [x, y] of l.points) {
      xs.push(x);
      ys.push(y);
    }
  }
  const [x0, y0] = [Math.min(...xs) - PAD, Math.min(...ys) - PAD];
  const viewBox = [x0, y0, Math.max(...xs) + PAD - x0, Math.max(...ys) + PAD - y0].map(round).join(' ');

  const entry = ({ id, label, text, items }: { id: string; label: string; text: string; items?: string[] }): SceneEntry => (items ? { id, label, text, items } : { id, label, text });
  return {
    viewBox,
    title: data.title,
    desc: data.desc,
    caption: data.caption,
    solids,
    links,
    entries: [...data.parts.map(entry), ...data.slabs.map(entry)],
    legend: data.legend,
  };
}
