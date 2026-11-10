import type { EffectData, FlowData, RecordRow, Waypoint, Window } from './flow-types.ts';
import { HEIGHT_UNIT, facetsOf, project, roundedPlan } from './geometry.ts';
import type { Point, Solid } from './geometry.ts';
import { PART_HEIGHT, SLAB_HEIGHT, layoutStructure } from './layout.ts';
import type { StructureScene } from './layout.ts';

/** Side of a cube, in grid cells and height units. A moving cube is work in progress. */
const CUBE_SIDE = 0.9;
/** Height units between the cubes of a stack, so a stack reads as many cubes and not one tall one. */
export const STACK_STEP = 0.95;
/** Sides of an envelope: a flat tile with a width, a depth and a height, in grid cells and height units. */
const ENVELOPE = { w: 1.4, d: 0.95, h: 0.18 } as const;
/** The shape of an envelope, its base centred on the origin. */
export const ENVELOPE_SOLID: Solid = facetsOf(roundedPlan(-ENVELOPE.w / 2, -ENVELOPE.d / 2, ENVELOPE.w, ENVELOPE.d, 0.1), 0, ENVELOPE.h);
/** The shape of the ask tile, its base centred on the origin: a flat tile a little wider than an envelope. */
export const ASK_TILE: Solid = facetsOf(roundedPlan(-1.0, -0.85, 2.0, 1.7, 0.12), 0, 0.3);
/** The shape of one cube, its base centred on the origin. Paint it at the screen point of an item. */
export const CUBE: Solid = facetsOf(roundedPlan(-CUBE_SIDE / 2, -CUBE_SIDE / 2, CUBE_SIDE, CUBE_SIDE, 0.12), 0, CUBE_SIDE);

/** Height units that a payload parks above the top face of a part. */
const PARK_RISE = 0.1;
/** Where a payload parks on a part, as a share of the part's width and depth from its back corner. Clear of the label. */
const PARK_SHARE = 0.2;
/** Share of a scene over which a lit part rises, and over which the part of the scene before falls. */
const LIT_RAMP = 0.1;
/** Share of a scene over which an item that shows or hides part way fades, when the item names no share of its own. */
const FADE = 0.03;
/** Radius of a pulse ring when it starts and when it ends, in screen units. */
const RING_RADII = [8, 44] as const;
/** Radius of a ring that holds, when it has finished. */
const HELD_RING_RADIUS = 20;
/** Where five result dots pop up around their point, in grid cells. */
const DOT_OFFSETS = [[-1.3, -0.5], [-0.7, 1.2], [0.9, -1.1], [1.4, 0.6], [0.1, 1.5]] as const;
const DOT_RADIUS = 4.6;
/** Height units that the dots start above their point. */
const DOT_RISE = 1.2;

/**
 * Screen units from the base of the ask tile to the top of its tooltip, which the view box must hold. The tooltip is HTML on top of
 * the figure, so a tile near the top of the picture would otherwise push it out of the stage.
 */
export const ASK_TIP_REACH = 100;

const clamp = (n: number, low = 0, high = 1): number => Math.min(Math.max(n, low), high);
const round = (n: number): number => Math.round(n * 10) / 10;
/** Share of a window that has passed at local progress `u`, from 0 to 1. */
const within = ([from, to]: Window, u: number): number => clamp((u - from) / (to - from));
/** Slow at both ends. */
export const ease = (t: number): number => (t < 0.5 ? 2 * t * t : 1 - (-2 * t + 2) ** 2 / 2);

/** A flow figure laid out: the structure scene and the way to find a screen point for any waypoint. */
export interface FlowLayout {
  data: FlowData;
  structure: StructureScene;
  /** The screen point of a waypoint. An unknown part or mark is an error. */
  resolve: (at: Waypoint) => Point;
}

