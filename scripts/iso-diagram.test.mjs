import assert from 'node:assert/strict';
import { test } from 'node:test';
import { layoutDiagram } from '../src/diagrams/isoLayout.ts';
import { appsOverview } from '../src/diagrams/apps-overview.ts';
import { spaceOverview } from '../src/diagrams/space-overview.ts';

const words = (text) => text.trim().split(/\s+/).length;

/** One slab, two parts that overlap on screen, one lettered link and one dashed link. */
const small = {
  title: 'Small scene',
  desc: 'A slab with two parts.',
  caption: 'Small scene',
  legendTitles: { places: 'Places', parts: 'Parts', links: 'Links' },
  slabs: [{ id: 'base', label: 'Base', text: 'Holds both parts.', tone: 'slab', c: 0, r: 0, w: 6, d: 6, h: 2, z: 0 }],
  parts: [
    { id: 'near', label: 'Near part', text: 'The part in front.', badge: 2, tone: 'plug', c: 3, r: 3, w: 2, d: 2, h: 4, z: 2 },
    { id: 'far', label: 'Far part', text: 'The part behind.', badge: 1, tone: 'core', c: 1, r: 1, w: 2, d: 2, h: 4, z: 2 },
  ],
  links: [
    { id: 'go', badge: 'a', text: 'Far part calls near part.', from: [2, 2], to: [3, 3], z: 2 },
    { id: 'remote', from: [5, 0], to: [6, 0], z: 2, remote: true },
  ],
};

const unit = 22;
const project = (c, r, z) => [(c - r) * unit * Math.cos(Math.PI / 6), (c + r) * unit * 0.5 - z];
const point = (text) => text.split(' ').map((pair) => pair.split(',').map(Number));
const topOf = (box) => point(layoutDiagram({ ...small, slabs: [{ id: 'b', label: 'B', text: 'B.', tone: 'slab', c: 0, r: 0, w: 1, d: 1, h: 0, z: 0, ...box }], parts: [], links: [] }).shapes[0].top);

test('projection: the origin maps to the origin, a column step goes right and down, a row step left and down', () => {
  const [origin, column, , row] = topOf({});
  assert.deepEqual(origin, [0, 0]);
  assert.ok(Math.abs(column[0] - unit * Math.cos(Math.PI / 6)) < 0.1);
  assert.equal(column[1], unit / 2);
  assert.ok(Math.abs(row[0] + unit * Math.cos(Math.PI / 6)) < 0.1);
  assert.equal(row[1], unit / 2);
});

test('projection: height goes up', () => {
  assert.equal(topOf({ h: 7 })[0][1], -7);
});

test('layout: a nearer part is painted after a farther one, and a slab before the parts on it', () => {
  const ids = layoutDiagram(small).shapes.filter((s) => s.kind === 'block').map((s) => s.id);
  assert.deepEqual(ids, ['base', 'far', 'near']);
});

test('layout: the view box holds every corner of every block and every link end', () => {
  const scene = layoutDiagram(small);
  const [x0, y0, w, h] = scene.viewBox.split(' ').map(Number);
  for (const b of [...small.slabs, ...small.parts]) {
    for (const [c, r, z] of [[b.c, b.r, b.z + b.h], [b.c + b.w, b.r, b.z + b.h], [b.c + b.w, b.r + b.d, b.z], [b.c, b.r + b.d, b.z]]) {
      const [x, y] = project(c, r, z);
      assert.ok(x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + h, `${b.id} corner ${c},${r},${z}`);
    }
  }
  for (const l of small.links) {
    for (const [c, r] of [l.from, l.to]) {
      const [x, y] = project(c, r, l.z);
      assert.ok(x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + h, `${l.id} end`);
    }
  }
});

test('layout: only plug parts carry the highlight and glow, and a slab never does', () => {
  const blocks = layoutDiagram(small).shapes.filter((s) => s.kind === 'block');
  const by = Object.fromEntries(blocks.map((b) => [b.id, b]));
  assert.ok(by.near.glow && by.near.highlight);
  assert.ok(!by.far.glow && !by.far.highlight);
  assert.ok(!by.base.glow && !by.base.highlight);
});

test('layout: every numbered part and lettered link draws one badge and the dashed link draws none', () => {
  const badges = layoutDiagram(small).shapes.filter((s) => s.kind === 'badge').map((s) => s.text).sort();
  assert.deepEqual(badges, ['1', '2', 'a']);
  const links = layoutDiagram(small).shapes.filter((s) => s.kind === 'link');
  assert.deepEqual(links.map((l) => [l.id, l.remote]), [['go', false], ['remote', true]]);
});

