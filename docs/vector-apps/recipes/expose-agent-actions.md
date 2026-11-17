---
title: Expose agent actions on an app page
description: Declare an agent action on the leads app page, bind a handler to it and write it into the agent catalog.
start: leads-app
---

Declare an [agent action](../../sdk/glossary.md#agent-action) on the `leads` [app page](../glossary.md#app-page), bind a handler to it and write it into the [agent catalog](../../sdk/glossary.md#agent-catalog). `leads.open_lead_list` is in the [manifest](../glossary.md#manifest), and the space [agent](../../vector-space/glossary.md#agent) can call it while the app page is mounted.

## Prerequisites

- A GitHub package token in `GITHUB_PACKAGES_TOKEN`, as in step 0 of the [quickstart](../quickstart.md). The scaffold command reads it.
- The `leads-app` start, added to a space and run with `npm run dev:space`, as in [Part 2 of the quickstart](../quickstart.md#part-2-add-the-app-to-a-space). Step 5 needs a [space](../../vector-space/glossary.md#space) that holds the app and a manifest that [staff](../../vector-space/glossary.md#staff) have applied. Scaffold the start and work inside the new folder. For a Nest.js server, use `--server nest`.

```bash
npm create @vectoragents/app leads-app -- --client react --server node --start leads-app
cd leads-app
```

- Background: [`defineAgentPage`](../../sdk/reference/root.md#defineagentpage), and [`useAgentAction`](../../sdk/reference/react.md). `AppProvider` already mounts the action registry.

## Steps

### 1. Install zod 3 and vite-node

The parameter schema needs `zod` version 3. The catalog command in step 4 runs through `vite-node`, a dev dependency of the client package.

```bash
npm install zod@3 --workspace client
npm install --save-dev vite-node --workspace client
```

:::warning
Zod 4 gives an empty `paramsJsonSchema` and no error, so the agent sees no parameters. Install zod 3.
:::

### 2. Declare the app page and the action

Keep the declarations in one module. The catalog entry and the component import the same handle. `pageId` must equal the `key` of an app page in the app definition. The definition has the app page key `leads`, so `buildManifests` finds the app page.

Write each `description` for the agent. The SDK puts it in the manifest, which [Vector Space](../../vector-space/glossary.md#vector-space) reads.

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
```

The action identifier is `leads.open_lead_list`. `id` must be a snake_case local name that starts with a lowercase letter.

### 3. Bind a handler

The action is available to the agent only while a component that binds it is mounted. The handler receives the parameters parsed by the schema.

```tsx title="client/src/LeadsPage.tsx"
// added-start
import { useAgentAction } from '@vectoragents/vs-apps/react';
import { useState } from 'react';
import { openLeadListAction } from './actions';
// added-end

export function LeadsPage() {
  // added-start
  const [openId, setOpenId] = useState<string | null>(null);

  useAgentAction(openLeadListAction, ({ leadListId }) => {
    setOpenId(leadListId);
  });

  // added-end
  return (
    <main>
      <h1>Leads</h1>
      {/* removed-next-line */}
      <p>No leads yet.</p>
      {/* added-next-line */}
      <p>{openId ? `Lead List ${openId} is open.` : 'Pick a Lead List.'}</p>
    </main>
  );
}
```

### 4. Write the catalog

`server/src/manifests.ts` reads `server/agent-catalog.json` with `readExtractedAgentCatalog` and passes it to `buildManifests`. The file starts empty. This step adds the entry that fills it.

The entry loads `actions.ts`, so the app page and the action register, and then writes the file. The import ends in `.js` because TypeScript requires an extension there. The command resolves it to `actions.ts`.

```ts title="client/scripts/agent-catalog.ts"
import { extractAgentCatalog } from '@vectoragents/vs-apps/extract';

void extractAgentCatalog({
  outPath: '../server/agent-catalog.json',
  load: async () => {
    await import('../src/actions.js');
  },
});
```

Run the command from the project folder. It runs the entry in the `client` folder with the client's own build settings and rewrites `server/agent-catalog.json`. Run it again after each change to an app page or an action.

```bash
npm exec --workspace client -- vs-apps catalog extract scripts/agent-catalog.ts
```

The command prints `agent-catalog: 1 pages, 1 actions`. The file now lists `leads.open_lead_list` with a `paramsJsonSchema` that has `leadListId`.

### 5. Check the action

Restart the server so `buildManifests` reads the new catalog. If `pageId` matches no app page key of the definition, the server stops at start with `extracted page "<pageId>" references unknown page "<pageId>"`. Set `pageId` to the app page key.

Open the leads app page in a space and ask the agent to open a Lead List. The app page shows `Lead List <id> is open.` After each successful call, the SDK reports the mounted actions. A call with parameters that fail the schema returns `INVALID_PARAMS`, and the handler does not run.

## Next steps

- [Agent action trees](../guides/agent-action-trees.md): model actions that exist only inside another action.
