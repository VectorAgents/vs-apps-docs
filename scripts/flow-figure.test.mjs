import assert from 'node:assert/strict';
import { test } from 'node:test';
import { advance, frameAt, layoutFlow, recordAt, sceneAt } from '../src/diagrams/figure/flow.ts';
import { project } from '../src/diagrams/figure/geometry.ts';

/** Three parts on one slab, and two scenes: a cube rides from a to b, then a ring pulses on c while two parts are lit. */
const fixture = {
  id: 'fixture',
  title: 'Fixture',
  desc: 'Three parts.',
  caption: 'Fixture',
  intro: 'At rest.',
  slabs: [{ id: 'base', label: 'Base', text: 'Holds the parts.', level: 0, c: 0, r: 0, w: 20, d: 10 }],
  parts: [
    { id: 'a', label: 'A', text: 'First.', icon: 'member', tone: 'core', on: 'base', c: 1, r: 1, w: 3, d: 3 },
    { id: 'b', label: 'B', text: 'Second.', icon: 'app', tone: 'core', on: 'base', c: 8, r: 1, w: 3, d: 3 },
    {
      id: 'c',
      label: 'C',
      text: 'Third.',
      icon: 'connector',
      tone: 'plug',
      on: 'base',
      c: 15,
      r: 1,
      w: 3,
      d: 3,
      marks: [
        { name: 'One', src: '/img/marks/one.png' },
        { name: 'Two', src: '/img/marks/two.png' },
      ],
    },
  ],
  links: [],
  legend: [{ swatch: 'cube', text: 'Work in progress' }],
  steps: [
    { text: 'A sends work to B.', record: { text: 'A sends work.', actor: 'Member' } },
    { text: 'C pulses.', record: { text: 'C pulsed.', actor: 'App' } },
  ],
  scenes: [
    {
      step: 1,
      durationMs: 1000,
      lit: [{ part: 'a', from: 0 }, { part: 'b', from: 0.5 }],
      effects: [
        { kind: 'hop', path: ['a', 'b'], draw: [0.2, 1] },
        { kind: 'item', path: ['a', 'b'], move: [0.2, 1] },
        { kind: 'chat', at: [1, 6, 8], placeholder: 'Ask', text: 'Hello there', type: [0.1, 0.5], sendAt: 0.6 },
      ],
    },
    {
      step: 2,
      durationMs: 2000,
      lit: [{ part: 'c', from: 0.2 }],
      effects: [
        { kind: 'ring', at: 'c#1', window: [0, 0.5], pulses: 2 },
        { kind: 'ring', at: 'c#0', window: [0, 0.5], hold: true },
        { kind: 'dots', at: 'c#0', pop: [0, 0.4], gather: [0.4, 0.6] },
        { kind: 'item', path: ['c#0', 'a'], move: [0.5, 1], rise: 0.95, qualifiedAt: 0.8 },
      ],
    },
  ],
};

const layout = layoutFlow(fixture);
const near = (a, b, tolerance = 0.2) => assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1]) <= tolerance, `${a} is not near ${b}`);