test('legend: parts run in badge order, links keep their letters, slabs are listed unmarked', () => {
  const { legend } = layoutDiagram(small);
  assert.deepEqual(legend.parts.map((i) => i.marker), ['1', '2']);
  assert.deepEqual(legend.path.map((i) => i.marker), ['a']);
  assert.deepEqual(legend.places.map((i) => i.marker), [null]);
  assert.equal(legend.parts[0].text, 'Far part. The part behind.');
  assert.equal(legend.path[0].text, 'Far part calls near part.');
});

test('text alternative: the scene carries the title, the description and the caption from the data', () => {
  const scene = layoutDiagram(small);
  assert.equal(scene.title, 'Small scene');
  assert.equal(scene.desc, 'A slab with two parts.');
  assert.equal(scene.caption, 'Small scene');
});

test('apps overview: five numbered parts, four lettered lines a to d, two slabs', () => {
  const { legend } = layoutDiagram(appsOverview);
  assert.deepEqual(legend.parts.map((i) => i.marker), ['1', '2', '3', '4', '5']);
  assert.deepEqual(legend.path.map((i) => i.marker), ['a', 'b', 'c', 'd']);
  assert.deepEqual(legend.places.map((i) => i.text.split('.')[0]), ['Vector Space', 'Your origin']);
});

test('apps overview: plug marks your client, server and manifest, and nothing else', () => {
  const plug = appsOverview.parts.filter((p) => p.tone === 'plug').map((p) => p.id).sort();
  assert.deepEqual(plug, ['client', 'manifest', 'server']);
  assert.ok(appsOverview.slabs.every((s) => s.tone === 'slab'));
});

test('apps overview: client, data and gateway stand on the Vector Space slab and server and manifest on Your origin', () => {
  const inside = (part, slab) => part.c >= slab.c && part.c + part.w <= slab.c + slab.w && part.r >= slab.r && part.r + part.d <= slab.r + slab.d;
  const slab = Object.fromEntries(appsOverview.slabs.map((s) => [s.id, s]));
  const part = Object.fromEntries(appsOverview.parts.map((p) => [p.id, p]));
  for (const id of ['client', 'data', 'gateway']) assert.ok(inside(part[id], slab.space), id);
  for (const id of ['server', 'manifest']) assert.ok(inside(part[id], slab.origin), id);
});

test('apps overview: the lines are lettered a to d, never pass through a part and never cross one another', () => {
  const lines = Object.fromEntries(appsOverview.links.map((l) => [l.badge, l]));
  assert.deepEqual(Object.keys(lines).sort(), ['a', 'b', 'c', 'd']);
  const through = (line, p) => {
    const [[c0, r0], [c1, r1]] = [line.from, line.to];
    for (let t = 0; t <= 1; t += 0.01) {
      const c = c0 + (c1 - c0) * t;
      const r = r0 + (r1 - r0) * t;
      if (c > p.c && c < p.c + p.w && r > p.r && r < p.r + p.d && line.z >= p.z && line.z < p.z + p.h) return true;
    }
    return false;
  };
  for (const line of Object.values(lines)) for (const p of appsOverview.parts) assert.ok(!through(line, p), `${line.badge} passes through ${p.id}`);
  const cross = (a, b) => {
    const [p, r] = [a.from, a.to];
    const [q, s] = [b.from, b.to];
    const d = (r[0] - p[0]) * (s[1] - q[1]) - (r[1] - p[1]) * (s[0] - q[0]);
    if (d === 0) return false;
    const t = ((q[0] - p[0]) * (s[1] - q[1]) - (q[1] - p[1]) * (s[0] - q[0])) / d;
    const u = ((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0])) / d;
    return t > 0 && t < 1 && u > 0 && u < 1;
  };
  const letters = Object.keys(lines).sort();
  for (let i = 0; i < letters.length; i++) for (let j = i + 1; j < letters.length; j++) assert.ok(!cross(lines[letters[i]], lines[letters[j]]), `${letters[i]} crosses ${letters[j]}`);
});

test('apps overview: each legend item is 15 words or fewer, with no em or en dash and no first-person plural', () => {
  const { legend } = layoutDiagram(appsOverview);
  for (const item of [...legend.places, ...legend.parts, ...legend.path]) {
    assert.ok(words(item.text) <= 15, `${words(item.text)} words: ${item.text}`);
    assert.doesNotMatch(item.text, /[–—]/);
    assert.doesNotMatch(item.text, /\b(we|our|ours|us)\b/i);
  }
  for (const text of [appsOverview.title, appsOverview.desc, appsOverview.caption]) {
    assert.ok(text.length > 0);
    assert.doesNotMatch(text, /[–—]/);
  }
});

test('apps overview: terms follow the glossary', () => {
  const all = JSON.stringify(appsOverview);
  assert.doesNotMatch(all, /service token|workspace|RedemptAI/i);
  assert.doesNotMatch(all, /(?<!Vector )\bSpace\b/);
  assert.match(all, /app token/);
});