/** Lays out the structure of a flow figure and returns the means to resolve the waypoints of its scenes. */
export function layoutFlow(data: FlowData): FlowLayout {
  const structure = layoutStructure(data);
  const spots = new Map<string, Point>();
  for (const part of data.parts) {
    const slab = data.slabs.find((s) => s.id === part.on);
    if (!slab) throw new Error(`Part "${part.id}" stands on unknown slab "${part.on}"`);
    spots.set(part.id, project(part.c + part.w * PARK_SHARE, part.r + part.d * PARK_SHARE, (slab.level + 1) * SLAB_HEIGHT + PART_HEIGHT + PARK_RISE));
  }
  const resolve = (at: Waypoint): Point => {
    if (typeof at !== 'string') return project(...at);
    const [id, mark] = at.split('#');
    if (mark === undefined) {
      const spot = spots.get(id);
      if (!spot) throw new Error(`Waypoint "${at}" names no part`);
      return spot;
    }
    const found = structure.solids.find((s) => s.id === id)?.marks?.[Number(mark)];
    if (!found) throw new Error(`Waypoint "${at}" names no mark`);
    return [found.x, found.y];
  };
  const tops = data.scenes.flatMap((scene) => scene.effects.flatMap((e) => (e.kind === 'ask' ? [resolve(e.at)[1] - ASK_TIP_REACH] : [])));
  const [x0, y0, w, h] = structure.viewBox.split(' ').map(Number);
  const top = Math.min(y0, ...tops);
  if (top < y0) structure.viewBox = [x0, round(top), w, round(h + y0 - top)].join(' ');
  return { data, structure, resolve };
}

/** The caption at progress `p`: the intro at rest, then the words of the scene, or of its step when the scene has none of its own. */
export function captionAt(data: FlowData, p: number): string {
  const scene = sceneAt(data, p);
  if (scene === 0) return data.intro;
  const { caption, step } = data.scenes[scene - 1];
  return caption ?? data.steps[step - 1].text;
}

/** True where `p` is the end of a scene that pauses for an ask. Play stops there until the reader approves. */
export function pausedAt(data: FlowData, p: number): boolean {
  const scene = Math.round(p);
  return Math.abs(p - scene) < 1e-9 && scene >= 1 && scene <= data.scenes.length && data.scenes[scene - 1].pause === true;
}

/** The scene that plays at progress `p`: 0 at rest, then 1 for the first scene and so on. The end of a scene belongs to it. */
export function sceneAt(data: FlowData, p: number): number {
  return clamp(Math.ceil(p - 1e-9), 0, data.scenes.length);
}

/** Progress after `ms` more milliseconds of play from `p`. Each scene runs for its own duration. Play stops at the end, and at a scene that pauses for an ask. */
export function advance(data: FlowData, p: number, ms: number): number {
  const end = data.scenes.length;
  let left = ms;
  let at = p;
  while (left > 0 && at < end) {
    const scene = Math.floor(at + 1e-9) + 1;
    const { durationMs } = data.scenes[scene - 1];
    const needed = (scene - at) * durationMs;
    if (left >= needed) {
      left -= needed;
      at = scene;
      if (data.scenes[scene - 1].pause) left = 0;
    } else {
      at += left / durationMs;
      left = 0;
    }
  }
  return at;
}

/** The rows of the record of work at progress `p`: a row for each step whose last scene has finished, in step order. */
export function recordAt(data: FlowData, p: number): RecordRow[] {
  return data.steps
    .filter((_, i) => {
      const last = data.scenes.reduce((found, s, k) => (s.step === i + 1 ? k : found), -1);
      return last >= 0 && p >= last + 1 - 1e-9;
    })
    .map((step) => step.record);
}

/** A hop line to draw: `points` run from the start of the path to the end of what has grown so far. */
export interface FrameHop {
  points: Point[];
  /** Thick while its scene runs, thin and faint after. */
  current: boolean;
}

/** A cube to draw with its base centred on `x`, `y`. Items come sorted so a nearer cube paints after a farther one. */
export interface FrameItem {
  x: number;
  y: number;
  /** `work` is grey, `done` is accent. */
  tone: 'work' | 'done';
  shape: 'cube' | 'envelope';
  opacity: number;
}