test('resolve: a part id is the back corner of its top face, a mark id is the middle of the mark, a triple is projected', () => {
  near(layout.resolve('a'), project(1 + 0.6, 1 + 0.6, 4 + 2.5 + 0.1));
  const solid = layout.structure.solids.find((s) => s.id === 'c');
  near(layout.resolve('c#1'), [solid.marks[1].x, solid.marks[1].y]);
  near(layout.resolve([2, 3, 5]), project(2, 3, 5));
  assert.throws(() => layout.resolve('nowhere'), /nowhere/);
  assert.throws(() => layout.resolve('c#2'), /c#2/);
});

test('sceneAt: 0 at rest, then the scene that p is inside, with the end of a scene still in that scene', () => {
  assert.deepEqual([0, 0.001, 1, 1.001, 2, 3].map((p) => sceneAt(fixture, p)), [0, 1, 1, 2, 2, 2]);
});

test('frame at rest: nothing lit, drawn or moving', () => {
  const frame = frameAt(layout, 0);
  assert.deepEqual(frame.lit, {});
  assert.deepEqual([frame.hops, frame.items, frame.rings, frame.dots], [[], [], [], []]);
  assert.equal(frame.chat, null);
});

test('hop: grows with the eased progress and is thick while its scene runs', () => {
  assert.deepEqual(frameAt(layout, 0.1).hops, []);
  const half = frameAt(layout, 0.6).hops[0];
  assert.equal(half.current, true);
  assert.equal(half.points.length, 2);
  const [from, to] = [layout.resolve('a'), layout.resolve('b')];
  near(half.points[0], from);
  assert.ok(half.points[1][0] > from[0] && half.points[1][0] < to[0], 'part way along');
  near(frameAt(layout, 1).hops[0].points[1], to);
});

test('hop: stays as a thin line in every later scene', () => {
  const later = frameAt(layout, 1.2).hops;
  assert.equal(later.length, 1);
  assert.equal(later[0].current, false);
  near(later[0].points[1], layout.resolve('b'));
});

test('item: waits at the start, rides the path and rests at the end; it is absent before it shows', () => {
  assert.deepEqual(frameAt(layout, 0.1).items, []);
  const start = frameAt(layout, 0.2).items[0];
  near([start.x, start.y], layout.resolve('a'));
  const end = frameAt(layout, 1).items[0];
  near([end.x, end.y], layout.resolve('b'));
  assert.equal(end.opacity, 1);
});

test('item: a rise lifts it in height units and a qualified cube turns accent', () => {
  const grey = frameAt(layout, 1.7).items[0];
  const done = frameAt(layout, 2).items[0];
  assert.equal(grey.tone, 'work');
  assert.equal(done.tone, 'done');
  near([done.x, done.y], [layout.resolve('a')[0], layout.resolve('a')[1] - 0.95 * 7]);
});

test('lit: a part rises after its start and holds to the end of the scene, and the last scene fades out over its first tenth', () => {
  assert.ok(frameAt(layout, 0.001).lit.a < 0.1, 'just starting to rise');
  assert.equal(frameAt(layout, 1).lit.a, 1);
  assert.equal(frameAt(layout, 1).lit.b, 1);
  assert.equal(frameAt(layout, 0.3).lit.b ?? 0, 0);
  const fading = frameAt(layout, 1.05).lit;
  assert.ok(fading.a > 0 && fading.a < 1, 'the part lit before fades');
  assert.equal(frameAt(layout, 1.2).lit.a ?? 0, 0);
  assert.equal(frameAt(layout, 2).lit.c, 1);
});

test('ring: expands and fades within its window, is gone after it, and a holding ring stays faint', () => {
  assert.deepEqual(frameAt(layout, 1.6).rings.map((r) => r.hold), [true], 'the pulse is gone and the holding ring stays');
  const rings = frameAt(layout, 1.1).rings;
  assert.equal(rings.length, 2);
  const pulse = rings.find((r) => !r.hold);
  assert.ok(pulse.radius > 0 && pulse.opacity > 0 && pulse.opacity <= 1);
  const held = frameAt(layout, 2).rings;
  assert.equal(held.length, 1);
  assert.ok(held[0].hold && held[0].opacity > 0);
});

test('dots: five pop up, gather into the point and vanish', () => {
  assert.equal(frameAt(layout, 1.1).dots.length > 0, true);
  assert.equal(frameAt(layout, 1.1).dots.length <= 5, true);
  assert.equal(frameAt(layout, 1.7).dots.length, 0);
  assert.equal(frameAt(layout, 1.99).dots.length, 0);
});

test('chat: shows the placeholder, types the text, then shows it sent, and the whole text at the end', () => {
  assert.equal(frameAt(layout, 0.05).chat.state, 'placeholder');
  assert.equal(frameAt(layout, 0.05).chat.text, 'Ask');
  const typing = frameAt(layout, 0.3).chat;
  assert.equal(typing.state, 'typing');
  assert.ok(typing.text.length > 0 && typing.text.length < 'Hello there'.length);
  assert.ok('Hello there'.startsWith(typing.text));
  const sent = frameAt(layout, 1).chat;
  assert.deepEqual([sent.state, sent.text], ['sent', 'Hello there']);
  assert.equal(frameAt(layout, 1.5).chat, null);
});

test('advance: a scene takes its own duration, and p stops at the end', () => {
  assert.equal(advance(fixture, 0, 500), 0.5);
  assert.equal(advance(fixture, 1, 1000), 1.5);
  assert.equal(advance(fixture, 0.5, 1000), 1.25, 'the rest of scene 1 takes 500 ms, the other 500 ms are a quarter of scene 2');
  assert.equal(advance(fixture, 1.9, 5000), 2);
});

test('recordAt: a row appears once its step is done and a step without a scene adds none', () => {
  assert.deepEqual(recordAt(fixture, 0.99), []);
  assert.deepEqual(recordAt(fixture, 1).map((r) => r.actor), ['Member']);
  assert.deepEqual(recordAt(fixture, 2).map((r) => r.text), ['A sends work.', 'C pulsed.']);
  assert.deepEqual(recordAt({ ...fixture, scenes: [fixture.scenes[0]] }, 2).map((r) => r.actor), ['Member']);
});

const { workedExampleFlow: example } = await import('../src/diagrams/figures/worked-example-flow.ts');
const exampleLayout = layoutFlow(example);
const words = (text) => text.trim().split(/\s+/).length;
const part = (id) => example.parts.find((p) => p.id === id);

test('worked example: 8 parts on 3 slabs, the AI gateway on Governance and Connectors in the Space slab', () => {
  assert.equal(example.parts.length, 8);
  assert.deepEqual([...example.slabs].sort((a, b) => a.level - b.level).map((s) => s.label), ['Governance', 'Organization', 'Space']);
  assert.equal(part('gateway').on, 'governance');
  assert.equal(part('connectors').on, 'space');
  assert.equal(part('app').on, 'organization');
  assert.deepEqual(example.parts.filter((p) => p.on === 'space').map((p) => p.label).sort(), ['Command Center', 'Connectors', 'Contacts', 'Member', 'Omnibox', 'Orchestrator agent']);
});

test('worked example: the labels are names only', () => {
  for (const item of [...example.parts, ...example.slabs]) assert.match(item.label, /^[A-Z][A-Za-z ]*$/, item.label);
});

test('worked example: a legend of 4 that explains cube, stack, hop and dashed line', () => {
  assert.deepEqual(example.legend.map((i) => i.swatch), ['cube', 'stack', 'hop', 'remote']);
});

test('worked example: Connectors shows the marks of Apollo, Exa and BrightData, and the Vector App has a dashed link to it', () => {
  assert.deepEqual(part('connectors').marks.map((m) => m.name), ['Apollo', 'Exa', 'BrightData']);
  assert.ok(example.links.some((l) => l.remote && [l.from, l.to].sort().join() === 'app,connectors'));
  assert.ok(example.links.every((l) => l.remote));
});

test('worked example: six steps with a record row each, the actors of the spec, and short cells', () => {
  assert.equal(example.steps.length, 6);
  assert.deepEqual(example.steps.map((s) => s.record.actor), ['Member', 'App', 'App', 'Member', 'Member', 'Member']);
  for (const step of example.steps) {
    assert.ok(words(step.record.text) <= 15, step.record.text);
    assert.ok(words(step.text) <= 40, step.text);
  }
  assert.match(example.steps[1].record.text, /"lead qualified"/);
  assert.doesNotMatch(JSON.stringify(example.steps), /outreach sent/);
});

test('worked example: scenes S1 to S3 play steps 1 to 3 for 5.6, 4.8 and 2.2 seconds', () => {
  assert.deepEqual(example.scenes.map((s) => [s.step, s.durationMs]), [[1, 5600], [2, 4800], [3, 2200]]);
});

test('worked example: every waypoint resolves, every window is ordered and inside the scene, and every lit part exists', () => {
  const [x0, y0, w, h] = exampleLayout.structure.viewBox.split(' ').map(Number);
  const waypoints = (effect) => (effect.path ?? [effect.at]).filter(Boolean);
  const windows = (effect) => [effect.draw, effect.move, effect.show, effect.window, effect.pop, effect.gather, effect.type].filter(Boolean);
  for (const scene of example.scenes) {
    for (const { part: id, from } of scene.lit) {
      assert.ok(part(id), id);
      assert.ok(from >= 0 && from < 1, `${id} lit from ${from}`);
    }
    for (const effect of scene.effects) {
      for (const at of waypoints(effect)) {
        const [x, y] = exampleLayout.resolve(at);
        assert.ok(x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + h, `${at} is inside the view box`);
      }
      for (const [from, to] of windows(effect)) assert.ok(from >= 0 && from < to && to <= 1, `${effect.kind} window ${from}, ${to}`);
    }
  }
});

test('worked example: nothing is lit or drawn at rest, and the still pose of each scene shows its result', () => {
  assert.equal(frameAt(exampleLayout, 0).scene, 0);
  const [one, two, three] = [1, 2, 3].map((p) => frameAt(exampleLayout, p));
  assert.deepEqual(Object.keys(one.lit).sort(), ['app', 'member', 'orchestrator']);
  assert.equal(one.chat.state, 'sent');
  assert.equal(one.items.length, 1);
  assert.deepEqual(Object.keys(two.lit).sort(), ['app', 'connectors']);
  assert.equal(two.hops.filter((hop) => hop.current).length, 3, 'one query line to each service');
  assert.equal(two.hops.filter((hop) => !hop.current).length, 1, 'the request hop stays as a thin line');
  assert.deepEqual(two.items.map((i) => i.tone), ['done', 'done', 'done'], 'a stack of three qualified leads');
  assert.deepEqual(Object.keys(three.lit).sort(), ['app', 'contacts']);
  assert.equal(three.hops.filter((hop) => !hop.current).length, 4, 'every finished hop stays as a thin line');
  assert.equal(three.items.length, 3);
});

test('worked example: the record fills in as steps finish', () => {
  assert.deepEqual([0, 1, 2, 3].map((p) => recordAt(example, p).length), [0, 1, 2, 3]);
});

test('worked example: no dashes, no first person plural and no example app name', () => {
  const text = JSON.stringify(example);
  assert.doesNotMatch(text, /[–—]/);
  assert.doesNotMatch(text, /\b(we|our|ours|us)\b/i);
  assert.doesNotMatch(text, /Hiring|SDR|CSR|RedemptAI/);
});
