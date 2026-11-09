import assert from 'node:assert/strict';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { project } from '../src/diagrams/figure/geometry.ts';
import { layoutStructure } from '../src/diagrams/figure/layout.ts';
import { slots } from '../src/diagrams/figures/slots.ts';

const figures = join(dirname(fileURLToPath(import.meta.url)), '../src/diagrams/figures');
const words = (text) => text.trim().split(/\s+/).length;
const camel = (id) => id.replace(/-(\w)/g, (_, ch) => ch.toUpperCase());
const inside = ([x, y], polygon) => {
  let hit = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) hit = !hit;
  }
  return hit;
};

/** A slab with two parts, one in front of the other, and one dashed link from the slab to a part. */
const small = {
  id: 'small',
  title: 'Small figure',
  desc: 'A slab with two parts.',
  caption: 'Small figure',
  slabs: [{ id: 'base', label: 'Base', text: 'Holds both parts.', level: 0, c: 0, r: 0, w: 14, d: 10 }],
  parts: [
    { id: 'front', label: 'Front', text: 'In front.', icon: 'app', tone: 'plug', on: 'base', c: 7, r: 5, w: 3, d: 3 },
    { id: 'back', label: 'Back', text: 'Behind.', icon: 'member', tone: 'core', on: 'base', c: 2, r: 1, w: 3, d: 3, items: ['One', 'Two'] },
  ],
  links: [{ id: 'link', from: 'back', to: 'front', remote: true }],
  legend: [{ swatch: 'core', text: 'Inside.' }],
};

test('layout: slabs are painted before the parts on them, and a nearer part after a farther one', () => {
  const order = layoutStructure(small).solids.map((s) => s.id);
  assert.deepEqual(order, ['base', 'back', 'front']);
});

test('layout: a higher slab is painted after a lower one', () => {
  const data = { ...small, slabs: [...small.slabs, { id: 'upper', label: 'Upper', text: 'On top.', level: 1, c: 1, r: 1, w: 8, d: 6 }].reverse(), parts: [] , links: [] };
  assert.deepEqual(layoutStructure(data).solids.map((s) => s.id), ['base', 'upper']);
});

test('layout: a slab rests on its level and a part stands on the top of its slab', () => {
  const scene = layoutStructure({ ...small, slabs: [...small.slabs, { id: 'upper', label: 'Upper', text: 'On top.', level: 1, c: 1, r: 1, w: 8, d: 6 }], parts: [{ ...small.parts[0], on: 'upper', c: 2, r: 2 }], links: [] });
  const centre = (id) => {
    const top = scene.solids.find((s) => s.id === id).top;
    return [top.reduce((sum, p) => sum + p[0], 0) / top.length, top.reduce((sum, p) => sum + p[1], 0) / top.length];
  };
  assert.ok(Math.abs(centre('base')[1] - project(7, 5, 4)[1]) < 0.1, 'base top at height 4');
  assert.ok(Math.abs(centre('upper')[1] - project(5, 4, 8)[1]) < 0.1, 'upper top at height 8');
  assert.ok(Math.abs(centre('front')[1] - project(3.5, 3.5, 10.5)[1]) < 0.1, 'the part top at height 10.5');
});

test('layout: the view box holds every silhouette, lifted by one lift, and every link end', () => {
  const scene = layoutStructure(small);
  const [x0, y0, w, h] = scene.viewBox.split(' ').map(Number);
  for (const solid of scene.solids) {
    for (const [x, y] of solid.hull) assert.ok(x >= x0 && x <= x0 + w && y - 7 >= y0 && y <= y0 + h, `${solid.id} ${x},${y}`);
  }
  for (const link of scene.links) for (const [x, y] of link.points) assert.ok(x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + h, link.id);
});

test('layout: a part label sits at the centre of its top face and a slab label skews onto its front-left face', () => {
  const scene = layoutStructure(small);
  const front = scene.solids.find((s) => s.id === 'front');
  const [cx, cy] = project(8.5, 6.5, 4 + 2.5);
  assert.ok(Math.abs(front.label.x - cx) < 0.1 && Math.abs(front.label.y - cy) < 0.1);
  const base = scene.solids.find((s) => s.id === 'base');
  assert.equal(base.label.skew, true);
  assert.equal(front.label.skew, false);
});

