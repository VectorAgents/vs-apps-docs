import type { FlowData, SceneData, Waypoint } from '../figure/flow-types.ts';
import { slotOf } from './slots.ts';

/** Where the post leaves the space: past the right edge of the space slab, level with the Connector and at the height of the part tops. */
const outOfTheSpace: Waypoint = [13.2, 2.4, 6.6];
/** The centre of the ask tile, above the Command Center. */
const askTile: Waypoint = [2.6, 2.6, 14.5];

const request: Waypoint[] = ['member', 'orchestrator'];
const toTheAsk: Waypoint[] = ['orchestrator', 'commandCenter'];
/** The decision goes back to the run, and the run makes the post. */
const throughThePost: Waypoint[] = ['commandCenter', 'orchestrator', 'connector', outOfTheSpace];
const withNoAsk: Waypoint[] = ['orchestrator', 'connector', outOfTheSpace];

/** Loop 1, the ask: 4 frames. Loop 2, the standing approval: 3 frames. Loop 3, the schedule: 4 frames. */
const scenes: SceneData[] = [
  {
    step: 1,
    durationMs: 4200,
    caption: 'A member asks the orchestrator agent to post a status note to the team chat. The run reaches the post, an operation that writes.',
    lit: [{ part: 'member', from: 0 }, { part: 'orchestrator', from: 0.7 }],
    effects: [
      { kind: 'chat', at: [1.2, 7.0, 7.5], placeholder: 'Ask the orchestrator agent', text: 'Post a status note to the team chat', type: [0.05, 0.4], sendAt: 0.5 },
      { kind: 'hop', path: request, draw: [0.55, 1] },
      { kind: 'item', path: request, move: [0.55, 1] },
      { kind: 'ring', at: 'orchestrator', window: [0.72, 0.92], hold: true },
    ],
  },
  {
    step: 1,
    durationMs: 3200,
    caption: 'The post changes something outside the space, so the run stops and an ask appears in the Command Center. The run waits.',
    pause: true,
    lit: [{ part: 'orchestrator', from: 0 }, { part: 'commandCenter', from: 0.6 }],
    effects: [
      { kind: 'hop', path: toTheAsk, draw: [0, 0.6] },
      { kind: 'item', path: toTheAsk, move: [0, 0.6], show: [0, 1] },
      { kind: 'ask', at: askTile, show: [0.65, 1] },
    ],
  },
  {
    step: 1,
    durationMs: 2200,
    caption: 'The member reads the ask and approves it.',
    lit: [{ part: 'member', from: 0 }, { part: 'commandCenter', from: 0 }],
    effects: [
      { kind: 'ask', at: askTile, show: [0, 1], approved: true },
      { kind: 'item', path: ['commandCenter', 'commandCenter'], move: [0, 1], show: [0, 1] },
      { kind: 'ring', at: 'commandCenter', window: [0.2, 0.6] },
    ],
  },
  {
    step: 1,
    durationMs: 3600,
    caption: 'The run continues as the member, the same identity as before. The post goes out through the connector to the team chat.',
    lit: [{ part: 'commandCenter', from: 0 }, { part: 'orchestrator', from: 0.3 }, { part: 'connector', from: 0.6 }],
    effects: [
      { kind: 'hop', path: throughThePost, draw: [0, 0.95] },
      { kind: 'item', path: throughThePost, move: [0, 0.95], show: [0, 0.97], fade: 0.1 },
    ],
  },
  {
    step: 2,
    durationMs: 3200,
    fresh: true,
    caption: 'The member approves an ask and ticks "always allow". The Command Center keeps a standing approval for this post.',
    lit: [{ part: 'member', from: 0 }, { part: 'commandCenter', from: 0.3 }],
    effects: [
      { kind: 'ask', at: askTile, show: [0, 1], approved: true },
      { kind: 'hop', path: ['member', 'commandCenter'], draw: [0.1, 0.6] },
      { kind: 'item', path: ['member', 'commandCenter'], move: [0.1, 0.6], show: [0.1, 1] },
      { kind: 'ring', at: 'commandCenter', window: [0.6, 0.9], hold: true },
    ],
  },
  {
    step: 2,
    durationMs: 2800,
    caption: 'Later, the member asks again and the run reaches the same post. The standing approval applies from this run.',
    lit: [{ part: 'member', from: 0 }, { part: 'orchestrator', from: 0.6 }, { part: 'commandCenter', from: 0.6 }],
    effects: [
      { kind: 'hop', path: request, draw: [0.1, 0.7] },
      { kind: 'item', path: request, move: [0.1, 0.7] },
    ],
  },
  {
    step: 2,
    durationMs: 3000,
    caption: 'The post goes through with no ask. Activity names the standing approval on the call.',
    lit: [{ part: 'orchestrator', from: 0 }, { part: 'connector', from: 0.6 }],
    effects: [
      { kind: 'hop', path: withNoAsk, draw: [0, 0.9] },
      { kind: 'item', path: withNoAsk, move: [0, 0.9], show: [0, 0.95], fade: 0.1 },
    ],
  },
  {
    step: 3,
    durationMs: 3000,
    fresh: true,
    caption: 'A member sets a schedule in the Command Center: a timer and the identity it runs as. Here it runs as the member who set it.',
    lit: [{ part: 'member', from: 0 }, { part: 'commandCenter', from: 0.5 }],
    effects: [
      { kind: 'hop', path: ['member', 'commandCenter'], draw: [0.1, 0.7] },
      { kind: 'item', path: ['member', 'commandCenter'], move: [0.1, 0.7], show: [0.1, 1] },
      { kind: 'ring', at: 'commandCenter', window: [0.7, 0.95], hold: true },
    ],
  },
  {
    step: 3,
    durationMs: 3000,
    caption: 'The timer fires and a run starts. It works as the member.',
    lit: [{ part: 'commandCenter', from: 0 }, { part: 'orchestrator', from: 0.6 }],
    effects: [
      { kind: 'ring', at: 'commandCenter', window: [0, 0.5], pulses: 2 },
      { kind: 'hop', path: ['commandCenter', 'orchestrator'], draw: [0.4, 1] },
      { kind: 'item', path: ['commandCenter', 'orchestrator'], move: [0.4, 1], show: [0.4, 1] },
    ],
  },
  {
    step: 3,
    durationMs: 3200,
    caption: 'The run reaches a write with no standing approval for this post. It stops and raises an ask.',
    pause: true,
    lit: [{ part: 'orchestrator', from: 0 }, { part: 'commandCenter', from: 0.6 }],
    effects: [
      { kind: 'hop', path: toTheAsk, draw: [0, 0.6] },
      { kind: 'item', path: toTheAsk, move: [0, 0.6], show: [0, 1] },
      { kind: 'ask', at: askTile, show: [0.65, 1] },
    ],
  },
  {
    step: 3,
    durationMs: 3800,
    caption: 'The member who set the schedule approves the ask and ticks "always allow". Every later run goes through with no ask.',
    lit: [{ part: 'member', from: 0 }, { part: 'commandCenter', from: 0 }, { part: 'connector', from: 0.6 }],
    effects: [
      { kind: 'ask', at: askTile, show: [0, 0.3], approved: true },
      { kind: 'hop', path: throughThePost, draw: [0.3, 0.95] },
      { kind: 'item', path: throughThePost, move: [0.3, 0.95], show: [0.3, 0.97], fade: 0.1 },
    ],
  },
];