export interface FrameRing {
  x: number;
  y: number;
  radius: number;
  opacity: number;
  hold: boolean;
}

export interface FrameDot {
  x: number;
  y: number;
  radius: number;
}

/** The chat card as it shows at one instant. */
export interface FrameChat {
  /** Where the bottom right corner of the card stands. */
  x: number;
  y: number;
  state: 'placeholder' | 'typing' | 'sent';
  text: string;
}

/** The email card as it shows at one instant. The three fields hold what has been typed so far. */
export interface FrameDraft {
  /** Where the top left corner of the card stands. */
  x: number;
  y: number;
  state: 'drafting' | 'ready';
  to: string;
  subject: string;
  body: string;
}

/** An ask as it shows at one instant: the tile at `x`, `y`, waiting with a pause mark or approved with a tick. */
export interface FrameAsk {
  x: number;
  y: number;
  state: 'waiting' | 'approved';
}

/** Everything that is drawn at one progress value, in screen units. A component only maps it to elements. */
export interface Frame {
  /** 0 at rest, then the scene number. */
  scene: number;
  /** For each part that is lifted, how far: above 0 to 1. A part that is not named is at rest. */
  lit: Record<string, number>;
  hops: FrameHop[];
  items: FrameItem[];
  rings: FrameRing[];
  dots: FrameDot[];
  chat: FrameChat | null;
  draft: FrameDraft | null;
  ask: FrameAsk | null;
}

/** The polyline of `path` up to the share `f` of its length. */
function grow(path: readonly Point[], f: number): Point[] {
  const lengths = path.slice(1).map((p, i) => Math.hypot(p[0] - path[i][0], p[1] - path[i][1]));
  let left = f * lengths.reduce((a, b) => a + b, 0);
  const out: Point[] = [path[0]];
  for (let i = 0; i < lengths.length; i++) {
    if (left >= lengths[i]) {
      out.push(path[i + 1]);
      left -= lengths[i];
    } else {
      const t = lengths[i] === 0 ? 0 : left / lengths[i];
      out.push([path[i][0] + (path[i + 1][0] - path[i][0]) * t, path[i][1] + (path[i + 1][1] - path[i][1]) * t]);
      break;
    }
  }
  return out;
}

/** The point at the share `f` of the length of `path`. */
const along = (path: readonly Point[], f: number): Point => grow(path, f).at(-1) ?? path[0];

