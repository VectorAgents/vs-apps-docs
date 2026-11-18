---
title: Root reference
description: Signature, behaviour and example of the agent page and action registry exports of `@vectoragents/vs-apps`.
---

The `@vectoragents/vs-apps` package root holds the [app definition](../glossary.md#app-definition) and the schemas that the client and the server share. A client imports three exports from it: `defineAgentPage`, `appPages` and `createAgentActionRegistry`. The [app definition guide](../app-definition.md) covers `defineApp`.

## Prerequisites

- `zod` version 3, installed with `npm install zod@3`, for the parameter schema of an action. Zod 4 gives an empty `paramsJsonSchema`, so the agent sees no parameters.

## `defineAgentPage`

Declares an [app page](../../vector-apps/glossary.md#app-page) the space agent can read, and returns the factory for its [agent actions](../glossary.md#agent-action).

### Signature

```typescript
function defineAgentPage(meta: AgentPageMeta): AgentPageHandle;

interface AgentPageMeta {
  pageId: string;
  description: string;
}

interface AgentPageHandle extends AgentPageMeta {
  action<S extends z.ZodTypeAny>(input: AgentActionInput<S>): AgentActionHandle<S>;
}

interface AgentActionHandle<S extends z.ZodTypeAny = z.ZodTypeAny> extends AgentActionDef<S> {
  child<C extends z.ZodTypeAny>(input: AgentActionInput<C>): AgentActionHandle<C>;
}

interface AgentActionInput<S extends z.ZodTypeAny = z.ZodTypeAny> {
  id: string;
  description: string;
  params?: S;
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `pageId` | required | Unique id of the page, used as the prefix of every action id on it. |
| `description` | required | What the page is for, read by the agent to decide when it applies. |

`page.action(...)` and `action.child(...)` take an `AgentActionInput`:

| Field | Required | Meaning |
| --- | --- | --- |
| `id` | required | Local action name in snake_case, which the factory namespaces as `<pageId>.<id>`. |
| `description` | required | What the action does, read by the agent to decide when to call it. |
| `params` | optional | A zod schema for the action params, left out for an action without params. |

### Behaviour

- Registers the page and each action in a module-level collector at import time.
- `page.action(...)` roots an action on the page. `action.child(...)` declares an action that is available only while its parent is mounted.
- Throws `duplicate agent page "<pageId>"` for a repeated `pageId`, and `duplicate agent action id "<id>"` for a repeated action id.
- Throws `agent action "<id>" on page "<pageId>" must be a local snake_case name` for an `id` that is not a snake_case local name.
- Declaring an action does not make it callable. A component must bind it with `useAgentAction` from [`/react`](./react.md).
- Write each `description` for the agent. The SDK puts it in the manifest, which [Vector Space](../../vector-space/glossary.md#vector-space) reads.

### Example

```ts title="src/actions.ts"
import { defineAgentPage } from '@vectoragents/vs-apps';
import { z } from 'zod';

export const leadsPage = defineAgentPage({
  pageId: 'leads',
  description: 'SDR leads: people and companies found by lead searches, kept in Lead Lists.',
});

export const openLeadListAction = leadsPage.action({
  id: 'open_lead_list',
  description: "Open one Lead List's page, where its leads arrive as a search runs.",
  params: z.object({ leadListId: z.string() }),
});

export const exportLeadsAction = openLeadListAction.child({
  id: 'export_leads',
  description: "Download the open Lead List's leads as a csv or xlsx file.",
  params: z.object({ format: z.enum(['csv', 'xlsx']) }),
});
```

The action identifiers are `leads.open_lead_list` and `leads.export_leads`.

## `appPages`

Returns the pages of the app that a verified token names.

### Signature

```typescript
function appPages(apps: readonly AppDefinition[], appKey: string | undefined): AppPageDef[];

interface AppPageDef {
  key: string;
  label: string;
  path: string;
  permission?: string;
}
```

| Parameter | Required | Meaning |
| --- | --- | --- |
| `apps` | required | The app definitions bundled in the client. |
| `appKey` | required | The `appKey` claim from `useApp().claims`, or `undefined` before the handshake. |

### Behaviour

- Returns the `pages` of the definition whose `key` equals `appKey`.
- Returns `[]` when `appKey` is `undefined` or matches no definition.
- Does not filter by capability. Filter on `page.capability` with `useApp().hasCapability`, as the example does.
- A capability check in the client only shapes the UI. The server must enforce the same [capability](../../vector-apps/glossary.md#capability).

### Example

```tsx title="src/AppHome.tsx"
import { appPages, defineApp } from '@vectoragents/vs-apps';
import { useApp } from '@vectoragents/vs-apps/react';

const sdr = defineApp({
  key: 'sdr',
  version: '0.1.0',
  pages: [
    { key: 'leads', label: 'Leads', path: '/leads', permission: 'lead:manage' },
    { key: 'dashboard', label: 'Dashboard', path: '/dashboard' },
  ],
  permissions: [{ key: 'lead:manage', label: 'Manage leads', effect: 'write' }],
});

export function AppHome() {
  const { claims, hasPermission } = useApp();
  const pages = appPages([sdr], claims?.appKey).filter(
    (page) => !page.permission || hasPermission(page.permission),
  );

  return (
    <nav>
      {pages.length === 0 ? <p>No pages available for your role.</p> : null}
      {pages.map((page) => (
        <a key={page.key} href={page.path}>
          {page.label}
        </a>
      ))}
    </nav>
  );
}
```

## `createAgentActionRegistry`

Creates the registry that holds the agent actions that are mounted now and dispatches calls to their handlers.

### Signature

```typescript
function createAgentActionRegistry(): AgentActionRegistry;

interface AgentActionRegistry {
  register(def: AgentActionDef, handler: AgentActionHandler): () => void;
  getMountedActions(): AgentCatalogAction[];
  dispatch(
    actionId: string,
    params?: unknown,
    context?: AgentActionContext,
  ): Promise<AgentActionDispatchResult>;
}

type AgentActionDispatchResult =
  | { ok: true }
  | { ok: false; code: 'UNAVAILABLE_ACTION'; missingParent?: string }
  | { ok: false; code: 'INVALID_PARAMS'; message: string }
  | { ok: false; code: 'HANDLER_ERROR'; message: string };
```

| Method | Meaning |
| --- | --- |
| `register` | Stores a handler under `def.id` and returns a function that removes it. |
| `getMountedActions` | Returns every mounted action as a serialised definition, with `params` as JSON Schema. |
| `dispatch` | Runs the handler for `actionId` and returns the outcome as a result object. |

### Behaviour

- [`AgentActionRegistryProvider`](./react.md#react-agentactionregistryprovider) creates one registry for the tree, and `useAgentAction` is the only caller of `register` in a React app. Call `createAgentActionRegistry` directly only on another framework, where the registry goes to `startAppSession` from [`/browser`](./browser.md#startappsession), or in a test.
- Registering a second handler for the same id replaces the first. The function that `register` returns removes the entry only while it still holds its own handler.
- `dispatch` never throws. It validates `params` against the action's schema and passes the parsed value to the handler. Without a schema, `params` reach the handler unchanged.
- `context` reaches the handler as its second argument. Concurrent dispatches do not share it.
- A child action is available only while its parent is mounted. Dispatching it without the parent returns `UNAVAILABLE_ACTION` with `missingParent`.
- A handler that throws, or rejects, returns `HANDLER_ERROR` with the error message.
- The bridge that Vector Space talks to calls `dispatch` and reports the outcome. After each successful call, the bridge reports the mounted actions.

### Example

```ts title="src/registry.ts"
import { createAgentActionRegistry, defineAgentPage } from '@vectoragents/vs-apps';
import { z } from 'zod';

const leadsPage = defineAgentPage({
  pageId: 'leads-registry',
  description: 'SDR leads, driven without React.',
});

const openLeadListAction = leadsPage.action({
  id: 'open_lead_list',
  description: "Open one Lead List's page.",
  params: z.object({ leadListId: z.string() }),
});

export const registry = createAgentActionRegistry();

const unregister = registry.register(openLeadListAction, ({ leadListId }) => {
  console.log(`Lead List ${leadListId} is open.`);
});

export async function openFirstList(): Promise<string> {
  const result = await registry.dispatch('leads-registry.open_lead_list', { leadListId: 'first' });
  unregister();
  return result.ok ? 'opened' : result.code;
}
```

## Next steps

- [Browser reference](./browser.md): load the boot configuration and start the app session.
