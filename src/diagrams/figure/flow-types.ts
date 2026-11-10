import type { StructureData } from './types.ts';

/**
 * Data for one flow figure, the typed input of `FlowFigure` and `layoutFlow`. One file per figure in
 * `src/diagrams/figures/<slot-id>.ts` exports a value of this type.
 *
 * A flow figure is a structure figure (slabs, parts, static links and a legend, with the same rules) that also plays. One
 * progress value `p` runs from 0 to the number of scenes. Scene `k` plays while `p` goes from `k - 1` to `k`, and `p = k` is its
 * still pose, the pose that step mode and reduced motion show. Time inside a scene is a local progress `u` from 0 to 1.
 * `scripts/flow-figure.test.mjs` checks the rules.
 */
export interface FlowData extends StructureData {
  /** Opens the figure at rest, before any scene has played. */
  intro: string;
  /** The steps of the example, in order. They give the pills, the captions, the record table and the text version. */
  steps: StepData[];
  /** Scenes in play order. A step with no scene yet has a disabled pill and no row in the record. */
  scenes: SceneData[];
}

/** One step of the example. */
export interface StepData {
  /** Plain sentences. The caption while the step plays and its line in the text version. */
  text: string;
  /** The row the step adds to the record table once it is done. */
  record: RecordRow;
  /** The `#id` of the heading that explains the step on the page. */
  href?: string;
}

/** A row of the record of work. Each cell is 15 words or fewer. */
export interface RecordRow {
  /** What was recorded. */
  text: string;
  /** Who it ran as: one of the actor arms of the record of work. */
  actor: string;
}

/** A span of one scene, `[from, to]`, each from 0 (scene start) to 1 (scene end) with `from` before `to`. */
export type Window = readonly [from: number, to: number];

/**
 * A place in the picture. A string names a part: `"app"` is the spot at the back corner of the part's top face, clear of its
 * label, and `"connectors#1"` is the middle of the part's mark number 1. A triple is a point `[c, r, z]` in grid cells and height
 * units, as in `PartData`, with `z` measured from the ground.
 */
export type Waypoint = string | readonly [c: number, r: number, z: number];

/** One scene of the example: what plays while `p` goes from `k - 1` to `k`. */
export interface SceneData {
  /** Number of the step (from 1) that this scene plays. */
  step: number;
  /** How long the scene runs when it plays, in milliseconds. */
  durationMs: number;
  /** Words for the caption while the scene shows, when the text of its step does not fit it. */
  caption?: string;
  /** Auto-play halts at the end of this scene, where an ask waits for a person. Approve plays on from there. */
  pause?: boolean;
  /** Starts a new loop: the hops of every scene before this one are left out, so a figure of several loops starts each on a clean picture. */
  fresh?: boolean;
  /** Parts that lift and take an accent outline while the scene runs. They stay lit to the end of the scene. */
  lit: LitData[];
  /** What moves or appears. Each effect keeps to its own scene. */
  effects: EffectData[];
}

export interface LitData {
  /** Id of the part. */
  part: string;
  /** Local progress at which the part starts to lift. */
  from: number;
}

export type EffectData = HopData | ItemData | RingData | DotsData | ChatData | DraftData | AskData;

/**
 * An accent line along a path, the hop that the scene makes. It grows over `draw` and is thick while its scene runs. In every
 * later scene it stays as a thin, faint line, so the reader sees where the work has been.
 */
export interface HopData {
  kind: 'hop';
  path: Waypoint[];
  draw: Window;
}

/** A moving cube, a unit of work in progress, or a flat envelope, the email that the work produced. */
export interface ItemData {
  kind: 'item';
  /** The cube is the default. */
  shape?: 'cube' | 'envelope';
  /** The cube starts at the first point and rides the path. */
  path: Waypoint[];
  /** When it rides. Before `move[0]` it waits at the start and after `move[1]` it stays at the end. */
  move: Window;
  /** When it shows. The default runs from the start of `move` to the end of the scene. */
  show?: Window;
  /** Share of the scene over which it fades in or out at the ends of `show`. 0.03 when left out. */
  fade?: number;
  /** Height units above the path. A stack is several cubes with rises 0.95 apart. */
  rise?: number;
  /** Local progress at which the cube turns accent, to show a lead that is qualified. Grey until then. */
  qualifiedAt?: number;
}

/** An expanding ring at a point. A ring that holds stays as a faint ring when it has finished. */
export interface RingData {
  kind: 'ring';
  at: Waypoint;
  /** Time of all the pulses. */
  window: Window;
  /** How many times the ring expands during `window`; 1 when left out. */
  pulses?: number;
  hold?: boolean;
}

/** Five result dots that pop up around a point and then gather into it. */
export interface DotsData {
  kind: 'dots';
  at: Waypoint;
  /** The dots pop up one after another across this window. */
  pop: Window;
  /** All the dots move into `at` over this window and vanish. */
  gather: Window;
}

/** A chat card at a point that types a message and sends it. It shows for the whole scene. */
export interface ChatData {
  kind: 'chat';
  /** The bottom right corner of the card stands at this point. */
  at: Waypoint;
  /** Shown before typing starts. */
  placeholder: string;
  text: string;
  /** The text types across this window. */
  type: Window;
  /** The card turns into a sent message at this local progress. */
  sendAt: number;
}

/**
 * A chat-style card at a point that types an email: the address, then the subject, then the body, as one run of characters. It
 * shows for the whole scene and says "Drafting" until the typing is done.
 */
export interface DraftData {
  kind: 'draft';
  /** The top left corner of the card stands at this point. */
  at: Waypoint;
  to: string;
  subject: string;
  body: string;
  /** The text types across this window. */
  type: Window;
}

/**
 * An ask: a pause mark above a tile, at a point. It is waiting by default, and the scene shows the tooltip that tells the
 * reader to approve. With `approved` it is the tile with a tick, the beat after the approval.
 */
export interface AskData {
  kind: 'ask';
  /** The centre of the tile. */
  at: Waypoint;
  /** When it shows. */
  show: Window;
  approved?: boolean;
}