/** Slot `approvals-flow` of `approvals-and-the-command-center`: three ways a write is cleared, an ask, a standing approval and a schedule. */
export const approvalsFlow: FlowData = {
  id: 'approvals-flow',
  title: 'Three ways a write is cleared',
  desc: 'One slab, space, with four parts: Member, Orchestrator agent, Command Center and a Connector to a team chat. Three loops play on it. In the first, a run stops at an ask that the member approves. In the second, a standing approval lets a later run go through with no ask. In the third, a schedule runs a post that stops at an ask until the member approves it and ticks always allow.',
  caption: slotOf('approvals-flow').caption,
  intro: 'A write needs a person to say yes, unless something has already said it for them. Follow three ways it is cleared. The post to a team chat is an example.',
  slabs: [{ id: 'space', label: 'space', text: 'The place where a team works. Access is worked out for each member and each action.', level: 0, c: 0, r: 0, w: 12.4, d: 10.2 }],
  parts: [
    { id: 'commandCenter', label: 'Command Center', text: 'Where an ask waits for a person to decide. It also lists standing approvals and schedules.', icon: 'commandCenter', tone: 'core', on: 'space', c: 1.0, r: 1.2, w: 3.2, d: 2.8 },
    { id: 'member', label: 'Member', text: 'A person in the space. Every run here works as a member.', icon: 'member', tone: 'core', on: 'space', c: 1.0, r: 5.6, w: 3.2, d: 2.8 },
    { id: 'orchestrator', label: 'Orchestrator agent', text: 'The agent that takes a request and calls the tools of the space.', icon: 'orchestrator', tone: 'core', on: 'space', c: 4.8, r: 5.6, w: 3.2, d: 2.8 },
    { id: 'connector', label: 'Connector', text: 'The link from the space to one outside service, here a team chat. A post through it changes something outside the space.', icon: 'connector', tone: 'core', on: 'space', c: 8.6, r: 1.2, w: 3.2, d: 2.8 },
  ],
  links: [],
  legend: [
    { swatch: 'cube', text: 'A moving cube is work in progress' },
    { swatch: 'hop', text: 'An accent line is the current hop' },
  ],
  steps: [
    {
      text: 'A member asks the agent to post a note. The post writes outside the space, so the run stops at an ask in the Command Center. The member approves it and the run goes on as the member.',
      record: { text: 'The ask, the decision and the post are recorded.', actor: 'Member' },
      href: '#the-ask-and-who-decides-it',
    },
    {
      text: 'The member ticks "always allow" on an ask. The Command Center keeps a standing approval, and a later run posts with no ask.',
      record: { text: 'The standing approval is recorded. Activity names it on the later call.', actor: 'Member' },
      href: '#standing-approvals',
    },
    {
      text: 'A schedule runs on a timer as the member. Its run stops at an ask. After the member approves and ticks "always allow", every later run goes through.',
      record: { text: 'The schedule and each run are recorded.', actor: 'Member' },
      href: '#schedules',
    },
  ],
  scenes,
};