const spacePart = (id) => spaceOverview.parts.find((p) => p.id === id);
const spaceSlab = (id) => spaceOverview.slabs.find((s) => s.id === id);
const within = (box, slab) => box.c >= slab.c && box.c + box.w <= slab.c + slab.w && box.r >= slab.r && box.r + box.d <= slab.r + slab.d;

test('space overview: eight numbered parts in the order of the page, two slabs, two dashed links with no letter', () => {
  const { legend } = layoutDiagram(spaceOverview);
  assert.deepEqual(legend.parts.map((i) => i.marker), ['1', '2', '3', '4', '5', '6', '7', '8']);
  assert.deepEqual(
    legend.parts.map((i) => i.text.split('.')[0]),
    ['Orchestrator agent', 'Resource pool', 'Members', 'Space pages', 'Command Center', 'Vector Apps', 'A2A agent', 'MCP connector'],
  );
  assert.deepEqual(legend.places.map((i) => i.text.split('.')[0]), ['Organization', 'Space']);
  assert.deepEqual(legend.path, []);
  assert.deepEqual(spaceOverview.links.map((l) => l.remote), [true, true]);
});

test('space overview: plug marks Vector Apps, the A2A agent and the MCP connector, and nothing else', () => {
  assert.deepEqual(spaceOverview.parts.filter((p) => p.tone === 'plug').map((p) => p.id).sort(), ['a2a', 'app', 'mcp']);
  assert.ok(spaceOverview.slabs.every((s) => s.tone === 'slab'));
});

test('space overview: six parts stand on the Space slab, the Space slab on the Organization slab, and the A2A agent and MCP connector outside both', () => {
  for (const id of ['orchestrator', 'pool', 'members', 'pages', 'commandCenter', 'app']) {
    assert.ok(within(spacePart(id), spaceSlab('space')), id);
    assert.equal(spacePart(id).z, spaceSlab('space').z + spaceSlab('space').h, id);
  }
  assert.ok(within(spaceSlab('space'), spaceSlab('organization')));
  assert.equal(spaceSlab('space').z, spaceSlab('organization').z + spaceSlab('organization').h);
  for (const id of ['a2a', 'mcp']) {
    const outside = (slab) => spacePart(id).c >= slab.c + slab.w || spacePart(id).r >= slab.r + slab.d;
    assert.ok(outside(spaceSlab('organization')), id);
  }
});

test('space overview: each dashed link joins one outside part to the Space slab and passes through no part', () => {
  for (const [link, id] of [[spaceOverview.links[0], 'a2a'], [spaceOverview.links[1], 'mcp']]) {
    const part = spacePart(id);
    assert.ok(link.from[0] >= part.c && link.from[0] <= part.c + part.w && link.from[1] >= part.r && link.from[1] <= part.r + part.d, `${id} start`);
    assert.ok(link.z > part.z && link.z < part.z + part.h, `${id} height`);
    const space = spaceSlab('space');
    assert.equal(link.to[0], space.c + space.w, `${id} end on the Space slab edge`);
    assert.ok(link.to[1] > space.r && link.to[1] < space.r + space.d, `${id} end`);
    for (const p of spaceOverview.parts.filter((q) => q.id !== id)) {
      for (let t = 0; t <= 1; t += 0.01) {
        const c = link.from[0] + (link.to[0] - link.from[0]) * t;
        const r = link.from[1] + (link.to[1] - link.from[1]) * t;
        const hit = c > p.c && c < p.c + p.w && r > p.r && r < p.r + p.d && link.z >= p.z && link.z < p.z + p.h;
        assert.ok(!hit, `${id} link passes through ${p.id}`);
      }
    }
  }
});

test('space overview: each legend item is 15 words or fewer, with no em or en dash and no first-person plural', () => {
  const { legend } = layoutDiagram(spaceOverview);
  for (const item of [...legend.places, ...legend.parts]) {
    assert.ok(words(item.text) <= 15, `${words(item.text)} words: ${item.text}`);
    assert.doesNotMatch(item.text, /[–—]/);
    assert.doesNotMatch(item.text, /\b(we|our|ours|us)\b/i);
  }
  for (const text of [spaceOverview.title, spaceOverview.desc, spaceOverview.caption]) {
    assert.ok(text.length > 0);
    assert.doesNotMatch(text, /[–—]/);
  }
});

test('space overview: terms follow the glossary and the picture names no Vector Module or example app', () => {
  const all = JSON.stringify(spaceOverview);
  assert.doesNotMatch(all, /workspace|RedemptAI|omnibox|contacts|calendar|Hiring|SDR|CSR/i);
});
