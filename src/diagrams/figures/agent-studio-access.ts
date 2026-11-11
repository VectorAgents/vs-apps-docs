import type { FlowData, SceneData } from '../figure/flow-types.ts';
import { STACK_STEP } from '../figure/flow.ts';
import { slotOf } from './slots.ts';

/** Centre of the ask tile, above the Command Center. The slab is level 0, so a part top is at 6.5. */
const askTile = [2.6, 2.4, 14.5] as const;

const scenes: SceneData[] = [
  {
    step: 1,
    durationMs: 4800,
    lit: [{ part: 'member', from: 0 }, { part: 'analyst', from: 0.7 }],
    effects: [
      { kind: 'chat', at: [5.8, 9.6, 7.5], placeholder: 'Ask the analyst agent', text: 'Revenue by region, last quarter', type: [0.05, 0.4], sendAt: 0.5 },
      { kind: 'hop', path: ['member', 'analyst'], draw: [0.55, 1] },
      { kind: 'item', path: ['member', 'analyst'], move: [0.55, 1] },
      { kind: 'ring', at: 'analyst', window: [0.75, 0.95], hold: true },
    ],
  },
  {
    step: 2,
    durationMs: 4200,
    lit: [{ part: 'analyst', from: 0 }, { part: 'accessCheck', from: 0.2 }],
    effects: [
      { kind: 'hop', path: ['analyst', 'accessCheck'], draw: [0, 0.3] },
      { kind: 'item', path: ['analyst', 'accessCheck'], move: [0, 0.3], show: [0, 0.35] },
      { kind: 'ring', at: 'accessCheck', window: [0.3, 0.55], pulses: 2 },
      ...[0, 1, 2].map((i): SceneData['effects'][number] => ({ kind: 'item', path: ['accessCheck', 'analyst'], move: [0.55, 0.9], rise: i * STACK_STEP })),
    ],
  },
  {
    step: 3,
    durationMs: 3200,
    lit: [{ part: 'analyst', from: 0 }, { part: 'skill', from: 0.2 }],
    effects: [
      { kind: 'item', path: ['analyst', 'analyst'], move: [0, 1], rise: 0 },
      { kind: 'item', path: ['analyst', 'analyst'], move: [0, 1], rise: STACK_STEP },
      { kind: 'item', path: ['analyst', 'analyst'], move: [0, 1], rise: 2 * STACK_STEP, show: [0, 0.5], fade: 0.2 },
      { kind: 'ring', at: 'analyst', window: [0.4, 0.7] },
    ],
  },
  {
    step: 4,
    durationMs: 5600,
    lit: [{ part: 'analyst', from: 0 }, { part: 'accessCheck', from: 0.1 }, { part: 'datasource', from: 0.4 }],
    effects: [
      { kind: 'hop', path: ['analyst', 'accessCheck', 'datasource'], draw: [0, 0.4] },
      { kind: 'item', path: ['analyst', 'accessCheck', 'datasource'], move: [0, 0.4], show: [0, 0.45] },
      { kind: 'ring', at: 'datasource', window: [0.4, 0.65], pulses: 2 },
      { kind: 'dots', at: 'datasource', pop: [0.45, 0.7], gather: [0.7, 0.82] },
      ...[0, 1].map((i): SceneData['effects'][number] => ({ kind: 'item', path: ['datasource', 'accessCheck', 'analyst'], move: [0.82, 1], rise: i * STACK_STEP })),
    ],
  },
  {
    step: 5,
    durationMs: 2800,
    caption: 'Sharing the result is a write, so it raises an ask in the Command Center. The run waits for the member who asked.',
    pause: true,
    lit: [{ part: 'commandCenter', from: 0.6 }],
    effects: [
      { kind: 'hop', path: ['analyst', 'commandCenter'], draw: [0, 0.6] },
      { kind: 'item', shape: 'envelope', path: ['analyst', 'commandCenter'], move: [0, 0.6], show: [0, 1] },
      { kind: 'ask', at: askTile, show: [0.65, 1] },
    ],
  },
  {
    step: 5,
    durationMs: 2400,
    caption: 'The member approves the ask. An approval is a second gate and gives the run no extra access.',
    lit: [{ part: 'member', from: 0 }, { part: 'commandCenter', from: 0 }],
    effects: [
      { kind: 'ask', at: askTile, show: [0, 0.35], approved: true },
      { kind: 'hop', path: ['commandCenter', 'analyst'], draw: [0.3, 1] },
      { kind: 'item', shape: 'envelope', path: ['commandCenter', 'analyst'], move: [0.3, 1], show: [0, 1] },
    ],
  },
];

