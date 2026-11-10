import type { StructureData } from '../figure/types.ts';
import { slotOf } from './slots.ts';

/** Slot `agent-tree` of `agents-in-a-space`: one orchestrator agent leads the agents of a space. */
export const agentTree: StructureData = {
  id: 'agent-tree',
  title: 'The agent tree of a space',
  desc: 'The orchestrator agent stands at the back of the Workspace slab. Below it are two agents for specific jobs, a lead search agent and an email agent. The lead search agent has a child agent. The email agent has a short-lived helper. A dashed line joins the orchestrator agent to an A2A agent that stands on the Organization slab, outside the space.',
  caption: slotOf('agent-tree').caption,
  slabs: [
    { id: 'organization', label: 'Organization', text: 'The company account. A remote agent that a space reaches runs outside the space.', level: 0, c: 0, r: 0, w: 18, d: 16 },
    { id: 'space', label: 'Workspace', text: 'The place where a team works. Its agents work only inside it.', level: 1, c: 1, r: 1, w: 11.4, d: 14 },
  ],
  parts: [
    { id: 'orchestrator', label: 'Orchestrator agent', text: 'The one agent that each space starts with. It takes the request of a member and gives parts of it to the agents below it.', icon: 'orchestrator', tone: 'core', on: 'space', c: 5, r: 2.2, w: 3.2, d: 2.8 },
    { id: 'lead', label: 'Lead search agent', text: 'An agent for one job, such as searching leads. It can give each source to a child agent.', icon: 'orchestrator', tone: 'core', on: 'space', c: 2.4, r: 6.4, w: 3.2, d: 2.8 },
    { id: 'email', label: 'Email agent', text: 'An agent for another job, such as drafting an outreach email.', icon: 'orchestrator', tone: 'core', on: 'space', c: 7.6, r: 6.4, w: 3.2, d: 2.8 },
    { id: 'child', label: 'Child agent', text: 'An agent that takes part of the job of the agent above it. Only agents built into the space have child agents.', icon: 'orchestrator', tone: 'core', on: 'space', c: 2.4, r: 10.6, w: 3.2, d: 2.8 },
    { id: 'helper', label: 'Short-lived helper', text: 'Started by an agent for one task. It is retired when the task ends.', icon: 'helper', tone: 'core', on: 'space', c: 7.6, r: 10.6, w: 3.2, d: 2.8 },
    { id: 'a2a', label: 'A2A agent', text: 'A remote agent that its owner runs outside the space. The orchestrator agent reaches it with an agent card. It has no child agents.', icon: 'a2a', tone: 'plug', on: 'organization', c: 14, r: 2.2, w: 3.2, d: 2.8 },
  ],
  links: [
    { id: 'orchestrator-lead', from: 'orchestrator', to: 'lead' },
    { id: 'orchestrator-email', from: 'orchestrator', to: 'email' },
    { id: 'lead-child', from: 'lead', to: 'child' },
    { id: 'email-helper', from: 'email', to: 'helper' },
    { id: 'orchestrator-a2a', from: 'orchestrator', to: 'a2a', remote: true },
  ],
  legend: [
    { swatch: 'core', text: 'Inside the space' },
    { swatch: 'plug', text: 'Outside the space' },
    { swatch: 'link', text: 'Line: an agent and the agent below it' },
    { swatch: 'remote', text: 'Dashed line: a remote link' },
  ],
};