/** What is drawn at progress `p`. At whole `p` this is the still pose of a scene, which step mode and reduced motion show. */
export function frameAt(layout: FlowLayout, p: number): Frame {
  const { data, resolve } = layout;
  const scene = sceneAt(data, p);
  const u = scene === 0 ? 0 : p - (scene - 1);
  const path = (waypoints: Waypoint[]): Point[] => waypoints.map(resolve);
  const frame: Frame = { scene, lit: {}, hops: [], items: [], rings: [], dots: [], chat: null, draft: null, ask: null };
  if (scene === 0) return frame;

  const lit = (part: string, amount: number): void => {
    if (amount > 0) frame.lit[part] = Math.max(frame.lit[part] ?? 0, round(amount * 100) / 100);
  };
  for (const { part, from } of data.scenes[scene - 1].lit) lit(part, within([from, from + LIT_RAMP], u));
  if (scene > 1) {
    const held = data.scenes[scene - 1].lit.filter((l) => l.from === 0).map((l) => l.part);
    for (const { part } of data.scenes[scene - 2].lit) lit(part, held.includes(part) ? 1 : 1 - within([0, LIT_RAMP], u));
  }

  const loopStart = Math.max(data.scenes.slice(0, scene).map((s) => s.fresh === true).lastIndexOf(true), 0);
  data.scenes.slice(loopStart, scene).forEach((earlier, j) => {
    for (const effect of earlier.effects) {
      if (effect.kind !== 'hop') continue;
      const current = loopStart + j === scene - 1;
      const share = current ? ease(within(effect.draw, u)) : 1;
      if (share > 0) frame.hops.push({ points: grow(path(effect.path), share), current });
    }
  });

  const depths: number[] = [];
  for (const effect of data.scenes[scene - 1].effects) drawEffect(effect, u);
  frame.items = frame.items.map((item, i) => ({ item, depth: depths[i] })).sort((a, b) => a.depth - b.depth || a.item.y - b.item.y).map(({ item }) => item);
  return frame;

  function drawEffect(effect: EffectData, at: number): void {
    switch (effect.kind) {
      case 'hop':
        return;
      case 'item': {
        const show = effect.show ?? [effect.move[0], 1];
        if (at < show[0] || at > show[1]) return;
        const [x, y] = along(path(effect.path), ease(within(effect.move, at)));
        const fade = effect.fade ?? FADE;
        const opacity = Math.min(show[0] > 0 ? clamp((at - show[0]) / fade) : 1, show[1] < 1 ? clamp((show[1] - at) / fade) : 1);
        const envelope = effect.shape === 'envelope';
        depths.push(round(y));
        frame.items.push({
          x: round(x),
          y: round(y - (effect.rise ?? 0) * HEIGHT_UNIT),
          tone: envelope || (effect.qualifiedAt !== undefined && at >= effect.qualifiedAt) ? 'done' : 'work',
          shape: envelope ? 'envelope' : 'cube',
          opacity,
        });
        return;
      }
      case 'ring': {
        const [x, y] = resolve(effect.at);
        const share = within(effect.window, at);
        if (share <= 0) return;
        if (effect.hold) {
          const done = share >= 1;
          frame.rings.push({ x, y, radius: done ? HELD_RING_RADIUS : RING_RADII[0] + (HELD_RING_RADIUS - RING_RADII[0]) * share, opacity: done ? 0.7 : 0.3 + 0.4 * share, hold: true });
        } else if (share < 1) {
          const phase = (share * (effect.pulses ?? 1)) % 1;
          frame.rings.push({ x, y, radius: round(RING_RADII[0] + (RING_RADII[1] - RING_RADII[0]) * phase), opacity: round((1 - phase * 0.8) * 100) / 100, hold: false });
        }
        return;
      }
      case 'dots': {
        const [x, y] = resolve(effect.at);
        const gather = within(effect.gather, at);
        if (gather >= 1) return;
        const [from, to] = effect.pop;
        DOT_OFFSETS.forEach(([dc, dr], j) => {
          const pop = within([from + ((to - from) * j) / DOT_OFFSETS.length, from + ((to - from) * (j + 1)) / DOT_OFFSETS.length], at);
          if (pop <= 0) return;
          const reach = 1 - gather;
          const [ox, oy] = project(dc * reach, dr * reach, DOT_RISE * reach);
          frame.dots.push({ x: round(x + ox), y: round(y + oy), radius: round(DOT_RADIUS * pop) });
        });
        return;
      }
      case 'chat': {
        const [x, y] = resolve(effect.at);
        const typed = Math.round(effect.text.length * within(effect.type, at));
        if (at >= effect.sendAt) frame.chat = { x, y, state: 'sent', text: effect.text };
        else if (typed === 0) frame.chat = { x, y, state: 'placeholder', text: effect.placeholder };
        else frame.chat = { x, y, state: 'typing', text: effect.text.slice(0, typed) };
        return;
      }
      case 'draft': {
        const [x, y] = resolve(effect.at);
        const fields = [effect.to, effect.subject, effect.body];
        let left = Math.round(fields.join('').length * within(effect.type, at));
        const [to, subject, body] = fields.map((field) => {
          const typed = field.slice(0, left);
          left -= typed.length;
          return typed;
        });
        frame.draft = { x, y, state: at >= effect.type[1] ? 'ready' : 'drafting', to, subject, body };
        return;
      }
      case 'ask': {
        if (at < effect.show[0] || at > effect.show[1]) return;
        const [x, y] = resolve(effect.at);
        frame.ask = { x, y, state: effect.approved ? 'approved' : 'waiting' };
      }
    }
  }
}
