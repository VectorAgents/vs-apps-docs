import type { FlowData, SceneData, Waypoint } from '../figure/flow-types.ts';
import { slotOf } from './slots.ts';

/**
 * Points of the hops, in grid cells and height units. The two dashed links of the Vector App leave the facing sides of the
 * Orchestrator agent and of Connectors and meet the facing sides of the app, so a hop that rides a link follows the drawn line.
 * The lanes run through the gaps between parts, clear of every label.
 */
const orchestratorLink: Waypoint = [12.4, 6.3, 13.25];
const appLinkOfOrchestrator: Waypoint = [20.2, 6.5, 9.25];
const connectorsLink: Waypoint = [16.0, 8.9, 13.25];
const appLinkOfConnectors: Waypoint = [20.2, 8.3, 9.25];
const laneBetweenMemberAndContacts = 9.0;
const laneBetweenRows = 7.6;
/** Where the email leaves the space: past the left edge of the space slab, at the height of the part tops. */
const outOfTheSpace: Waypoint = [0.6, 4.56, 14.6];
/** The centre of the ask tile, above the Command Center. */
const askTile: Waypoint = [7.2, 5.4, 22.5];

/** Member to the Orchestrator agent, then over the dashed link to the app. */
const requestPath: Waypoint[] = [
  'member',
  [laneBetweenMemberAndContacts, 8.96, 15.0],
  [laneBetweenMemberAndContacts, 4.56, 15.0],
  'orchestrator',
  [12.4, 4.56, 15.0],
  orchestratorLink,
  appLinkOfOrchestrator,
  'app',
];
/** The app to each of the three marks on Connectors, over the dashed link. */
const queryPath = (mark: number): Waypoint[] => ['app', appLinkOfConnectors, connectorsLink, `connectors#${mark}`];
/** The app to Contacts, through the lane between the two rows of parts. */
const savePath: Waypoint[] = ['app', [20.2, laneBetweenRows, 9.25], [11.0, laneBetweenRows, 14.0], 'contacts'];

/** Contacts to the orchestrator agent, along the lane between the Member and Contacts. */
const draftPath: Waypoint[] = ['contacts', [laneBetweenMemberAndContacts, 8.96, 15.0], [laneBetweenMemberAndContacts, 4.56, 15.0], 'orchestrator'];
/** The model call: out to the AI gateway and back. */
const gatewayPath: Waypoint[] = ['orchestrator', 'gateway', 'orchestrator'];

/** One service of Connectors: its search starts at `search`, its results gather and its cube leaves at `leave`, and it is back at the app at `back`. */
const services = [
  { search: 0.2, leave: 0.52, back: 0.9 },
  { search: 0.27, leave: 0.59, back: 0.925 },
  { search: 0.34, leave: 0.66, back: 0.95 },
] as const;