/** Slot `agent-studio-access` of `agent-studio`: one request, from a question to an approved write, with the access check at each step. */
export const agentStudioAccess: FlowData = {
  id: 'agent-studio-access',
  title: 'What a run may use',
  desc: 'One Workspace slab holds seven parts. At the back are the Command Center, the Analyst agent, the Access check and a Datasource. At the front are a Skill, the Member and a Connector. A request moves through them in five steps, and the Access check stands between the agent and what it reaches.',
  caption: slotOf('agent-studio-access').caption,
  intro: 'A member asks an agent a question about revenue. Follow the request and see what the agent may use at each step.',
  slabs: [{ id: 'space', label: 'Workspace', text: 'The place where a team works. Access is worked out for each member and each action.', level: 0, c: 0, r: 0, w: 16.2, d: 9.8 }],
  parts: [
    { id: 'commandCenter', label: 'Command Center', text: 'Where an ask waits for a person to decide.', icon: 'commandCenter', tone: 'core', on: 'space', c: 1.0, r: 1.0, w: 3.2, d: 2.8 },
    { id: 'analyst', label: 'Analyst agent', text: 'The agent that answers the question. It starts with no tools. A member gives it the ones it needs.', icon: 'orchestrator', tone: 'core', on: 'space', c: 4.6, r: 1.0, w: 3.2, d: 2.8 },
    { id: 'accessCheck', label: 'Access check', text: 'Runs before every call. A run reaches only what the member may use, and a scope on the agent can only cut that down.', icon: 'accessCheck', tone: 'core', on: 'space', c: 8.2, r: 1.0, w: 3.2, d: 2.8 },
    { id: 'datasource', label: 'Datasource', text: 'A database that the space is joined to. A condition filters its rows, so the agent never sees rows the member may not see.', icon: 'contextHub', tone: 'core', on: 'space', c: 11.8, r: 1.0, w: 3.2, d: 2.8 },
    { id: 'skill', label: 'Skill', text: 'Instructions for a kind of work. A skill can also name the tools that the work needs.', icon: 'modules', tone: 'core', on: 'space', c: 1.0, r: 5.4, w: 3.2, d: 2.8 },
    { id: 'member', label: 'Member', text: 'A person in the space. Every step here runs with the access of this member.', icon: 'member', tone: 'core', on: 'space', c: 4.6, r: 5.4, w: 3.2, d: 2.8 },
    { id: 'connector', label: 'Connector', text: 'An outside service that the space is joined to. The check guards the call, not the answer.', icon: 'connector', tone: 'core', on: 'space', c: 8.2, r: 5.4, w: 3.2, d: 2.8 },
  ],
  links: [
    { id: 'analyst-check', from: 'analyst', to: 'accessCheck' },
    { id: 'check-datasource', from: 'accessCheck', to: 'datasource' },
    { id: 'check-connector', from: 'accessCheck', to: 'connector' },
  ],
  legend: [
    { swatch: 'cube', text: 'A moving cube is a request or a result' },
    { swatch: 'stack', text: 'A stack is many tools' },
    { swatch: 'hop', text: 'An accent line is the current hop' },
    { swatch: 'link', text: 'A plain line joins an agent to what it may reach' },
  ],
  steps: [
    { text: 'A member asks the analyst agent a question. The run takes the access of that member, and no more.', record: { text: 'Member asks the agent.', actor: 'Member' } },
    { text: 'The access check lists what the member may use in the space. Only those tools and skills are offered.', record: { text: 'The platform checks what the member may use.', actor: 'Platform' } },
    { text: "The agent's own scope can only shorten the list. A tool outside the scope is not offered, even if the member may use it.", record: { text: "The agent's scope shortens the list.", actor: 'Platform' } },
    { text: 'The agent queries the datasource. A condition filters the rows, so the agent never sees rows the member may not see.', record: { text: 'The agent queries the datasource. The condition filters the rows.', actor: 'Member' } },
    { text: 'The agent proposes a write, such as sharing the result. A write raises an ask in the Command Center, and the run waits.', record: { text: 'The agent raises an ask for a write, and the member approves it.', actor: 'Member' } },
  ],
  scenes,
};
