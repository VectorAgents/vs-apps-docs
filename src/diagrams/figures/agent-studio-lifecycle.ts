import type { FlowData, SceneData, Waypoint } from '../figure/flow-types.ts';
import { STACK_STEP } from '../figure/flow.ts';
import { slotOf } from './slots.ts';

/** Member to Evaluation through the lane between the two rows, just above the part tops (a part top is at 6.5). */
const memberToEvaluation: Waypoint[] = ['member', [2.6, 4.6, 7.0], 'evaluation'];

const scenes: SceneData[] = [
  {
    step: 1,
    durationMs: 4200,
    lit: [{ part: 'member', from: 0 }, { part: 'draft', from: 0.25 }, { part: 'versions', from: 0.6 }],
    effects: [
      { kind: 'hop', path: ['member', 'draft'], draw: [0, 0.35] },
      { kind: 'item', path: ['member', 'draft'], move: [0, 0.35], show: [0, 0.4] },
      { kind: 'ring', at: 'draft', window: [0.35, 0.55] },
      { kind: 'hop', path: ['draft', 'versions'], draw: [0.55, 0.9] },
      { kind: 'item', path: ['draft', 'versions'], move: [0.55, 0.9] },
    ],
  },
  {
    step: 2,
    durationMs: 5600,
    lit: [{ part: 'member', from: 0 }, { part: 'evaluation', from: 0.25 }, { part: 'draft', from: 0.75 }],
    effects: [
      { kind: 'hop', path: memberToEvaluation, draw: [0, 0.25] },
      { kind: 'item', path: memberToEvaluation, move: [0, 0.25], show: [0, 0.3] },
      { kind: 'ring', at: 'evaluation', window: [0.25, 0.65], pulses: 2 },
      { kind: 'dots', at: 'evaluation', pop: [0.3, 0.55], gather: [0.55, 0.7] },
      { kind: 'hop', path: ['evaluation', 'draft'], draw: [0.7, 0.9] },
      { kind: 'item', path: ['evaluation', 'draft'], move: [0.7, 0.9] },
    ],
  },
  {
    step: 3,
    durationMs: 3600,
    lit: [{ part: 'versions', from: 0 }, { part: 'published', from: 0.5 }],
    effects: [
      { kind: 'hop', path: ['versions', 'published'], draw: [0, 0.6] },
      { kind: 'item', path: ['versions', 'published'], move: [0, 0.6] },
      { kind: 'ring', at: 'published', window: [0.6, 0.9], hold: true },
    ],
  },
  {
    step: 4,
    durationMs: 4800,
    lit: [{ part: 'linkedChat', from: 0 }, { part: 'published', from: 0.5 }, { part: 'run', from: 0.8 }],
    effects: [
      { kind: 'chat', at: [18.4, 9.4, 7.5], placeholder: 'Message the space', text: 'Where is my order?', type: [0.05, 0.35], sendAt: 0.45 },
      { kind: 'hop', path: ['linkedChat', 'published', 'run'], draw: [0.5, 0.85] },
      { kind: 'item', path: ['linkedChat', 'published', 'run'], move: [0.5, 0.85], show: [0.5, 1] },
      { kind: 'ring', at: 'run', window: [0.8, 1], hold: true },
    ],
  },
  {
    step: 5,
    durationMs: 4400,
    fresh: true,
    lit: [{ part: 'member', from: 0 }, { part: 'versions', from: 0.1 }, { part: 'draft', from: 0.5 }],
    effects: [
      { kind: 'hop', path: ['versions', 'draft'], draw: [0.1, 0.6] },
      { kind: 'item', path: ['versions', 'draft'], move: [0.1, 0.6], show: [0, 1] },
      { kind: 'item', path: ['versions', 'versions'], move: [0, 1], rise: STACK_STEP, show: [0, 1] },
      { kind: 'ring', at: 'draft', window: [0.6, 0.85] },
    ],
  },
  {
    step: 6,
    durationMs: 3600,
    lit: [{ part: 'draft', from: 0 }, { part: 'published', from: 0.4 }, { part: 'run', from: 0.8 }],
    effects: [
      { kind: 'hop', path: ['draft', 'versions', 'published'], draw: [0, 0.5] },
      { kind: 'item', path: ['draft', 'versions', 'published'], move: [0, 0.5] },
      { kind: 'ring', at: 'published', window: [0.5, 0.75] },
      { kind: 'hop', path: ['published', 'run'], draw: [0.7, 1] },
      { kind: 'item', path: ['published', 'run'], move: [0.7, 1] },
    ],
  },
];

