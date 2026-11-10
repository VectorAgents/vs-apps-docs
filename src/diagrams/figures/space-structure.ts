import type { StructureData } from '../figure/types.ts';
import { slotOf } from './slots.ts';

/** Slot `space-structure` of `what-vector-space-is`: what is inside a space and what plugs in from outside. */
export const spaceStructure: StructureData = {
  id: 'space-structure',
  title: 'The parts of a space',
  desc: 'Three slabs, from the bottom: Governance, Organization and Workspace. The Workspace slab holds five parts: Members, Orchestrator agent, Command Center, Context Hub and Vector Modules. The Organization slab holds three parts outside the space: an A2A agent, an MCP connector and a Vector App, each joined to the space by a dashed link.',
  caption: slotOf('space-structure').caption,
  slabs: [
    { id: 'governance', label: 'Governance', text: 'Reads across the whole organization: who ran what, and what it cost.', level: 0, c: -1, r: -1, w: 20.6, d: 16 },
    { id: 'organization', label: 'Organization', text: 'The customer account. Every user, key, resource and space belongs to one organization.', level: 1, c: 0, r: 0, w: 18.6, d: 14 },
    { id: 'space', label: 'Workspace', text: 'The place where a team works. Access is worked out for each member and each action.', level: 2, c: 1, r: 1, w: 11.8, d: 11 },
  ],
  parts: [
    { id: 'members', label: 'Members', text: 'The people of the space. What each member can do depends on their access.', icon: 'member', tone: 'core', on: 'space', c: 1.6, r: 1.8, w: 3.2, d: 2.8 },
    { id: 'orchestrator', label: 'Orchestrator agent', text: 'The one agent each space starts with. It takes a request and hands parts of it to other agents.', icon: 'orchestrator', tone: 'core', on: 'space', c: 5.3, r: 1.8, w: 3.2, d: 2.8 },
    { id: 'commandCenter', label: 'Command Center', text: 'Where an ask waits for a person. It is a plain part of the space, not a Vector Module.', icon: 'commandCenter', tone: 'core', on: 'space', c: 9, r: 1.8, w: 3.2, d: 2.8 },
    { id: 'contextHub', label: 'Context Hub', text: 'Everything the space can reach. It holds six kinds of resource, and the figure draws Vector Modules beside it.', icon: 'contextHub', tone: 'core', on: 'space', c: 1.6, r: 5.9, w: 5.2, d: 3.2, items: ['Connectors', 'Knowledge sources', 'Datasources', 'Skills', 'Apps'] },
    { id: 'modules', label: 'Vector Modules', text: 'First-party tools that work over connector data. They sit in the Context Hub.', icon: 'modules', tone: 'core', on: 'space', c: 7.4, r: 5.9, w: 4.8, d: 3.2, items: ['Omnibox', 'Contacts', 'Calendar'] },
    { id: 'a2a', label: 'A2A agent', text: 'A remote agent that speaks the Agent2Agent (A2A) protocol. The orchestrator agent can hand work to it.', icon: 'a2a', tone: 'plug', on: 'organization', c: 14.4, r: 1.6, w: 3.2, d: 2.8 },
    { id: 'mcp', label: 'MCP connector', text: 'A remote server of tools, reached with the Model Context Protocol (MCP). Agents in the space can call it.', icon: 'mcp', tone: 'plug', on: 'organization', c: 14.4, r: 5.7, w: 3.2, d: 2.8 },
    { id: 'app', label: 'Vector App', text: 'A web app that runs on its own origin and opens as a page of the space.', icon: 'app', tone: 'plug', on: 'organization', c: 14.4, r: 9.8, w: 3.2, d: 2.8 },
  ],
  links: [
    { id: 'to-a2a', from: 'space', to: 'a2a', remote: true },
    { id: 'to-mcp', from: 'space', to: 'mcp', remote: true },
    { id: 'to-app', from: 'space', to: 'app', remote: true },
  ],
  legend: [
    { swatch: 'core', text: 'Inside the space' },
    { swatch: 'plug', text: 'Outside the space' },
    { swatch: 'remote', text: 'Dashed line: a remote link' },
  ],
};
