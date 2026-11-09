import type { IconName } from './icons.ts';

/**
 * Data for one structure figure, the typed input of `StructureFigure` and `layoutStructure`.
 * One file per figure in `src/diagrams/figures/<slot-id>.ts` exports a value of this type.
 *
 * Positions are grid cells: `c` runs right and down on screen, `r` runs left and down, and a part stands on the slab it names.
 * The rules every structure figure follows (at most 8 parts, 3 slabs and 4 legend items, a label on every part, no part hidden
 * behind another, no arrows) are checked by `scripts/structure-figure.test.mjs`.
 */
export interface StructureData {
  /** Slot id of the figure, the name of its data file. */
  id: string;
  /** Name of the picture for assistive technology. */
  title: string;
  /** What the picture shows, in full sentences, for assistive technology. */
  desc: string;
  /** Shown after "Fig. N · "; comes from the slot registry so the placeholder and the figure agree. */
  caption: string;
  /** Slabs of any level. A level-1 slab rests on a level-0 slab; two slabs on one level stand side by side. */
  slabs: SlabData[];
  parts: PartData[];
  /** Lines between parts or slabs. */
  links: LinkData[];
  /** At most 4 items that explain how to read the picture, not what the parts are. */
  legend: LegendItem[];
}

/** What the detail card shows for a part or a slab. */
interface CardText {
  /** Identifies the part or slab, and the id of its keyboard button. Unique across slabs and parts. */
  id: string;
  /** The name drawn on the part or slab and shown as the card title. */
  label: string;
  /** One or two plain sentences for the card. */
  text: string;
  /** Names of what a group part holds, listed as chips in the card. */
  items?: string[];
}

export interface SlabData extends CardText {
  /** 0 stands on the ground, 1 on the slabs of level 0, and so on. */
  level: number;
  c: number;
  r: number;
  w: number;
  d: number;
}

/** `core` is a part of the thing the figure shows, `plug` is a part that plugs in from outside. */
export type PartTone = 'core' | 'plug';

/** A vendor mark drawn on a part in place of its icon. */
export interface PartMark {
  /** Names the vendor, for the title of the mark. */
  name: string;
  /** Site-relative URL of a square image under `static/`, such as `/img/marks/apollo.png`. */
  src: string;
}

export interface PartData extends CardText {
  icon: IconName;
  /** Drawn in a row instead of `icon`, so a group part shows who is in it. */
  marks?: PartMark[];
  tone: PartTone;
  /** Id of the slab the part stands on. */
  on: string;
  c: number;
  r: number;
  w: number;
  d: number;
}

/**
 * A line between two parts or slabs, each named by id. It leaves the facing side of the first and meets the facing side of
 * the second at the height of a part's middle. A structure figure has no arrow heads: a line shows a connection, not a direction.
 */
export interface LinkData {
  id: string;
  from: string;
  to: string;
  /** A dashed line, for a link that leaves the space. */
  remote?: boolean;
}

/**
 * `core` and `plug` draw a swatch in the tone of that kind of part, `link` draws a plain line and `remote` a dashed line. The flow
 * figures add `cube` (one moving cube), `stack` (a stack of cubes) and `hop` (the thick accent line of the current hop).
 */
export interface LegendItem {
  swatch: PartTone | 'link' | 'remote' | 'cube' | 'stack' | 'hop';
  /** 15 words or fewer. */
  text: string;
}
