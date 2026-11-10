import type { PartData, StructureData } from '../figure/types.ts';
import { slotOf } from './slots.ts';

/** The members, orchestrator agent and Context Hub of one space, placed from the corner `[c, r]` of its slab. */
function spaceParts(id: string, name: string, [c, r]: [number, number]): PartData[] {
  return [
    { id: `${id}Members`, label: 'Members', text: `The people of the ${name}. They work only in this space, and their access is worked out inside it.`, icon: 'member', tone: 'core', on: id, c: c + 1.4, r: r + 1.2, w: 3.2, d: 2.8 },
    { id: `${id}Orchestrator`, label: 'Orchestrator agent', text: `The one agent that the ${name} starts with. It works only inside this space.`, icon: 'orchestrator', tone: 'core', on: id, c: c + 5.8, r: r + 1.2, w: 3.2, d: 2.8 },
    { id: `${id}Hub`, label: 'Context Hub', text: `What the ${name} can reach. Each resource in it belongs to this space and to no other space.`, icon: 'contextHub', tone: 'core', on: id, c: c + 1.4, r: r + 5.4, w: 7.6, d: 3 },
  ];
}

/** Slot `organization-structure` of `organizations-and-spaces`: one organization holds several spaces. */
export const organizationStructure: StructureData = {
  id: 'organization-structure',
  title: 'One organization and its spaces',
  desc: 'Two slabs stand side by side on one Organization slab: the sales team’s space and the marketing team’s space. Each space slab holds its own Members, Orchestrator agent and Context Hub. The Organization admin stands on the Organization slab, outside both spaces.',
  caption: slotOf('organization-structure').caption,
  slabs: [
    { id: 'organization', label: 'Organization', text: 'The company account. Every user, API key, resource and space belongs to one organization.', level: 0, c: 0, r: 0, w: 23.8, d: 16 },
    { id: 'salesSpace', label: 'Sales team’s space', text: 'One team’s place for its members, its agents and its data. Access is worked out inside it.', level: 1, c: 1, r: 1, w: 10.4, d: 9.6 },
    { id: 'marketingSpace', label: 'Marketing team’s space', text: 'Acme’s marketing team works here, in the same organization. It has its own members, orchestrator agent and Context Hub.', level: 1, c: 12.4, r: 1, w: 10.4, d: 9.6 },
  ],
  parts: [
    { id: 'admin', label: 'Organization admin', text: 'The one person who manages the organization’s users and spaces. A transfer passes the place to another member.', icon: 'admin', tone: 'plug', on: 'organization', c: 1.4, r: 12, w: 3.2, d: 2.8 },
    ...spaceParts('salesSpace', 'sales team’s space', [1, 1]),
    ...spaceParts('marketingSpace', 'marketing team’s space', [12.4, 1]),
  ],
  links: [],
  legend: [
    { swatch: 'core', text: 'Inside one space' },
    { swatch: 'plug', text: 'Belongs to the organization, not to one space' },
  ],
};
