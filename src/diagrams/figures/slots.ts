export interface FigureSlot {
  /** Names the data file `figures/<id>.ts` and the `slot` prop of the placeholder. */
  id: string;
  /** Slug of the page under `docs/vector-space/` that holds the figure. */
  page: string;
  kind: 'structure' | 'flow';
  /** Shown after "Fig. 1 · " by the placeholder and by the real figure. */
  caption: string;
}

/** Placeholders allowed in `docs/`. Lower it each time a real figure replaces one. */
export const PLACEHOLDER_CAP = 0;

export const slots: readonly FigureSlot[] = [
  {
    id: 'space-structure',
    page: 'what-vector-space-is',
    kind: 'structure',
    caption: 'What is inside a space and the three extensions outside it',
  },
  {
    id: 'organization-structure',
    page: 'organizations-and-spaces',
    kind: 'structure',
    caption: 'One organization holds several spaces, and each resource belongs to one space',
  },
  {
    id: 'agent-tree',
    page: 'agents-in-a-space',
    kind: 'structure',
    caption: 'One orchestrator agent leads the agents of a space',
  },
  {
    id: 'access-check',
    page: 'one-access-model',
    kind: 'structure',
    caption: 'Every caller passes the same access check, whatever the way in',
  },
  {
    id: 'record-of-work',
    page: 'the-record-of-work',
    kind: 'structure',
    caption: 'Each execution records who it ran as, and four views read the records',
  },
  {
    id: 'worked-example-flow',
    page: 'how-work-moves-through-a-space',
    kind: 'flow',
    caption: 'One piece of work, from a search for leads to an approved outreach email',
  },
  {
    id: 'approvals-flow',
    page: 'approvals-and-the-command-center',
    kind: 'flow',
    caption: 'Three ways a write is cleared: an ask, a standing approval and a schedule',
  },
  {
    id: 'extending-flow',
    page: 'extending-a-space',
    kind: 'flow',
    caption: 'A space calls a Vector App, an A2A agent and an MCP server in the same way',
  },
  {
    id: 'agent-studio-tree',
    page: 'agent-studio',
    kind: 'structure',
    caption: 'The agents of a support space, and the remote CRM agent that stands outside it',
  },
  {
    id: 'agent-studio-access',
    page: 'agent-studio',
    kind: 'flow',
    caption: "One request, from a member's question to an approved write, with the access check at each step",
  },
  {
    id: 'agent-studio-lifecycle',
    page: 'agent-studio',
    kind: 'flow',
    caption: 'One change to an agent, from a draft edit to a published version and back',
  },
];

/** The row of one slot. A figure takes its caption from here, so the placeholder and the figure agree. */
export function slotOf(id: string): FigureSlot {
  const row = slots.find((s) => s.id === id);
  if (!row) throw new Error(`Unknown figure slot "${id}"`);
  return row;
}
