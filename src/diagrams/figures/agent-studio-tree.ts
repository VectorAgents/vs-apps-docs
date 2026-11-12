import type { StructureData } from '../figure/types.ts';
import { slotOf } from './slots.ts';

/** Slot `agent-studio-tree` of `agent-studio`: the agents of a support space and the remote agent outside it. */
export const agentStudioTree: StructureData = {
  id: 'agent-studio-tree',
  title: 'The agents of a support space',
  desc: 'Agent Studio and the orchestrator agent stand at the back of the Workspace slab. Below the orchestrator agent are two agents for specific jobs, a classifier agent and a reply agent. The ticket classifier agent has a child agent. The reply agent has a short-lived helper. A dashed line joins the orchestrator agent to a customer agent that stands on the Organization slab, outside the space.',
  caption: slotOf('agent-studio-tree').caption,
  slabs: [
    { id: 'organization', label: 'Organization', text: 'The company account. A remote agent that a space reaches runs outside the space.', level: 0, c: 0, r: 0, w: 19, d: 16 },
    { id: 'space', label: 'Workspace', text: 'The place where a team works. Its agents work only inside it.', level: 1, c: 0.8, r: 1, w: 12.6, d: 14 },
  ],
  parts: [
    { id: 'studio', label: 'Agent Studio', text: 'Where a member sets up, tests and publishes the agents of the space.', icon: 'admin', tone: 'core', on: 'space', c: 1.4, r: 2.2, w: 3.2, d: 2.8 },
    { id: 'orchestrator', label: 'Orchestrator agent', text: 'The one agent that each space starts with. It reads each request and gives parts of it to the agents below it. Only its answer reaches the person who asked.', icon: 'orchestrator', tone: 'core', on: 'space', c: 5.6, r: 2.2, w: 3.2, d: 2.8 },
    { id: 'classifier', label: 'Classifier agent', text: 'An agent for one job: sorting a support message by topic and urgency. It can give a part of the job to a child agent.', icon: 'orchestrator', tone: 'core', on: 'space', c: 3.0, r: 6.4, w: 3.2, d: 2.8 },
    { id: 'reply', label: 'Reply agent', text: 'An agent for another job: drafting the answer. Agents at the same height share no state.', icon: 'orchestrator', tone: 'core', on: 'space', c: 8.0, r: 6.4, w: 3.2, d: 2.8 },
    { id: 'child', label: 'Child agent', text: 'An agent that takes part of the job of the agent above it. Only agents built into the space have child agents.', icon: 'orchestrator', tone: 'core', on: 'space', c: 3.0, r: 10.6, w: 3.2, d: 2.8 },
    { id: 'helper', label: 'Short-lived helper', text: 'Started by an agent for one task. It has no children and is retired when the task ends.', icon: 'helper', tone: 'core', on: 'space', c: 8.0, r: 10.6, w: 3.2, d: 2.8 },
    { id: 'crm', label: 'Customer agent', text: 'A remote agent that its owner runs outside the space. The orchestrator agent reaches it with an agent card. It has no child agents and it cannot lead the space. Its own tool calls are not recorded.', icon: 'a2a', tone: 'plug', on: 'organization', c: 15.2, r: 2.2, w: 3.2, d: 2.8 },
  ],
  links: [
    { id: 'studio-orchestrator', from: 'studio', to: 'orchestrator' },
    { id: 'orchestrator-classifier', from: 'orchestrator', to: 'classifier' },
    { id: 'orchestrator-reply', from: 'orchestrator', to: 'reply' },
    { id: 'classifier-child', from: 'classifier', to: 'child' },
    { id: 'reply-helper', from: 'reply', to: 'helper' },
    { id: 'orchestrator-crm', from: 'orchestrator', to: 'crm', remote: true },
  ],
  legend: [
    { swatch: 'core', text: 'Inside the space' },
    { swatch: 'plug', text: 'Outside the space' },
    { swatch: 'link', text: 'Line: an agent and the agent below it' },
    { swatch: 'remote', text: 'Dashed line: a remote link' },
  ],
};
