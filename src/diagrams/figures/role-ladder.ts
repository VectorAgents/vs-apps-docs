import type { LadderData } from '../figure/ladder-types.ts';
import { slotOf } from './slots.ts';

/** Slot `role-ladder` of `who-can-do-what`: what each space role adds to the one below. */
export const roleLadder: LadderData = {
  id: 'role-ladder',
  title: 'The space role ladder',
  desc: 'Three steps, from the lowest: space member, space editor and space admin. Each step lists only what it adds to the step below. A custom role and the organization admin stand beside the steps.',
  caption: slotOf('role-ladder').caption,
  steps: [
    {
      id: 'member',
      label: 'Space member',
      holds: 'No level on every resource',
      adds: ['Chat with agents and build pages', 'Answer an ask that their own run raises', 'Create resources of their own, private at first'],
    },
    {
      id: 'editor',
      label: 'Space editor',
      holds: 'Can edit on every resource',
      plus: 'Everything a space member holds, plus:',
      adds: ['Create, configure, delete, reset and publish agents', "Edit any resource except another member's Restricted resource", "Open an app's config sheet and route its events"],
    },
    {
      id: 'admin',
      label: 'Space admin',
      holds: 'Can manage on every resource',
      plus: 'Everything a space editor holds, plus:',
      adds: ['Add members', 'Set policies', 'Add, bind and remove apps', "Set an app's model slot", 'Share an app', 'Answer an ask that an app raises', 'Set a standing approval for the whole space'],
    },
  ],
  asides: [
    { id: 'custom', label: 'Custom role', text: 'Adds permissions on top of any one step. It is not a step. The organization admin defines it and a space admin gives it.' },
    { id: 'orgAdmin', label: 'Organization admin', text: 'A space admin of every space of the organization.' },
  ],
};
