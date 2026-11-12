import assert from 'node:assert/strict';
import { test } from 'node:test';
import { ASK_TIP_REACH, advance, captionAt, frameAt, layoutFlow, pausedAt, recordAt, sceneAt } from '../src/diagrams/figure/flow.ts';
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

test('fresh: a scene that starts a new loop leaves out the hops of the scenes before it', () => {
  const second = { ...fixture.scenes[1], fresh: true, effects: [{ kind: 'hop', path: ['b', 'c'], draw: [0, 1] }] };
  const loops = layoutFlow({ ...fixture, scenes: [fixture.scenes[0], second, { ...fixture.scenes[0], step: 2 }] });
  assert.equal(frameAt(loops, 1.5).hops.length, 1, 'only the hop of the new loop');
  assert.equal(frameAt(loops, 2).hops.length, 1);
  assert.equal(frameAt(loops, 3).hops.length, 2, 'the scene after a fresh one keeps its hop as a thin line');
  assert.equal(frameAt(layout, 2).hops.length, 1, 'with no fresh scene every hop stays');
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

/** The fixture with a third scene that raises an ask and pauses, a fourth that approves it, and an envelope and a draft card. */
const asking = {
  ...fixture,
  steps: [...fixture.steps, { text: 'An ask waits.', record: { text: 'The ask waits.', actor: 'Member' } }],
  scenes: [
    fixture.scenes[0],
    {
      step: 2,
      durationMs: 1000,
      lit: [{ part: 'a', from: 0 }],
      effects: [
        { kind: 'draft', at: [1, 6, 8], from: 'Writer', to: 'Ava', subject: 'Hello', body: 'Could we talk?', type: [0.1, 0.6] },
        { kind: 'item', shape: 'envelope', path: ['a', 'a'], move: [0.8, 1] },
      ],
    },
    {
      step: 3,
      durationMs: 1000,
      pause: true,
      caption: 'The run waits.',
      lit: [{ part: 'b', from: 0 }],
      effects: [
        { kind: 'item', shape: 'envelope', path: ['a', 'b'], move: [0, 0.6] },
        { kind: 'ask', at: [8, 2, 10], show: [0.6, 1] },
      ],
    },
    {
      step: 3,
      durationMs: 1000,
      lit: [{ part: 'b', from: 0 }],
      effects: [
        { kind: 'ask', at: [8, 2, 10], show: [0, 0.4], approved: true },
        { kind: 'item', shape: 'envelope', path: ['b', 'c'], move: [0.3, 1], show: [0, 0.9], fade: 0.1 },
      ],
    },
  ],
};
const askLayout = layoutFlow(asking);

test('pause: play stops at the end of a pause scene and a later advance from there runs the next scene', () => {
  assert.equal(advance(asking, 0, 10_000), 3, 'stops where the ask waits');
  assert.equal(advance(asking, 2.5, 10_000), 3);
  assert.equal(advance(asking, 3, 500), 3.5, 'play from the pause approves it');
  assert.equal(advance(asking, 3, 10_000), 4);
  assert.deepEqual([2, 2.5, 3, 4].map((p) => pausedAt(asking, p)), [false, false, true, false]);
});

test('ask: shows once its window opens, as waiting in the pause scene and as approved in the next', () => {
  assert.equal(frameAt(askLayout, 2.5).ask, null);
  const waiting = frameAt(askLayout, 3).ask;
  assert.equal(waiting.state, 'waiting');
  near([waiting.x, waiting.y], project(8, 2, 10));
  const approved = frameAt(askLayout, 3.2).ask;
  assert.equal(approved.state, 'approved');
  assert.equal(frameAt(askLayout, 4).ask, null, 'the ask is cleared when the approval has run');
});

test('item: an envelope is a flat tile, and it fades out over its own fade share', () => {
  assert.equal(frameAt(askLayout, 2).items[0].shape, 'envelope');
  assert.equal(frameAt(askLayout, 1.5).items.length, 0);
  assert.equal(frameAt(askLayout, 3.4).items[0].shape, 'envelope');
  const fading = frameAt(askLayout, 3.85).items[0];
  assert.ok(fading.opacity > 0 && fading.opacity < 1, `opacity ${fading.opacity}`);
  assert.deepEqual(frameAt(askLayout, 4).items, []);
});

test('draft: types the address, the subject and the body in turn, and says when it is ready', () => {
  const empty = frameAt(askLayout, 1.1).draft;
  assert.equal(empty.from, 'Writer', 'the card names its author from the data');
  assert.deepEqual([empty.state, empty.to, empty.subject, empty.body], ['drafting', '', '', '']);
  const subject = frameAt(askLayout, 1.2).draft;
  assert.deepEqual([subject.to, subject.subject, subject.body], ['Ava', 'H', '']);
  const body = frameAt(askLayout, 1.35).draft;
  assert.deepEqual([body.to, body.subject, body.body], ['Ava', 'Hello', 'Cou']);
  const done = frameAt(askLayout, 2).draft;
  assert.deepEqual([done.state, done.to, done.subject, done.body], ['ready', 'Ava', 'Hello', 'Could we talk?']);
  assert.equal(frameAt(askLayout, 2.5).draft, null);
});

test('lit: a part that two scenes in a row light from their start stays up between them', () => {
  assert.equal(frameAt(askLayout, 3).lit.b, 1);
  assert.equal(frameAt(askLayout, 3.02).lit.b, 1);
});

test('caption: a scene can word the caption of its step, and the step text is the rest', () => {
  assert.equal(captionAt(asking, 0), 'At rest.');
  assert.equal(captionAt(asking, 3), 'The run waits.');
  assert.equal(captionAt(asking, 4), 'An ask waits.');
  assert.equal(captionAt(asking, 1), 'A sends work to B.');
});

const { workedExampleFlow: example } = await import('../src/diagrams/figures/worked-example-flow.ts');
const exampleLayout = layoutFlow(example);
const words = (text) => text.trim().split(/\s+/).length;
const part = (id) => example.parts.find((p) => p.id === id);

test('worked example: 8 parts on 3 slabs, the AI gateway on Governance and Connectors in the space slab', () => {
  assert.equal(example.parts.length, 8);
  assert.deepEqual([...example.slabs].sort((a, b) => a.level - b.level).map((s) => s.label), ['Governance', 'Organization', 'Workspace']);
  assert.equal(part('gateway').on, 'governance');
  assert.equal(part('connectors').on, 'space');
  assert.equal(part('app').on, 'organization');
  assert.deepEqual(example.parts.filter((p) => p.on === 'space').map((p) => p.label).sort(), ['Command Center', 'Connectors', 'Contacts', 'Member', 'Omnibox', 'Orchestrator agent']);
});

test('worked example: the labels are names only', () => {
  for (const item of [...example.parts, ...example.slabs]) assert.match(item.label, /^[A-Za-z][A-Za-z ]*$/, item.label);
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

test('worked example: seven scenes play the six steps, and only the scene that raises the ask pauses', () => {
  assert.deepEqual(example.scenes.map((s) => [s.step, s.durationMs]), [[1, 5600], [2, 4800], [3, 2200], [4, 7000], [5, 2600], [5, 2400], [6, 3000]]);
  assert.deepEqual(example.scenes.map((s) => s.pause === true), [false, false, false, false, true, false, false]);
  assert.ok(example.scenes[4].caption && example.scenes[5].caption, 'the ask and the approval word their own captions');
  for (const [i] of example.steps.entries()) assert.ok(example.scenes.some((s) => s.step === i + 1), `step ${i + 1} has a scene, so its pill works`);
});

test('worked example: auto-play halts at the ask and an approval plays the rest to the end', () => {
  assert.equal(advance(example, 0, 60_000), 5);
  assert.equal(pausedAt(example, 5), true);
  assert.equal(advance(example, 5, 60_000), 7);
  assert.equal(captionAt(example, 5), example.scenes[4].caption);
  assert.match(captionAt(example, 5), /waits/);
});

test('worked example: every step names the heading that holds the list of steps', () => {
  assert.deepEqual(example.steps.map((s) => s.href), Array(6).fill('#the-six-steps'));
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

test('worked example: the draft is the still pose of scene 4, with a gateway ping and one envelope', () => {
  const four = frameAt(exampleLayout, 4);
  assert.deepEqual(Object.keys(four.lit).sort(), ['contacts', 'gateway', 'orchestrator']);
  assert.deepEqual([four.draft.state, four.chat], ['ready', null]);
  assert.ok(four.draft.to && four.draft.subject && four.draft.body);
  assert.equal(four.draft.from, 'Orchestrator agent');
  assert.deepEqual(four.items.map((i) => i.shape), ['envelope']);
  assert.equal(four.hops.filter((hop) => hop.current).length, 2, 'the cube to the agent and the call to the gateway');
  assert.ok(frameAt(exampleLayout, 3.5).rings.some((ring) => !ring.hold), 'the gateway pings');
  assert.equal(frameAt(exampleLayout, 3.3).draft.state, 'drafting');
});

test('worked example: the ask waits in the pause pose, the approval clears it and the email leaves through the Omnibox', () => {
  const [five, six, seven] = [5, 6, 7].map((p) => frameAt(exampleLayout, p));
  assert.deepEqual([five.ask.state, five.draft], ['waiting', null]);
  assert.deepEqual(Object.keys(five.lit), ['commandCenter']);
  assert.equal(frameAt(exampleLayout, 4.5).ask, null, 'the ask is not there while the envelope is on its way');
  const near = ([x, y], at) => Math.hypot(x - exampleLayout.resolve(at)[0], y - exampleLayout.resolve(at)[1]);
  assert.ok(near([five.items[0].x, five.items[0].y], 'commandCenter') < 2, 'the envelope waits at the Command Center');
  assert.equal(frameAt(exampleLayout, 5.1).ask.state, 'approved');
  assert.equal(six.ask, null);
  assert.ok(near([six.items[0].x, six.items[0].y], 'omnibox') < 2, 'the envelope is at the Omnibox once approved');
  assert.deepEqual(Object.keys(six.lit).sort(), ['commandCenter', 'member']);
  assert.deepEqual(Object.keys(seven.lit), ['omnibox']);
  assert.deepEqual(seven.items, [], 'the email is gone');
  assert.equal(seven.hops.length, 10, 'every hop stays drawn');
});

test('worked example: the record fills in as steps finish, and the approval row waits for the approval', () => {
  assert.deepEqual([0, 1, 2, 3, 4, 5, 6, 7].map((p) => recordAt(example, p).length), [0, 1, 2, 3, 4, 4, 5, 6]);
});

test('worked example: no dashes, no first person plural and no example app name', () => {
  const text = JSON.stringify(example);
  assert.doesNotMatch(text, /[–—]/);
  assert.doesNotMatch(text, /\b(we|our|ours|us)\b/i);
  assert.doesNotMatch(text, /Hiring|SDR|CSR|RedemptAI/);
});

const { approvalsFlow: approvals } = await import('../src/diagrams/figures/approvals-flow.ts');
const { extendingFlow: extending } = await import('../src/diagrams/figures/extending-flow.ts');
const { slotOf } = await import('../src/diagrams/figures/slots.ts');
const approvalsLayout = layoutFlow(approvals);
const extendingLayout = layoutFlow(extending);

function sharedFlowTests(name, data, laid) {
  test(`${name}: the data carries the slot id and the registry caption, and every step has a scene in order`, () => {
    assert.equal(data.id, name);
    assert.equal(data.caption, slotOf(name).caption);
    for (const [i] of data.steps.entries()) assert.ok(data.scenes.some((s) => s.step === i + 1), `step ${i + 1}`);
    const order = data.scenes.map((s) => s.step);
    assert.deepEqual(order, [...order].sort((a, b) => a - b));
  });


  test(`${name}: every waypoint resolves inside the view box, every window is ordered and every lit part exists`, () => {
    const [x0, y0, w, h] = laid.structure.viewBox.split(' ').map(Number);
    const windows = (effect) => [effect.draw, effect.move, effect.show, effect.window, effect.pop, effect.gather, effect.type].filter(Boolean);
    for (const scene of data.scenes) {
      for (const { part: id, from } of scene.lit) {
        assert.ok(data.parts.some((p) => p.id === id), id);
        assert.ok(from >= 0 && from < 1);
      }
      for (const effect of scene.effects) {
        for (const at of (effect.path ?? [effect.at]).filter(Boolean)) {
          const [x, y] = laid.resolve(at);
          assert.ok(x >= x0 && x <= x0 + w && y >= y0 && y <= y0 + h, `${at} is inside the view box`);
        }
        for (const [from, to] of windows(effect)) assert.ok(from >= 0 && from < to && to <= 1, `${effect.kind} window ${from}, ${to}`);
      }
    }
  });


  test(`${name}: the view box leaves room above every ask tile for its tooltip`, () => {
    const y0 = Number(laid.structure.viewBox.split(' ')[1]);
    for (const scene of data.scenes) for (const effect of scene.effects) if (effect.kind === 'ask') assert.ok(laid.resolve(effect.at)[1] - ASK_TIP_REACH >= y0 - 1e-6, `${effect.at}`);
  });


  test(`${name}: nothing is drawn at rest and no ask is left in the last pose`, () => {
    const rest = frameAt(laid, 0);
    assert.deepEqual([rest.scene, rest.hops, rest.items, rest.ask], [0, [], [], null]);
    assert.equal(frameAt(laid, data.scenes.length).ask, null);
  });
}

for (const [name, data, laid] of [['approvals-flow', approvals, approvalsLayout], ['extending-flow', extending, extendingLayout]]) {
  sharedFlowTests(name, data, laid);

  test(`${name}: names only on parts and slabs, no dashes, no first person plural, no vendor, short cells, every actor the member`, () => {
    for (const item of [...data.parts, ...data.slabs]) assert.match(item.label, /^[A-Za-z][A-Za-z0-9 ]*$/, item.label);
    const text = JSON.stringify(data);
    assert.doesNotMatch(text, /[–—]/);
    assert.doesNotMatch(text, /\b(we|our|ours|us)\b/i);
    assert.doesNotMatch(text, /Apollo|Exa\b|BrightData|Slack|Hiring|SDR|CSR|RedemptAI|\bgrant\b/);
    for (const step of data.steps) assert.ok(words(step.record.text) <= 15 && words(step.text) <= 40, step.text);
    assert.deepEqual([...new Set(data.steps.map((s) => s.record.actor))], ['Member']);
    for (const scene of data.scenes) if (scene.caption) assert.ok(words(scene.caption) <= 40, scene.caption);
  });
}

test('approvals-flow: Member, Orchestrator agent, Command Center and a Context on one space slab, and no Omnibox', () => {
  assert.deepEqual(approvals.parts.map((p) => p.label).sort(), ['Command Center', 'Context', 'Member', 'Orchestrator agent']);
  assert.deepEqual(approvals.slabs.map((s) => s.label), ['Workspace']);
  assert.doesNotMatch(JSON.stringify(approvals), /Omnibox/);
});

test('approvals-flow: three loops of 4, 3 and 4 frames, 11 in all, each loop one step with its own heading and a caption on every frame', () => {
  assert.equal(approvals.steps.length, 3);
  assert.deepEqual(approvals.steps.map((s) => s.href), ['#the-ask-and-who-decides-it', '#standing-approvals', '#schedules']);
  assert.deepEqual([1, 2, 3].map((step) => approvals.scenes.filter((s) => s.step === step).length), [4, 3, 4]);
  assert.equal(approvals.scenes.length, 11);
  assert.ok(approvals.scenes.every((s) => s.caption));
  assert.deepEqual(approvals.scenes.map((s, i) => s.fresh === true), approvals.scenes.map((s, i) => i === 4 || i === 7));
});

test('approvals-flow: play halts at the ask of loop 1 and at the ask of loop 3, and an approval plays on from each', () => {
  assert.deepEqual(approvals.scenes.map((s) => s.pause === true), approvals.scenes.map((s, i) => i === 1 || i === 9));
  assert.equal(advance(approvals, 0, 600_000), 2);
  assert.equal(pausedAt(approvals, 2), true);
  assert.equal(advance(approvals, 2, 600_000), 10);
  assert.equal(pausedAt(approvals, 10), true);
  assert.equal(advance(approvals, 10, 600_000), 11);
});

test('approvals-flow: each ask waits in its pause pose, is approved in the next frame and is gone once the call goes through', () => {
  const ask = (p) => frameAt(approvalsLayout, p).ask?.state ?? null;
  assert.deepEqual([1, 2, 3, 4].map(ask), [null, 'waiting', 'approved', null]);
  assert.deepEqual([5, 6, 7].map(ask), ['approved', null, null], 'loop 2 shows the approval with its tick and raises no new ask');
  assert.deepEqual([8, 9, 10, 11].map(ask), [null, null, 'waiting', null]);
});

test('approvals-flow: a new loop starts on a clean picture, and the record gains one row per loop', () => {
  assert.ok(frameAt(approvalsLayout, 4).hops.length >= 3, 'loop 1 ends with its hops drawn');
  assert.ok(frameAt(approvalsLayout, 5).hops.every((h) => h.current), 'loop 2 starts clean');
  assert.ok(frameAt(approvalsLayout, 8).hops.every((h) => h.current), 'loop 3 starts clean');
  assert.deepEqual([3.9, 4, 7, 11].map((p) => recordAt(approvals, p).length), [0, 1, 2, 3]);
});

test('approvals-flow: the ask stands above the Command Center, and the approved call reaches the Context', () => {
  const [x, y] = approvalsLayout.resolve('commandCenter');
  const tile = frameAt(approvalsLayout, 2).ask;
  assert.ok(Math.abs(tile.x - x) < 40 && tile.y < y, 'the tile is above the Command Center');
  assert.ok(approvals.scenes[3].lit.some((l) => l.part === 'connector'));
  const [cx, cy] = approvalsLayout.resolve('connector');
  near(frameAt(approvalsLayout, 4).hops.find((h) => h.current).points.at(-1), [cx, cy], 200);
});

test('approvals-flow: the legend has the cube and the hop, and the text names no polling and no skip count', () => {
  assert.deepEqual(approvals.legend.map((i) => i.swatch), ['cube', 'hop']);
  assert.doesNotMatch(JSON.stringify(approvals), /poll|skipped|\b\d+ (fires|runs)\b/i);
});

test('extending-flow: Member, Orchestrator agent and Context Hub in the space, and the three extensions outside on dashed links', () => {
  const on = (id) => extending.parts.filter((p) => p.on === id).map((p) => p.label).sort();
  assert.deepEqual(extending.slabs.map((s) => s.label).sort(), ['Organization', 'Workspace']);
  assert.deepEqual(on('space'), ['Context Hub', 'Member', 'Orchestrator agent']);
  assert.deepEqual(on('organization'), ['A2A agent', 'MCP server', 'Vector App']);
  assert.ok(extending.links.length === 3 && extending.links.every((l) => l.remote));
  assert.deepEqual(extending.links.map((l) => [l.from, l.to]).sort(), [['contextHub', 'mcp'], ['orchestrator', 'a2a'], ['orchestrator', 'app']]);
});

test('extending-flow: four steps with one scene each, the shared start and then one call per extension, with no pause', () => {
  assert.equal(extending.steps.length, 4);
  assert.deepEqual(extending.scenes.map((s) => s.step), [1, 2, 3, 4]);
  assert.ok(extending.scenes.every((s) => !s.pause));
  assert.equal(advance(extending, 0, 600_000), 4);
  assert.deepEqual(extending.steps.map((s) => s.href), ['#what-the-space-does-for-every-call', '#adding-an-extension', '#adding-an-extension', '#adding-an-extension']);
  assert.match(extending.steps[1].text, /token/);
  assert.match(extending.steps[2].text, /stored credential/);
  assert.match(extending.steps[3].text, /never learns who asked/);
});

test('extending-flow: each call rides its dashed link to its part, and the last pose keeps every hop', () => {
  const hops = (p) => frameAt(extendingLayout, p).hops;
  assert.deepEqual([1, 2, 3, 4].map((p) => hops(p).length), [1, 2, 3, 4]);
  for (const [p, part] of [[2, 'app'], [3, 'a2a'], [4, 'mcp']]) near(hops(p).find((h) => h.current).points.at(-1), extendingLayout.resolve(part), 12);
});

test('extending-flow: the legend has 4 items that explain encodings', () => {
  assert.deepEqual(extending.legend.map((i) => i.swatch), ['plug', 'remote', 'cube', 'hop']);
});

const { agentStudioAccess: studioAccess } = await import('../src/diagrams/figures/agent-studio-access.ts');
const { agentStudioLifecycle: studioLifecycle } = await import('../src/diagrams/figures/agent-studio-lifecycle.ts');

for (const [name, data] of [['agent-studio-access', studioAccess], ['agent-studio-lifecycle', studioLifecycle]]) {
  const laid = layoutFlow(data);

  sharedFlowTests(name, data, laid);

  test(`${name}: 7 parts on one slab and a legend of 4`, () => {
    assert.equal(data.parts.length, 7);
    assert.equal(data.slabs.length, 1);
    assert.equal(data.legend.length, 4);
  });

  test(`${name}: names only on parts and slabs, no dashes, no first person plural, no code name, no vendor, short cells, only the actors Member and Platform`, () => {
    for (const item of [...data.parts, ...data.slabs]) assert.match(item.label, /^[A-Za-z][A-Za-z0-9 ]*$/, item.label);
    const text = JSON.stringify(data);
    assert.doesNotMatch(text, /[–—]/);
    assert.doesNotMatch(text, /\b(we|our|ours|us)\b/i);
    assert.doesNotMatch(text, /GenSQL|Level [123]|spaceId|agentVersionId|Apollo|Exa\b|BrightData|Slack|RedemptAI|\bgrant\b/);
    for (const step of data.steps) assert.ok(words(step.record.text) <= 15 && words(step.text) <= 40, step.text);
    assert.ok(data.steps.every((s) => ['Member', 'Platform'].includes(s.record.actor)));
    for (const scene of data.scenes) if (scene.caption) assert.ok(words(scene.caption) <= 40, scene.caption);
  });
}

test('agent-studio-access: the access check stands between the agent and what it reaches, and only the ask scene pauses', () => {
  const ends = studioAccess.links.map((l) => [l.from, l.to]);
  assert.deepEqual(ends, [['analyst', 'accessCheck'], ['accessCheck', 'datasource'], ['accessCheck', 'connector']]);
  assert.deepEqual(studioAccess.scenes.filter((s) => s.pause).map((s) => s.step), [5]);
  assert.equal(studioAccess.scenes.length, 6);
});

test('agent-studio-access: the ask waits in the pause pose, the approval clears it and the last pose has no ask', () => {
  const laid = layoutFlow(studioAccess);
  assert.equal(frameAt(laid, 5).ask?.state, 'waiting');
  assert.equal(frameAt(laid, 5.2).ask?.state, 'approved');
  assert.equal(frameAt(laid, 6).ask, null);
});

test('agent-studio-lifecycle: draft, versions and published agents are joined in a row, and Evaluation has no link', () => {
  assert.deepEqual(studioLifecycle.links.map((l) => [l.from, l.to]), [['draft', 'versions'], ['versions', 'published'], ['published', 'run']]);
  assert.ok(!studioLifecycle.links.some((l) => l.from === 'evaluation' || l.to === 'evaluation'));
});

test('agent-studio-lifecycle: six steps play six scenes, none pauses, and the restore starts a clean picture', () => {
  assert.equal(studioLifecycle.steps.length, 6);
  assert.equal(studioLifecycle.scenes.length, 6);
  assert.ok(!studioLifecycle.scenes.some((s) => s.pause));
  assert.equal(studioLifecycle.scenes[4].fresh, true);
});
