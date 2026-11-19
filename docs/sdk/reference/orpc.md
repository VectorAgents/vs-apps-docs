---
title: oRPC reference
description: Signature, behaviour and example of each `@vectoragents/vs-apps/orpc` export.
---

The `@vectoragents/vs-apps/orpc` subpath binds the SDK to [oRPC](https://orpc.unnoq.com), the contract library that an app server shares with its client. It holds the routes every app server exposes and a contract builder that marks a route for the space agent. It also holds the function that lists those routes for the [manifest](../../vector-apps/glossary.md#manifest).

## Prerequisites

- `@orpc/contract` installed. It is a peer dependency of the subpath.
- `zod` version 3, installed with `npm install zod@3`, for the schemas of a route.
- A server that builds its manifests with `buildManifests`, covered in the [server reference](./server.md).

## `agentOc`

The contract builder that opts a route into the agent catalog. It is the `oc` builder of `@orpc/contract` with a typed `agent` entry in its `meta`.

### Signature

```typescript
const agentOc: ContractBuilder</* oc builder with meta */>;

interface AgentRouteMeta {
  description: string;
  approvalRequired?: boolean;
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `description` | required | What the route does, read by the agent to decide when to call it. |
| `approvalRequired` | optional | Whether a person must approve each call, `true` unless the method is `GET`. |

### Behaviour

- Use `agentOc` in place of `oc` for every route that the agent may call. A route built with plain `oc` stays out of the catalog.
- `.meta({ agent: { description } })` marks the route. A route without it is not listed.
- Set `method` and `path` with `.route(...)`. Without them `buildEndpoints` throws `agent-exposed contract procedure "<key>" has no route method/path`.
- The agent calls the route with a user token that [Vector Space](../../vector-space/glossary.md#vector-space) mints, so the guard of your server still applies.

### Example

```ts title="server/src/contract.ts"
import { agentOc } from '@vectoragents/vs-apps/orpc';
import { z } from 'zod';

const leadSchema = z.object({ id: z.string(), name: z.string() });

export const leadsContract = {
  list: agentOc
    .route({ method: 'GET', path: '/leads' })
    .meta({ agent: { description: 'List the leads of the current space.' } })
    .output(z.array(leadSchema)),
  rename: agentOc
    .route({ method: 'POST', path: '/leads/rename' })
    .meta({ agent: { description: 'Rename one lead.' } })
    .input(z.object({ id: z.string(), name: z.string() }))
    .output(leadSchema),
};
```

## `buildEndpoints`

Reads the agent routes of a contract into the endpoint list that `buildManifests` takes.

### Signature

```typescript
function buildEndpoints(contract: unknown): AgentEndpointDef[];

interface AgentEndpointDef {
  key: string;
  method: string;
  path: string;
  description: string;
  approvalRequired: boolean;
  paramsJsonSchema?: Record<string, unknown>;
  permission?: string;
}
```

| Property | Meaning |
| --- | --- |
| `key` | The position of the route in the contract, joined with dots, such as `leads.list`. |
| `method` | The HTTP method of the route. |
| `path` | The path of the route. |
| `description` | The description from `meta.agent`. |
| `approvalRequired` | Whether a person must approve each call. |
| `paramsJsonSchema` | The input schema as JSON Schema, absent for a route without an input. |
| `permission` | Set from the auth metadata of the route, absent when the route has none. |

### Behaviour

- Walks the whole contract, including nested routers, and lists each route that has `meta.agent`.
- Throws at boot for a marked route without a description: `agent-exposed contract procedure "<key>" has no description`. A bad mark breaks the build and never drops the route silently.
- Runs on the server, so no client bundle carries the walk.
- Pass the result to `buildManifests` as `endpoints`, keyed by the app key. `buildManifests` anchors each endpoint at the API base of the app.
- On a stack that is not oRPC, build the `AgentEndpointDef` list yourself and pass it the same way.

### Example

```ts title="server/src/manifests.ts"
import { defineApp } from '@vectoragents/vs-apps';
import { readExtractedAgentCatalog } from '@vectoragents/vs-apps/extract';
import { buildEndpoints } from '@vectoragents/vs-apps/orpc';
import { buildManifests } from '@vectoragents/vs-apps/server';
import { leadsContract } from './contract';

const leads = defineApp({
  key: 'leads',
  version: '0.1.0',
  pages: [{ key: 'home', label: 'Home', path: '/' }],
  permissions: [],
});

export const manifests = buildManifests([leads], {
  catalog: readExtractedAgentCatalog('agent-catalog.json'),
  endpoints: { leads: buildEndpoints(leadsContract) },
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? '',
});
```

## `appPlatformContract`

The routes that every app server exposes to its own client: a health check, and the `app.*` routes that forward calls to Vector Space.

### Signature

```typescript
const appPlatformContract: {
  health: { check: /* GET /health */ };
  app: {
    datasourceQuery: /* POST /app/actions/datasource-query */;
    datasourceAsk: /* POST /app/actions/datasource-ask */;
    agentInvoke: /* POST /app/actions/agent-invoke */;
    connectorExecute: /* POST /app/actions/connector-execute */;
    retrievalQuery: /* POST /app/actions/retrieval-query */;
    retrievalSources: /* GET /app/actions/retrieval-sources */;
    audience: /* GET /app/audience */;
    config: { get: /* GET /app/config */ };
  };
};
```

### Behaviour

- Spread it into the contract of your app next to the contract of each app key, as the example does.
- The `app.*` routes have no implementation here. Bind each one to the `actions` of the [app platform](../glossary.md#app-platform), `platform.actions`, or to `AppActionsService` on Nest.js. The platform adds the verified space and the token of the caller.
- `healthOutputSchema` is the output schema of `health.check`.

### Example

```ts title="server/src/app-contract.ts"
import { appPlatformContract } from '@vectoragents/vs-apps/orpc';
import { leadsContract } from './contract';

export const appContract = { ...appPlatformContract, leads: leadsContract };
```

## Next steps

- [Extract reference](./extract.md): write the agent catalog at build time.
