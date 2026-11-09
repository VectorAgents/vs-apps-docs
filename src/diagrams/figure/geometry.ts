/** A screen point `[x, y]` in SVG units. */
export type Point = readonly [x: number, y: number];

/** A plan point `[c, r]` on the ground grid, in cells. */
export type PlanPoint = readonly [c: number, r: number];

/** Shade of a wall facet: 0 is the darkest (faces the +column side), 3 the lightest (faces the +row side). */
export type Bucket = 0 | 1 | 2 | 3;

/** One flat patch of a wall. Facets that share a bucket are merged, so a curved corner yields a few facets, not one per segment. */
export interface Facet {
  points: Point[];
  bucket: Bucket;
}

/** The faces of one rounded solid on screen. `hull` is its silhouette. */
export interface Solid {
  /** Visible wall facets, from the dark (+column) side to the light (+row) side. */
  facets: Facet[];
  top: Point[];
  hull: Point[];
}

/** Screen units for one grid cell and for one height unit. */
export const CELL = 28;
export const HEIGHT_UNIT = 7;

const COS30 = Math.cos(Math.PI / 6);
const ARC_SEGMENTS = 6;
const BUCKETS = 4;

/** The `points` attribute of an SVG polygon, rounded to a tenth of a unit. */
export const pointsAttr = (points: readonly Point[]): string => points.map(([x, y]) => `${Math.round(x * 10) / 10},${Math.round(y * 10) / 10}`).join(' ');

/** True 30 degree isometric: a column step goes right and down, a row step goes left and down, height goes up. */
export function project(c: number, r: number, z: number): Point {
  return [(c - r) * CELL * COS30, (c + r) * CELL * 0.5 - z * HEIGHT_UNIT];
}

/**
 * The outline of a rectangle with rounded corners, clockwise on the grid (a column step is right, a row step is down).
 * Radius 0 gives the 4 corners.
 */
export function roundedPlan(c: number, r: number, w: number, d: number, radius: number): PlanPoint[] {
  if (radius === 0) return [[c, r], [c + w, r], [c + w, r + d], [c, r + d]];
  const arcs = [
    { center: [c + w - radius, r + radius], from: -90 },
    { center: [c + w - radius, r + d - radius], from: 0 },
    { center: [c + radius, r + d - radius], from: 90 },
    { center: [c + radius, r + radius], from: 180 },
  ] as const;
  return arcs.flatMap(({ center, from }) =>
    Array.from({ length: ARC_SEGMENTS + 1 }, (_, i): PlanPoint => {
      const angle = ((from + (i * 90) / ARC_SEGMENTS) * Math.PI) / 180;
      return [center[0] + radius * Math.cos(angle), center[1] + radius * Math.sin(angle)];
    }),
  );
}

/** The convex hull of the points, in no set order. */
export function hullOf(points: readonly Point[]): Point[] {
  const sorted = [...points].sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  const cross = (o: Point, a: Point, b: Point): number => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const chain = (list: readonly Point[]): Point[] => {
    const out: Point[] = [];
    for (const p of list) {
      while (out.length >= 2 && cross(out[out.length - 2], out[out.length - 1], p) <= 0) out.pop();
      out.push(p);
    }
    out.pop();
    return out;
  };
  return [...chain(sorted), ...chain([...sorted].reverse())];
}

/**
 * Splits a solid with the given plan, from `z` up by `height` units, into its visible wall facets, its top and its silhouette.
 * A wall segment is visible when its outward normal faces the viewer, and its shade follows the angle of that normal: the
 * facets of a curved corner step through every bucket between the two flat walls.
 */
export function facetsOf(plan: readonly PlanPoint[], z: number, height: number): Solid {
  const top = plan.map(([c, r]) => project(c, r, z + height));
  const bottom = plan.map(([c, r]) => project(c, r, z));
  const facets: Facet[] = [];
  let run: { bucket: Bucket; from: number; to: number } | null = null;
  const close = (): void => {
    if (!run) return;
    const indexes = Array.from({ length: run.to - run.from + 1 }, (_, i) => (run!.from + i) % plan.length);
    facets.push({ points: [...indexes.map((i) => top[i]), ...[...indexes].reverse().map((i) => bottom[i])], bucket: run.bucket });
    run = null;
  };
  for (let i = 0; i < plan.length; i++) {
    const [c0, r0] = plan[i];
    const [c1, r1] = plan[(i + 1) % plan.length];
    const [nc, nr] = [r1 - r0, c0 - c1];
    if (nc + nr <= 1e-9) {
      close();
      continue;
    }
    const angle = (Math.atan2(nr, nc) * 180) / Math.PI;
    const bucket = Math.round(Math.min(Math.max(angle / 90, 0), 1) * (BUCKETS - 1)) as Bucket;
    if (run && run.bucket === bucket) run.to = i + 1;
    else {
      close();
      run = { bucket, from: i, to: i + 1 };
    }
  }
  close();
  return { facets, top, hull: hullOf([...top, ...bottom]) };
}