const scenes: SceneData[] = [
  {
    step: 1,
    durationMs: 5600,
    lit: [{ part: 'member', from: 0 }, { part: 'orchestrator', from: 0.76 }, { part: 'app', from: 0.9 }],
    effects: [
      { kind: 'chat', at: [5.8, 9.8, 15.5], placeholder: 'Ask the orchestrator agent', text: 'Find leads at UK fintech startups', type: [0.05, 0.4], sendAt: 0.5 },
      { kind: 'hop', path: requestPath, draw: [0.55, 1] },
      { kind: 'item', path: requestPath, move: [0.55, 1] },
      { kind: 'ring', at: 'orchestrator', window: [0.72, 0.9], hold: true },
    ],
  },
  {
    step: 2,
    durationMs: 4800,
    lit: [{ part: 'app', from: 0 }, { part: 'connectors', from: 0 }],
    effects: services.flatMap(({ search, leave, back }, i): SceneData['effects'] => [
      { kind: 'hop', path: queryPath(i), draw: [0, 0.22] },
      { kind: 'ring', at: `connectors#${i}`, window: [search, leave], pulses: 2 },
      { kind: 'dots', at: `connectors#${i}`, pop: [search + 0.04, search + 0.29], gather: [leave - 0.1, leave] },
      { kind: 'item', path: [...queryPath(i)].reverse(), move: [leave, back], rise: i * 0.95, qualifiedAt: back + 0.03 },
    ]),
  },
  {
    step: 3,
    durationMs: 2200,
    lit: [{ part: 'app', from: 0 }, { part: 'contacts', from: 0 }],
    effects: [
      { kind: 'hop', path: savePath, draw: [0, 1] },
      ...[0, 1, 2].map((i): SceneData['effects'][number] => ({ kind: 'item', path: savePath, move: [0, 1], rise: i * 0.95, qualifiedAt: 0 })),
    ],
  },
  {
    step: 4,
    durationMs: 7000,
    lit: [{ part: 'contacts', from: 0 }, { part: 'orchestrator', from: 0.2 }, { part: 'gateway', from: 0.3 }],
    effects: [
      { kind: 'hop', path: draftPath, draw: [0, 0.22] },
      { kind: 'item', path: draftPath, move: [0, 0.22], show: [0, 0.26], qualifiedAt: 0 },
      { kind: 'draft', at: [12.1, 4.0, 15], to: 'Ava Clarke, Northwind Capital', subject: 'About your lending desk', body: "Hi Ava, Northwind's new UK lending desk caught my eye. Could you spare 15 minutes this week?", type: [0.3, 0.85] },
      { kind: 'hop', path: gatewayPath.slice(0, 2), draw: [0.3, 0.45] },
      { kind: 'item', path: gatewayPath, move: [0.3, 0.62], show: [0.3, 0.64] },
      { kind: 'ring', at: 'gateway', window: [0.42, 0.6] },
      { kind: 'item', shape: 'envelope', path: ['orchestrator', 'orchestrator'], move: [0.9, 1] },
    ],
  },
  {
    step: 5,
    durationMs: 2600,
    caption: 'Sending is a write, so it raises an ask in the Command Center. The run waits for the member who asked.',
    pause: true,
    lit: [{ part: 'commandCenter', from: 0.6 }],
    effects: [
      { kind: 'hop', path: ['orchestrator', 'commandCenter'], draw: [0, 0.6] },
      { kind: 'item', shape: 'envelope', path: ['orchestrator', 'commandCenter'], move: [0, 0.6], show: [0, 1] },
      { kind: 'ask', at: askTile, show: [0.65, 1] },
    ],
  },
  {
    step: 5,
    durationMs: 2400,
    caption: 'The member approves the ask, and the run resumes as that member.',
    lit: [{ part: 'member', from: 0 }, { part: 'commandCenter', from: 0 }],
    effects: [
      { kind: 'ask', at: askTile, show: [0, 0.35], approved: true },
      { kind: 'hop', path: ['commandCenter', 'omnibox'], draw: [0.3, 1] },
      { kind: 'item', shape: 'envelope', path: ['commandCenter', 'omnibox'], move: [0.3, 1], show: [0, 1] },
    ],
  },
  {
    step: 6,
    durationMs: 3000,
    lit: [{ part: 'omnibox', from: 0 }],
    effects: [
      { kind: 'hop', path: ['omnibox', outOfTheSpace], draw: [0.1, 0.8] },
      { kind: 'item', shape: 'envelope', path: ['omnibox', outOfTheSpace], move: [0.1, 0.8], show: [0, 0.9], fade: 0.1 },
    ],
  },
];

