---
title: Expose your app as an A2A agent
description: Declare an A2A agent in the app definition, serve its agent card and answer calls from Vector Space on your server.
start: leads-app
---

Let another agent find your app and call it with the [A2A](../../vector-space/glossary.md#a2a) protocol. When you finish, `GET /api/a2a/<spaceId>/.well-known/agent-card.json` serves the [agent card](../../vector-space/glossary.md#agent-card), and `POST /api/a2a/<spaceId>` answers calls from [Vector Space](../../vector-space/glossary.md#vector-space) and streams a reply.

This guide covers a Node.js server.

## Prerequisites

- A GitHub package token in `GITHUB_PACKAGES_TOKEN`, as in [step 0 of the quickstart](../quickstart.md#0-set-up-access-to-the-package-registry). The scaffold command reads it.
- The `leads-app` start. Scaffold it into a new folder, `leads-guide`, so it does not clash with the `leads-app` folder of a recipe. Work inside the new folder.

<!-- flavour node -->
```bash
npm create @vectoragents/app leads-guide -- --client react --server node --start leads-app
cd leads-guide
```
<!-- /flavour -->
<!-- flavour nest -->
```bash
npm create @vectoragents/app leads-guide -- --client react --server nest --start leads-app
cd leads-guide
```
<!-- /flavour -->

- The server runs with `npm run dev:space`, as set up in [Part 2 of the quickstart](../quickstart.md#part-2-add-the-app-to-a-space).
- Background: the [server primitives](../../sdk/reference/root.md) and the [`/server` reference](../../sdk/reference/server.md).

## Steps

<!-- flavour node -->
### 1. Declare the agent

You declare the agent in the [app definition](../../sdk/glossary.md#app-definition). Vector Space reads the declaration from the [manifest](../glossary.md#manifest), fetches the card and sends calls to the address in it. An entry in `agents` tells Vector Space where to find the card.

`cardUrlTemplate` is an absolute URL with two tokens. `buildManifests` replaces `{publicBaseUrl}` with the `PUBLIC_BASE_URL` of your server. Vector Space replaces `{spaceId}` with the identifier of each space. `key` is a lowercase name with hyphens that stays the same across versions.

```ts title="shared/src/index.ts" showLineNumbers=24 excerpt
    { key: 'lead:manage', label: 'Manage Leads', effect: 'write' },
    { key: 'icp:manage', label: 'Manage ICP', effect: 'write' },
  ],
  // added-start
  agents: [
    {
      key: 'leads-agent',
      protocol: 'a2a',
      cardUrlTemplate: '{publicBaseUrl}/api/a2a/{spaceId}',
    },
  ],
  // added-end
});
```

:::warning
A manifest change waits as a pending review. Until Vector applies it, Vector Space does not read the new `agents` entry. Ask Vector to apply it, as in [step 4 of add an app page and a capability](../recipes/add-page-and-capability.md#react-4-let-vector-space-read-the-manifest).
:::

### 2. Build the card

An agent card is a JSON file that names the agent, lists its skills and says where to send calls. `buildAppAgentCard` from the `@vectoragents/vs-apps/server` subpath of the [SDK](../../sdk/glossary.md#sdk) returns the card as an object. The card is the only place that holds the name, the description and the skills of the agent. The definition holds none of them.

`rpcUrl` is where Vector Space sends calls, so it must match the route in step 3. The card also declares that callers send a bearer token, which Vector Space signs.

```ts title="server/src/a2a-card.ts"
import { buildAppAgentCard } from '@vectoragents/vs-apps/server';

const baseUrl = (process.env.PUBLIC_BASE_URL ?? '').replace(/\/$/, '');

export function agentCard(spaceId: number) {
  return buildAppAgentCard({
    name: 'Leads agent',
    description: 'Answers questions about the leads in a space.',
    rpcUrl: `${baseUrl}/api/a2a/${spaceId}`,
    skills: [
      {
        id: 'answer-lead-question',
        name: 'Answer a lead question',
        description: 'Replies to a question about leads and Lead Lists.',
        tags: ['leads'],
      },
    ],
  });
}
```

### 3. Answer the calls

A2A agents answer calls in JSON Remote Procedure Call (JSON-RPC), a message format built on JSON. `createA2aRequestHandler` takes one function, `generate`. It receives the text of the incoming message and yields the reply as an async sequence. A string is a piece of reply text, and the pieces together make the full reply. `{ kind: 'data', data }` adds a JSON result.

The handler answers `message/send` with one JSON body. It answers `message/stream` with a function that writes the events, so your route sets the stream headers. Any other method gets a "Method not found" error.

`verifyS2sToken` checks the bearer token against the public keys of Vector Space. It pins the token to one space and one app, so a token for another space or app gets `403`. A call with no token gets `401`. The second argument of the handler, `ctx`, carries the space identifier into `generate`.

```ts title="server/src/a2a.ts"
import type { IncomingMessage, ServerResponse } from 'node:http';
import {
  verifyS2sToken,
  createA2aRequestHandler,
  createSpaceTokenVerifier,
  readBearer,
  readJsonBody,
  type A2aGenerateInput,
} from '@vectoragents/vs-apps/server';
import { agentCard } from './a2a-card';

const verifier = createSpaceTokenVerifier({ jwksUrl: process.env.SPACE_JWKS_URL ?? '' });

type Context = { spaceId: number };

async function* generate({ text }: A2aGenerateInput, ctx: Context) {
  yield `Leads agent of space ${ctx.spaceId}. `;
  yield `You asked: ${text}`;
}

const handleCall = createA2aRequestHandler<Context>({ generate });

const route = /^\/api\/a2a\/(\d+)(\/\.well-known\/agent-card\.json)?$/;

export async function handleA2aRoute(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const { pathname } = new URL(req.url ?? '/', 'http://localhost');
  const match = route.exec(pathname);
  if (!match) return false;
  const spaceId = Number(match[1]);

  if (match[2]) {
    if (req.method !== 'GET') return false;
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(agentCard(spaceId)));
    return true;
  }
  if (req.method !== 'POST') return false;

  await verifyS2sToken(verifier, { token: readBearer(req.headers), kind: 'a2a', spaceId, appKey: 'hello-app' });
  const result = await handleCall(await readJsonBody(req), { spaceId });
  if (result.kind === 'json') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(result.body));
    return true;
  }
  res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' });
  await result.run({
    write: (chunk) => res.write(chunk),
    end: () => res.end(),
    closed: () => res.destroyed,
  });
  return true;
}
```

The card route needs no token, because the card holds no secret. The call route refuses a request before it reads the body.

### 4. Register the route

In `server/src/main.ts`, import `handleA2aRoute` from `./a2a`.

```ts title="server/src/main.ts" showLineNumbers=3 excerpt
import { CAPABILITY } from '@hello-app/shared';
import { AppAuthError } from '@vectoragents/vs-apps/server';
// added-next-line
import { handleA2aRoute } from './a2a';
import { requireCapability } from './auth';
import { platform } from './platform';
```

Then add the route inside the `try`, after the `platform.fetch` check and before the `/api/hello` check. A token failure reaches the existing `catch`, which answers with the status of the `AppAuthError`.

```ts title="server/src/main.ts" showLineNumbers=33 excerpt
  try {
    const handled = await platform.fetch(toFetchRequest(req));
    if (handled) return await sendFetchResponse(res, handled);
    // added-next-line
    if (await handleA2aRoute(req, res)) return;
    if (pathname !== '/api/hello') return send(res, 404, { error: 'Not found' });
    const claims = await requireCapability(req, CAPABILITY);
```

### 5. Check the routes

Restart `npm run dev:space`. In a second terminal, fetch the card for space `1` and call the route with no token. `SERVER_PORT` is the value in `.env`.

```bash
curl -s http://localhost:<SERVER_PORT>/api/a2a/1/.well-known/agent-card.json
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:<SERVER_PORT>/api/a2a/1
```

The first command prints a card whose `url` ends in `/api/a2a/1`. The second prints `401`, because the route verifies a token from Vector Space before it reads the call.
<!-- /flavour -->
<!-- flavour nest todo -->
<!-- /flavour -->

## Next steps

- [Call a model from your server](./call-a-model-from-your-server.md): let `generate` answer with a model.
