---
title: Agent action trees
description: Declare a child agent action that exists only while its parent is mounted, and test the app page without Vector Space.
---

Add a child [agent action](../../sdk/glossary.md#agent-action) that the agent can call only after it opens a Lead List, and mount the [app page](../glossary.md#app-page) in a test without [Vector Space](../../vector-space/glossary.md#vector-space). When you finish, `leads.export_leads` is in the [agent catalog](../../sdk/glossary.md#agent-catalog) and the test harness renders `LeadsPage` without `AppProvider`.

## Prerequisites

- The app from [Expose agent actions on an app page](../recipes/expose-agent-actions.md), with the `leads` app page, the action `leads.open_lead_list` and the catalog that lists it. Work inside that project folder.
- Background: [`defineAgentPage`](../../sdk/reference/root.md#defineagentpage), [`AgentActionRegistryProvider`](../../sdk/reference/react.md#react-agentactionregistryprovider) and the [quickstart](../quickstart.md) for the app setup.

## Steps

### 1. Declare a child action

`child` declares an action that is available only while its parent is mounted. Add `exportLeadsAction` to `client/src/actions.ts`.

```ts title="client/src/actions.ts"
import { defineAgentPage } from '@vectoragents/vs-apps';
import { z } from 'zod';

export const leadsPage = defineAgentPage({
  pageId: 'leads',
  description: 'Leads: people and companies found by lead searches, kept in Lead Lists.',
});

export const openLeadListAction = leadsPage.action({
  id: 'open_lead_list',
  description: "Open one Lead List's page, where its leads arrive as a search runs.",
  params: z.object({ leadListId: z.string() }),
});

// added-start
export const exportLeadsAction = openLeadListAction.child({
  id: 'export_leads',
  description: "Download the open Lead List's leads as a csv or xlsx file.",
  params: z.object({ format: z.enum(['csv', 'xlsx']) }),
});
// added-end
```

If the agent calls the child while its parent is not mounted, the call returns `UNAVAILABLE_ACTION`. Step 2 mounts the child only after a Lead List opens.

### 2. Bind the parent and the child in nested components

Bind the child inside the component that the parent action opens, so the child exists only while a Lead List is open. Replace the contents of `client/src/LeadsPage.tsx` as marked.

```tsx title="client/src/LeadsPage.tsx"
import { useAgentAction } from '@vectoragents/vs-apps/react';
import { useState } from 'react';
// removed-next-line
import { openLeadListAction } from './actions';
// added-next-line
import { exportLeadsAction, openLeadListAction } from './actions';

// added-start
function ExportControls({ leadListId }: { leadListId: string }) {
  const [last, setLast] = useState('none');

  useAgentAction(exportLeadsAction, ({ format }) => {
    setLast(format);
  });

  return <p>Lead List {leadListId}, last export: {last}.</p>;
}

// added-end
export function LeadsPage() {
  const [openId, setOpenId] = useState<string | null>(null);

  useAgentAction(openLeadListAction, ({ leadListId }) => {
    setOpenId(leadListId);
  });

  return (
    <main>
      <h1>Leads</h1>
      {/* removed-next-line */}
      <p>{openId ? `Lead List ${openId} is open.` : 'Pick a Lead List.'}</p>
      {/* added-next-line */}
      {openId ? <ExportControls leadListId={openId} /> : <p>Pick a Lead List.</p>}
    </main>
  );
}
```

### 3. Test the app page without Vector Space

`AppProvider` already mounts the registry, and a second `AgentActionRegistryProvider` splits it. Mount the provider directly only where `AppProvider` is absent, such as a test or a story.

```tsx title="client/src/LeadsPage.harness.tsx"
import { AgentActionRegistryProvider } from '@vectoragents/vs-apps/react';
import { LeadsPage } from './LeadsPage';

export function LeadsPageHarness() {
  return (
    <AgentActionRegistryProvider>
      <LeadsPage />
    </AgentActionRegistryProvider>
  );
}
```

To trigger an action in such a test, read the registry with `useAgentActionRegistry` and call `dispatch('leads.open_lead_list', { leadListId: 'll-1' })`. `dispatch` never throws. On failure it returns `{ ok: false, code }`. The [root reference](../../sdk/reference/root.md#createagentactionregistry) lists the registry methods.

### 4. Check the catalog

Write the catalog again so it lists the child. Run the command from the project folder.

```bash
npm exec --workspace client -- vs-apps catalog extract scripts/agent-catalog.ts
```

The command prints `agent-catalog: 1 pages, 2 actions`. The file `server/agent-catalog.json` now lists `leads.export_leads` with `"parent": "leads.open_lead_list"`. Restart the server so `buildManifests` reads the new catalog. The agent sees `leads.export_leads` only after it opens a Lead List.

## Next steps

- [React reference](../../sdk/reference/react.md): look up every export of the agent action registry.