/** Slot `agent-studio-lifecycle` of `agent-studio`: one change, from a draft edit to a published version and back. */
export const agentStudioLifecycle: FlowData = {
  id: 'agent-studio-lifecycle',
  title: 'The life of a change',
  desc: 'One Workspace slab holds seven parts. At the back are the Member, the Draft, the Versions and the Published agents. At the front are an Evaluation, a Run and a Linked chat. A change moves from the draft to the versions and then to the published agents in six steps, and a restore moves an older version back to the draft.',
  caption: slotOf('agent-studio-lifecycle').caption,
  intro: 'A member changes an agent. Follow the change from the draft to a published version, and see how to go back.',
  slabs: [{ id: 'space', label: 'Workspace', text: 'The place where a team works. Its agents are changed and run here.', level: 0, c: 0, r: 0, w: 19, d: 9.8 }],
  parts: [
    { id: 'member', label: 'Member', text: 'A person who may change the agents of the space.', icon: 'member', tone: 'core', on: 'space', c: 1.0, r: 1.0, w: 3.2, d: 2.8 },
    { id: 'draft', label: 'Draft', text: 'The working copy of the agents. Every edit writes here.', icon: 'modules', tone: 'core', on: 'space', c: 4.6, r: 1.0, w: 3.2, d: 2.8 },
    { id: 'versions', label: 'Versions', text: 'Saved snapshots of an agent. An edit saves a new one. A snapshot never changes.', icon: 'contextHub', tone: 'core', on: 'space', c: 8.2, r: 1.0, w: 3.2, d: 2.8 },
    { id: 'published', label: 'Published agents', text: 'The version that chat, channels and remote callers run.', icon: 'orchestrator', tone: 'core', on: 'space', c: 11.8, r: 1.0, w: 3.2, d: 2.8 },
    { id: 'evaluation', label: 'Evaluation', text: 'A test suite. It runs saved questions against the draft or the published version.', icon: 'execution', tone: 'core', on: 'space', c: 4.6, r: 5.4, w: 3.2, d: 2.8 },
    { id: 'run', label: 'Run', text: 'One conversation or task. It keeps the version it started on.', icon: 'activity', tone: 'core', on: 'space', c: 11.8, r: 5.4, w: 3.2, d: 2.8 },
    { id: 'linkedChat', label: 'Linked chat', text: 'A chat on a channel that its owner has linked to the space. It reaches the published agents.', icon: 'omnibox', tone: 'core', on: 'space', c: 15.4, r: 5.4, w: 3.2, d: 2.8 },
  ],
  links: [
    { id: 'draft-versions', from: 'draft', to: 'versions' },
    { id: 'versions-published', from: 'versions', to: 'published' },
    { id: 'published-run', from: 'published', to: 'run' },
  ],
  legend: [
    { swatch: 'cube', text: 'A cube is a change or a request' },
    { swatch: 'stack', text: 'A stack is saved versions' },
    { swatch: 'hop', text: 'An accent line is the current hop' },
    { swatch: 'link', text: 'A plain line joins a draft to what it feeds' },
  ],
  steps: [
    { text: 'A member edits an agent in Agent Studio. The edit changes the draft and saves a new version at once.', record: { text: 'The member edits the draft.', actor: 'Member' }, href: '#the-life-of-a-change' },
    { text: 'The member runs an evaluation on the draft. Each saved question runs as a real run, and a judge scores the answers.', record: { text: 'The member runs an evaluation on the draft.', actor: 'Member' }, href: '#the-life-of-a-change' },
    { text: 'The member publishes. One step moves every agent of the tree from its draft to its published version.', record: { text: 'The member publishes the agents.', actor: 'Member' }, href: '#the-life-of-a-change' },
    { text: 'A message in a linked chat now runs on the published agents. A run that has started keeps its version, even if the draft moves on.', record: { text: 'A linked chat runs on the published agents.', actor: 'Platform' }, href: '#the-life-of-a-change' },
    { text: 'The new draft turns out worse. The member restores an older version. The draft goes back and the published agents stay as they are.', record: { text: 'The member restores an older version.', actor: 'Member' }, href: '#the-life-of-a-change' },
    { text: 'Publishing again puts the restored version live. The next run uses it.', record: { text: 'The member publishes the restored version.', actor: 'Member' }, href: '#the-life-of-a-change' },
  ],
  scenes,
};