/** Slot `worked-example-flow` of `how-work-moves-through-a-space`: one piece of work, from a search for leads to an approved outreach email. */
export const workedExampleFlow: FlowData = {
  id: 'worked-example-flow',
  title: 'How one request moves through a space',
  desc: 'Three slabs, from the bottom: Governance, Organization and space. The space slab holds six parts: Member, Orchestrator agent, Command Center, Contacts, Omnibox and Connectors, which shows the marks of Apollo, Exa and BrightData. The Organization slab holds the example Vector App, joined to the space by two dashed links. The AI gateway stands on the Governance slab, outside the Organization. A request moves through these parts in six steps.',
  caption: slotOf('worked-example-flow').caption,
  intro: 'A member of a space asks for leads. Follow that one request until an email goes out. The app is an example.',
  slabs: [
    { id: 'governance', label: 'Governance', text: 'Reads across the whole organization: who ran what, and what it cost.', level: 0, c: -1, r: -4.2, w: 26, d: 19.6 },
    { id: 'organization', label: 'Organization', text: 'The customer account. Every user, key, resource and space belongs to one organization.', level: 1, c: 0, r: 0, w: 24, d: 14.4 },
    { id: 'space', label: 'space', text: 'The place where a team works. Access is worked out for each member and each action.', level: 2, c: 1.2, r: 3.2, w: 15.4, d: 9.8 },
  ],
  parts: [
    { id: 'omnibox', label: 'Omnibox', text: 'The Vector Module that sends a message out of the space, such as an email.', icon: 'omnibox', tone: 'core', on: 'space', c: 2.0, r: 4.0, w: 3.2, d: 2.8 },
    { id: 'commandCenter', label: 'Command Center', text: 'Where an ask waits for a person to decide.', icon: 'commandCenter', tone: 'core', on: 'space', c: 5.6, r: 4.0, w: 3.2, d: 2.8 },
    { id: 'orchestrator', label: 'Orchestrator agent', text: 'The agent that takes a request and calls the tools of the space.', icon: 'orchestrator', tone: 'core', on: 'space', c: 9.2, r: 4.0, w: 3.2, d: 2.8 },
    { id: 'member', label: 'Member', text: 'A person in the space. Every step here runs with the access of this member.', icon: 'member', tone: 'core', on: 'space', c: 5.6, r: 8.4, w: 3.2, d: 2.8 },
    { id: 'contacts', label: 'Contacts', text: 'The Vector Module that keeps people and companies as records.', icon: 'contacts', tone: 'core', on: 'space', c: 9.2, r: 8.4, w: 3.2, d: 2.8 },
    {
      id: 'connectors',
      label: 'Connectors',
      text: 'The services that the space is joined to. The example app uses three of them to find leads.',
      icon: 'connector',
      tone: 'core',
      on: 'space',
      c: 12.8,
      r: 8.4,
      w: 3.2,
      d: 2.8,
      marks: [
        { name: 'Apollo', src: '/img/marks/apollo.png' },
        { name: 'Exa', src: '/img/marks/exa.png' },
        { name: 'BrightData', src: '/img/marks/brightdata.png' },
      ],
    },
    { id: 'gateway', label: 'AI gateway', text: 'Every model call of the platform passes through it. It stands outside the organization.', icon: 'gateway', tone: 'core', on: 'governance', c: 9.2, r: -3.2, w: 3.2, d: 2.4 },
    { id: 'app', label: 'Vector App', text: 'The example app. It runs on its own origin and is called by the space.', icon: 'app', tone: 'plug', on: 'organization', c: 20.2, r: 6.0, w: 3.2, d: 2.8 },
  ],
  links: [
    { id: 'orchestrator-app', from: 'orchestrator', to: 'app', remote: true },
    { id: 'connectors-app', from: 'connectors', to: 'app', remote: true },
  ],
  legend: [
    { swatch: 'cube', text: 'A moving cube is work in progress' },
    { swatch: 'stack', text: 'A stack is many' },
    { swatch: 'hop', text: 'An accent line is the current hop' },
    { swatch: 'remote', text: 'A dashed line is a remote link' },
  ],
  steps: [
    {
      text: 'A member asks the orchestrator agent to find leads. The agent calls an action of the example Vector App, and Vector Space checks access as the member.',
      record: { text: 'Member asks the agent.', actor: 'Member' },
      href: '#the-request',
    },
    {
      text: 'The app uses the space\'s Connectors for Apollo, Exa and BrightData, then qualifies the leads. It records "lead qualified" for each one.',
      record: { text: 'The platform records each connector call. The app records "lead qualified" for each lead.', actor: 'App' },
      href: '#leads-found-qualified-and-saved',
    },
    {
      text: 'The app saves each qualified lead as a contact.',
      record: { text: 'The app saves the leads as contacts.', actor: 'App' },
      href: '#leads-found-qualified-and-saved',
    },
    {
      text: 'The agent drafts one outreach email for a qualified lead. The model call goes through the AI gateway.',
      record: { text: 'The agent drafts the email through the AI gateway.', actor: 'Member' },
      href: '#the-draft',
    },
    {
      text: 'Sending is a write, so it raises an ask in the Command Center. The member who asked approves it, and the run resumes as that member.',
      record: { text: 'The member approves the ask.', actor: 'Member' },
      href: '#the-pause-for-approval',
    },
    {
      text: 'The email goes out through the Omnibox. The app records no act for this step.',
      record: { text: 'The email goes out through the Omnibox.', actor: 'Member' },
      href: '#the-send',
    },
  ],
  scenes,
};