test('layout: a link joins the facing sides of its two ends and keeps the remote flag', () => {
  const [link] = layoutStructure(small).links;
  assert.equal(link.remote, true);
  assert.equal(link.points.length, 2);
  const [[x0, y0], [x1, y1]] = link.points;
  const back = project(5, 3.5, 4 + 1.25);
  const front = project(7, 5.5, 4 + 1.25);
  assert.ok(Math.hypot(x0 - back[0], y0 - back[1]) < 3, 'starts at the back part');
  assert.ok(Math.hypot(x1 - front[0], y1 - front[1]) < 3, 'ends at the front part');
});

test('layout: one entry per part and slab, parts first, with the card text and items', () => {
  const entries = layoutStructure(small).entries;
  assert.deepEqual(entries.map((e) => e.id), ['front', 'back', 'base']);
  assert.deepEqual(entries.find((e) => e.id === 'back'), { id: 'back', label: 'Back', text: 'Behind.', items: ['One', 'Two'] });
  assert.equal(entries.find((e) => e.id === 'front').items, undefined);
});

test('layout: the title, description, caption and legend come from the data', () => {
  const scene = layoutStructure(small);
  assert.equal(scene.title, 'Small figure');
  assert.equal(scene.desc, 'A slab with two parts.');
  assert.equal(scene.caption, 'Small figure');
  assert.deepEqual(scene.legend, small.legend);
});

test('layout: an unknown slab or link end is an error', () => {
  assert.throws(() => layoutStructure({ ...small, parts: [{ ...small.parts[0], on: 'nowhere' }] }), /nowhere/);
  assert.throws(() => layoutStructure({ ...small, links: [{ id: 'x', from: 'back', to: 'nowhere' }] }), /nowhere/);
});

const real = slots.filter((s) => existsSync(join(figures, `${s.id}.ts`)));

test('at least the overview figure has data', () => {
  assert.ok(real.some((s) => s.id === 'space-structure'));
});

for (const slot of real) {
  const data = (await import(join(figures, `${slot.id}.ts`)))[camel(slot.id)];
  const scene = layoutStructure(data);
  const solids = (kind) => scene.solids.filter((s) => s.kind === kind);

  test(`${slot.id}: the data carries the slot id and the registry caption`, () => {
    assert.equal(data.id, slot.id);
    assert.equal(data.caption, slot.caption);
    assert.ok(data.title.length > 0 && data.desc.length > 0);
  });

  test(`${slot.id}: a label and a card text on every part and slab, and ids that are unique`, () => {
    const all = [...data.slabs, ...data.parts];
    for (const item of all) assert.ok(item.label.trim() && item.text.trim(), item.id);
    assert.equal(new Set(all.map((i) => i.id)).size, all.length);
  });

  test(`${slot.id}: at most 8 parts, 3 slabs and a legend of 4 items of 15 words or fewer`, () => {
    assert.ok(data.parts.length <= 8, `${data.parts.length} parts`);
    assert.ok(data.slabs.length <= 3, `${data.slabs.length} slabs`);
    assert.ok(data.legend.length <= 4, `${data.legend.length} legend items`);
    for (const item of data.legend) assert.ok(words(item.text) <= 15, item.text);
  });

  test(`${slot.id}: every part stands inside the footprint of its slab and no two parts share ground`, () => {
    for (const part of data.parts) {
      const slab = data.slabs.find((s) => s.id === part.on);
      assert.ok(slab, `${part.id}: slab ${part.on}`);
      assert.ok(part.c >= slab.c && part.c + part.w <= slab.c + slab.w && part.r >= slab.r && part.r + part.d <= slab.r + slab.d, `${part.id} is inside ${slab.id}`);
    }
    for (const a of data.parts) {
      for (const b of data.parts.filter((p) => p.id > a.id)) {
        const apart = a.c + a.w <= b.c || b.c + b.w <= a.c || a.r + a.d <= b.r || b.r + b.d <= a.r;
        assert.ok(apart, `${a.id} overlaps ${b.id}`);
      }
    }
  });

  test(`${slot.id}: no part is hidden behind another: its top, label and front-left wall stay clear and rows are 1.3 cells apart`, () => {
    const parts = solids('part');
    const sample = (polygon) => {
      const [x0, x1] = [Math.min(...polygon.map((p) => p[0])), Math.max(...polygon.map((p) => p[0]))];
      const [y0, y1] = [Math.min(...polygon.map((p) => p[1])), Math.max(...polygon.map((p) => p[1]))];
      const points = [];
      for (let u = 0; u <= 24; u++) for (let v = 0; v <= 24; v++) points.push([x0 + ((x1 - x0) * u) / 24, y0 + ((y1 - y0) * v) / 24]);
      return points.filter((p) => inside(p, polygon));
    };
    parts.forEach((behind, i) => {
      const walls = behind.facets.filter((f) => f.bucket >= 2).map((f) => f.points);
      const seen = [...sample(behind.top), ...walls.flatMap(sample), [behind.label.x, behind.label.y]];
      for (const front of parts.slice(i + 1)) for (const point of seen) assert.ok(!inside(point, front.hull), `${front.id} covers ${behind.id}`);
    });
    for (const a of data.parts) {
      for (const b of data.parts.filter((p) => p.on === a.on && p.r > a.r && p.c < a.c + a.w && a.c < p.c + p.w)) assert.ok(b.r - (a.r + a.d) >= 1.3 - 1e-9, `${a.id} and ${b.id} rows are ${b.r - (a.r + a.d)} cells apart`);
    }
  });

  test(`${slot.id}: a link names two ids that exist and never runs over a part it does not join`, () => {
    const ids = new Set([...data.slabs, ...data.parts].map((i) => i.id));
    for (const link of data.links) {
      assert.ok(ids.has(link.from) && ids.has(link.to), link.id);
      const [[x0, y0], [x1, y1]] = scene.links.find((l) => l.id === link.id).points;
      for (let t = 0.05; t < 1; t += 0.05) {
        const point = [x0 + (x1 - x0) * t, y0 + (y1 - y0) * t];
        for (const part of solids('part').filter((s) => s.id !== link.from && s.id !== link.to)) assert.ok(!inside(point, part.hull), `${link.id} runs over ${part.id}`);
      }
    }
  });

  test(`${slot.id}: no arrows, no dashes in prose and no first-person plural`, () => {
    assert.ok(!JSON.stringify(scene).match(/arrow|head/i));
    const text = JSON.stringify(data);
    assert.doesNotMatch(text, /[–—]/);
    assert.doesNotMatch(text, /\b(we|our|ours|us)\b/i);
  });
}

