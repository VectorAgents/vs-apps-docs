import assert from 'node:assert/strict';
import { test } from 'node:test';
import { facetsOf, hullOf, project, roundedPlan } from '../src/diagrams/figure/geometry.ts';

const near = (actual, expected) => assert.ok(Math.abs(actual - expected) < 0.01, `${actual} is not ${expected}`);

test('project: the origin maps to the origin, a column goes right and down, a row left and down, height up', () => {
  assert.deepEqual(project(0, 0, 0), [0, 0]);
  const [colX, colY] = project(1, 0, 0);
  near(colX, 24.25);
  near(colY, 14);
  const [rowX, rowY] = project(0, 1, 0);
  near(rowX, -24.25);
  near(rowY, 14);
  assert.deepEqual(project(0, 0, 2), [0, -14]);
});

test('roundedPlan: radius 0 is the 4 corners of the rectangle', () => {
  assert.deepEqual(roundedPlan(2, 3, 10, 6, 0), [
    [2, 3],
    [12, 3],
    [12, 9],
    [2, 9],
  ]);
});

test('roundedPlan: a radius keeps every point inside the rectangle and cuts each corner', () => {
  const plan = roundedPlan(0, 0, 10, 6, 1);
  assert.ok(plan.length > 8);
  for (const [c, r] of plan) assert.ok(c >= 0 && c <= 10 && r >= 0 && r <= 6, `${c},${r}`);
  assert.ok(!plan.some(([c, r]) => c === 0 && r === 0), 'the sharp corner is gone');
});

test('facetsOf: a sharp box shows two walls, the +row wall light and the +column wall dark', () => {
  const { facets } = facetsOf(roundedPlan(0, 0, 4, 4, 0), 0, 2);
  assert.deepEqual(facets.map((f) => f.bucket), [0, 3]);
});

test('facetsOf: the shade steps from dark to light across a curved corner, through every bucket', () => {
  const { facets } = facetsOf(roundedPlan(0, 0, 10, 6, 1.5), 0, 2);
  const buckets = facets.map((f) => f.bucket);
  assert.deepEqual(buckets, [...buckets].sort((a, b) => a - b), 'dark to light, in order');
  assert.deepEqual([...new Set(buckets)], [0, 1, 2, 3]);
});

test('facetsOf: each facet is one quad, with its top edge above its bottom edge by the wall height', () => {
  const { facets } = facetsOf(roundedPlan(0, 0, 4, 4, 0), 1, 3);
  for (const { points } of facets) {
    assert.equal(points.length, 4);
    near(points[3][1] - points[0][1], 21);
    near(points[2][1] - points[1][1], 21);
  }
});

test('facetsOf: the top face is the whole plan at the top height', () => {
  const { top } = facetsOf(roundedPlan(0, 0, 4, 4, 0), 0, 2);
  assert.deepEqual(top, [project(0, 0, 2), project(4, 0, 2), project(4, 4, 2), project(0, 4, 2)]);
});

test('hullOf: a convex outline that holds every given point', () => {
  const hull = hullOf([[0, 0], [4, 0], [2, 1], [4, 4], [0, 4], [2, 2]]);
  assert.deepEqual(hull.map((p) => p.join(',')).sort(), ['0,0', '0,4', '4,0', '4,4']);
});
