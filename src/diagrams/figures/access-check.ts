import type { StructureData } from '../figure/types.ts';
import { slotOf } from './slots.ts';

/** Slot `access-check` of `one-access-model`: every caller passes one access check on the way to the Context Hub. */
export const accessCheck: StructureData = {
  id: 'access-check',
  title: 'One access check for every way in',
  desc: 'One space slab. Four callers stand in a column on the left: a member in the app, an orchestrator agent, a Vector App and a service account that calls through the API. The access check stands in the middle. The Context Hub stands on the right. A line joins each caller to the access check, and one line joins the access check to the Context Hub.',
  caption: slotOf('access-check').caption,
  slabs: [
    { id: 'space', label: 'space', text: 'Access is worked out inside a space, for each caller and each operation.', level: 0, c: 0, r: 0, w: 24.2, d: 17.8 },
  ],
  parts: [
    { id: 'member', label: 'Member', text: 'A person who works in the web app. The work runs as the member, and the check reads what that member may do.', icon: 'member', tone: 'plug', on: 'space', c: 1.4, r: 1.2, w: 3.2, d: 2.8 },
    { id: 'agent', label: 'Orchestrator agent', text: 'An agent reaches what the member it works for reaches. Its settings can limit that and never add to it.', icon: 'orchestrator', tone: 'plug', on: 'space', c: 1.4, r: 5.4, w: 3.2, d: 2.8 },
    { id: 'app', label: 'Vector App', text: 'A web app that the space shows in an iframe. It reaches only the overlap of its own shares and the access of the member.', icon: 'app', tone: 'plug', on: 'space', c: 1.4, r: 9.6, w: 3.2, d: 2.8 },
    { id: 'serviceAccount', label: 'Service account', text: 'A user that is not a person. A call through the API with its key runs as that account.', icon: 'serviceAccount', tone: 'plug', on: 'space', c: 1.4, r: 13.8, w: 3.2, d: 2.8 },
    { id: 'check', label: 'Access check', text: 'Every call passes this one check, whatever the way in. It reads General access, shares, blocks and conditions for the operation, then lets the call reach the Context Hub or stops it.', icon: 'accessCheck', tone: 'core', on: 'space', c: 10, r: 7.2, w: 3.2, d: 2.8 },
    { id: 'hub', label: 'Context Hub', text: 'What the space can reach, such as a datasource of leads. A call reaches it only after the access check.', icon: 'contextHub', tone: 'core', on: 'space', c: 17.6, r: 7, w: 5.2, d: 3.2 },
  ],
  links: [
    { id: 'member-check', from: 'member', to: 'check' },
    { id: 'agent-check', from: 'agent', to: 'check' },
    { id: 'app-check', from: 'app', to: 'check' },
    { id: 'serviceAccount-check', from: 'serviceAccount', to: 'check' },
    { id: 'check-hub', from: 'check', to: 'hub' },
  ],
  legend: [
    { swatch: 'plug', text: 'A caller that reaches the space' },
    { swatch: 'core', text: 'Inside the space' },
    { swatch: 'link', text: 'Line: the path of a call' },
  ],
};
