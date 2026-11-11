import type { FlowData, SceneData, Waypoint } from '../figure/flow-types.ts';
import { slotOf } from './slots.ts';

/**
 * The two ends of each dashed link, in grid cells and height units: the facing sides of the space part and of the outside part,
 * at the height of a part's middle. A hop that rides a link follows the drawn line.
 */
const appLink: Waypoint[] = [[11.2, 5.95, 9.25], [14.4, 6.2, 5.25]];
const a2aLink: Waypoint[] = [[11.2, 4.15, 9.25], [14.4, 3.9, 5.25]];
const mcpLink: Waypoint[] = [[11.2, 11.2, 9.25], [14.4, 11.2, 5.25]];

const request: Waypoint[] = ['member', 'orchestrator'];
const toTheApp: Waypoint[] = ['orchestrator', ...appLink, 'app'];
const toTheA2aAgent: Waypoint[] = ['orchestrator', ...a2aLink, 'a2a'];
/** The agent reaches an MCP server through its connector, which lives in the Context Hub. */
const toTheMcpConnector: Waypoint[] = ['orchestrator', 'contextHub', ...mcpLink, 'mcp'];

/** One call: the line grows, a cube rides it and a ring holds where the call lands. */
const call = (path: Waypoint[], part: string, lit: SceneData['lit']): Pick<SceneData, 'lit' | 'effects'> => ({
  lit,
  effects: [
    { kind: 'hop', path, draw: [0.1, 0.8] },
    { kind: 'item', path, move: [0.1, 0.8], show: [0.1, 1] },
    { kind: 'ring', at: part, window: [0.78, 0.95], hold: true },
  ],
});

const scenes: SceneData[] = [
  {
    step: 1,
    durationMs: 4800,
    lit: [{ part: 'member', from: 0 }, { part: 'orchestrator', from: 0.76 }],
    effects: [
      { kind: 'chat', at: [3.4, 5.05, 11.5], placeholder: 'Ask the orchestrator agent', text: 'Which tickets are still open?', type: [0.05, 0.4], sendAt: 0.5 },
      { kind: 'hop', path: request, draw: [0.55, 1] },
      { kind: 'item', path: request, move: [0.55, 1] },
      { kind: 'ring', at: 'orchestrator', window: [0.72, 0.92], hold: true },
    ],
  },
  { step: 2, durationMs: 3600, ...call(toTheApp, 'app', [{ part: 'orchestrator', from: 0 }, { part: 'app', from: 0.8 }]) },
  { step: 3, durationMs: 3600, ...call(toTheA2aAgent, 'a2a', [{ part: 'orchestrator', from: 0 }, { part: 'a2a', from: 0.8 }]) },
  { step: 4, durationMs: 4200, ...call(toTheMcpConnector, 'mcp', [{ part: 'orchestrator', from: 0 }, { part: 'contextHub', from: 0.4 }, { part: 'mcp', from: 0.8 }]) },
];

/** Slot `extending-flow` of `extending-a-space`: a space calls a Vector App, an A2A agent and an MCP server in the same way. */
export const extendingFlow: FlowData = {
  id: 'extending-flow',
  title: 'How a space calls its extensions',
  desc: 'Two slabs: Organization and Workspace. The Workspace slab holds three parts: Member, Orchestrator agent and Context Hub. The Organization slab holds three parts outside the space: a Vector App, an A2A agent and an MCP server. The Orchestrator agent is joined to the Vector App and to the A2A agent by dashed links, and the Context Hub is joined to the MCP server by a dashed link. A request starts in a run and then calls each of the three in turn.',
  caption: slotOf('extending-flow').caption,
  intro: 'A member asks about open tickets. A team can offer its tracker to the space as a Vector App, an A2A agent or an MCP server. Follow one call to each.',
  slabs: [
    { id: 'organization', label: 'Organization', text: 'The customer account. Every user, key, resource and space belongs to one organization.', level: 0, c: 0, r: 0, w: 18.6, d: 14 },
    { id: 'space', label: 'Workspace', text: 'The place where a team works. Access is worked out for each member and each action.', level: 1, c: 1, r: 1, w: 11.8, d: 11 },
  ],
  parts: [
    { id: 'member', label: 'Member', text: 'A person in the space. Every call starts in a run that works as this member.', icon: 'member', tone: 'core', on: 'space', c: 3.2, r: 3.65, w: 3.2, d: 2.8 },
    { id: 'orchestrator', label: 'Orchestrator agent', text: 'The agent that takes a request and calls the tools of the space.', icon: 'orchestrator', tone: 'core', on: 'space', c: 8.0, r: 3.65, w: 3.2, d: 2.8 },
    { id: 'contextHub', label: 'Context Hub', text: 'Everything the space can reach. A connector to an MCP server is added here.', icon: 'contextHub', tone: 'core', on: 'space', c: 6.0, r: 8.6, w: 5.2, d: 3.2, items: ['Connectors', 'Knowledge sources', 'Datasources', 'Skills', 'Apps'] },
    { id: 'a2a', label: 'A2A agent', text: 'A remote agent that speaks the Agent2Agent (A2A) protocol. The orchestrator agent can hand work to it.', icon: 'a2a', tone: 'plug', on: 'organization', c: 14.4, r: 1.6, w: 3.2, d: 2.8 },
    { id: 'app', label: 'Vector App', text: 'A web app that runs on its own origin and opens as a page of the space.', icon: 'app', tone: 'plug', on: 'organization', c: 14.4, r: 5.7, w: 3.2, d: 2.8 },
    { id: 'mcp', label: 'MCP server', text: 'A remote server of tools, reached with the Model Context Protocol (MCP). Agents in the space can call it.', icon: 'mcp', tone: 'plug', on: 'organization', c: 14.4, r: 9.8, w: 3.2, d: 2.8 },
  ],
  links: [
    { id: 'orchestrator-a2a', from: 'orchestrator', to: 'a2a', remote: true },
    { id: 'orchestrator-app', from: 'orchestrator', to: 'app', remote: true },
    { id: 'hub-mcp', from: 'contextHub', to: 'mcp', remote: true },
  ],
  legend: [
    { swatch: 'plug', text: 'Outside the space' },
    { swatch: 'remote', text: 'A dashed line is a remote link' },
    { swatch: 'cube', text: 'A moving cube is a call in progress' },
    { swatch: 'hop', text: 'An accent line is the current hop' },
  ],
  steps: [
    {
      text: 'A member asks the orchestrator agent which tickets are still open. The agent starts a run that works as the member. All three kinds start here.',
      record: { text: 'The member asks, and the run starts as the member.', actor: 'Member' },
      href: '#what-the-space-does-for-every-call',
    },
    {
      text: 'The agent calls the Vector App. The space sends a token that it makes for the member.',
      record: { text: 'The space records the call to the app.', actor: 'Member' },
      href: '#the-three-kinds-and-how-each-gets-in',
    },
    {
      text: 'The agent hands the question to the A2A agent. The space sends the stored credential for it, if the organization saved one.',
      record: { text: 'The call to the A2A agent is recorded as a run.', actor: 'Member' },
      href: '#the-three-kinds-and-how-each-gets-in',
    },
    {
      text: 'The agent calls a tool of the MCP server through its connector in the Context Hub. The stored credential of the connector goes with the call, and the server never learns who asked.',
      record: { text: 'The call to the MCP server is recorded with its actor.', actor: 'Member' },
      href: '#the-three-kinds-and-how-each-gets-in',
    },
  ],
  scenes,
};