const { spaceStructure } = await import(join(figures, 'space-structure.ts'));
const byId = (id) => spaceStructure.parts.find((p) => p.id === id);

test('space-structure: 8 parts on 3 slabs, Governance under Organization under Space', () => {
  assert.equal(spaceStructure.parts.length, 8);
  assert.deepEqual([...spaceStructure.slabs].sort((a, b) => a.level - b.level).map((s) => s.label), ['Governance', 'Organization', 'Space']);
});

test('space-structure: five parts in the space, three outside it on dashed links, and no other link', () => {
  const inSpace = spaceStructure.parts.filter((p) => p.on === 'space').map((p) => p.label);
  assert.deepEqual(inSpace, ['Members', 'Orchestrator agent', 'Command Center', 'Context Hub', 'Vector Modules']);
  const outside = spaceStructure.parts.filter((p) => p.tone === 'plug');
  assert.deepEqual(outside.map((p) => p.label).sort(), ['A2A agent', 'MCP connector', 'Vector App']);
  assert.ok(outside.every((p) => p.on === 'organization'));
  assert.deepEqual(spaceStructure.links.map((l) => l.to).sort(), outside.map((p) => p.id).sort());
  assert.ok(spaceStructure.links.every((l) => l.remote && l.from === 'space'));
});

test('space-structure: the legend has 3 items, inside, outside and dashed link', () => {
  assert.deepEqual(spaceStructure.legend.map((i) => i.swatch), ['core', 'plug', 'remote']);
});

test('space-structure: the Context Hub card lists five kinds and the Vector Modules card lists the modules', () => {
  assert.deepEqual(byId('contextHub').items, ['Connectors', 'Knowledge sources', 'Datasources', 'Skills', 'Apps']);
  assert.deepEqual(byId('modules').items, ['Omnibox', 'Contacts', 'Calendar']);
});

test('space-structure: the Command Center is a plain part, not listed under Vector Modules', () => {
  assert.ok(!byId('modules').items.includes('Command Center'));
  assert.equal(byId('commandCenter').tone, 'core');
});

test('space-structure: the figure names no example app and no vendor', () => {
  assert.doesNotMatch(JSON.stringify(spaceStructure), /Hiring|SDR|CSR|Apollo|Exa|BrightData|RedemptAI/);
});
