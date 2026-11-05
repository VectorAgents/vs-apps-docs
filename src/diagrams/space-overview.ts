import type { IsoDiagramData } from './isoLayout.ts';

/** Height of the Organization slab top, where the Space slab stands. */
const ORG_TOP = 6;
/** Height of the Space slab top, where the parts of a space stand. */
const SPACE_TOP = 11;

export const spaceOverview: IsoDiagramData = {
  title: 'Vector Space at a glance',
  desc: 'An organization holds spaces. A space has an orchestrator agent, a resource pool, members, space pages, a Command Center and Vector Apps. An A2A agent and an MCP connector plug in from outside the space, on dashed links.',
  caption: 'An organization, a space and what plugs into it',
  legendTitles: { places: 'Places', parts: 'Parts', links: 'Links' },
  slabs: [
    { id: 'organization', label: 'Organization', text: 'The tenant. Every user, key, resource and space belongs to one.', tone: 'slab', c: 0, r: 0, w: 12, d: 12, h: ORG_TOP, z: 0, labelAt: 'front' },
    { id: 'space', label: 'Space', text: 'The unit of work. Access is resolved inside it, for each member and action.', tone: 'slab', c: 1.5, r: 1.5, w: 9, d: 9, h: SPACE_TOP - ORG_TOP, z: ORG_TOP, labelAt: 'front' },
  ],
  parts: [
    { id: 'orchestrator', badge: 1, label: 'Orchestrator agent', text: 'The one agent that runs the space. It delegates to other agents.', tone: 'core', c: 4.5, r: 5.3, w: 2, d: 2, h: 30, z: SPACE_TOP },
    { id: 'pool', badge: 2, label: 'Resource pool', text: 'Everything the space holds: connectors, knowledge sources, skills, apps and space pages.', tone: 'core', c: 6, r: 2.5, w: 2.5, d: 2, h: 14, z: SPACE_TOP },
    { id: 'members', badge: 3, label: 'Members', text: 'The people of the space, each with a role.', tone: 'core', c: 2.5, r: 2.5, w: 2, d: 2, h: 10, z: SPACE_TOP },
    { id: 'pages', badge: 4, label: 'Space pages', text: 'Grids of widgets and documents.', tone: 'core', c: 2.3, r: 6.5, w: 2, d: 2.2, h: 8, z: SPACE_TOP },
    { id: 'commandCenter', badge: 5, label: 'Command Center', text: 'Everything an agent or an app waits on a person for.', tone: 'core', c: 8, r: 5.3, w: 2, d: 2, h: 8, z: SPACE_TOP },
    { id: 'app', badge: 6, label: 'Vector Apps', text: 'Web apps on their own origins. Each app page opens in an iframe.', tone: 'plug', c: 6, r: 7.9, w: 2.8, d: 1.8, h: 16, z: SPACE_TOP },
    { id: 'a2a', badge: 7, label: 'A2A agent', text: 'A remote agent that the orchestrator agent delegates to, over a dashed link.', tone: 'plug', c: 13.5, r: 2, w: 2, d: 2, h: 14, z: 0 },
    { id: 'mcp', badge: 8, label: 'MCP connector', text: 'A remote server of tools that agents call, over a dashed link.', tone: 'plug', c: 13.5, r: 6, w: 2, d: 2, h: 14, z: 0 },
  ],
  links: [
    { id: 'a2a-link', from: [13.5, 3], to: [10.5, 3], z: 8, remote: true },
    { id: 'mcp-link', from: [13.5, 7], to: [10.5, 7], z: 8, remote: true },
  ],
};
