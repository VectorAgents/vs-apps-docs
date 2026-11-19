---
title: Call Vector Space from your server
description: Call Vector Space from your server as the signed-in member and as the app, with one route for each.
start: leads-app
---

Call [Vector Space](../../vector-space/glossary.md#vector-space) from your server in two ways: as the signed-in [member](../../vector-space/glossary.md#member), and as the app itself. `POST /api/space/agent` starts a conversation with the space agent as the caller, and `GET /api/space/connectors` lists the connectors of the caller's space as the app.

## Prerequisites

- A GitHub package token in `GITHUB_PACKAGES_TOKEN`, as in [step 0 of the quickstart](../quickstart.md#0-set-up-access-to-the-package-registry). The scaffold command reads it.
- The `leads-app` start, registered, added to a space and run with `npm run dev:space`, as in [Part 2 of the quickstart](../quickstart.md#part-2-add-the-app-to-a-space). Scaffold it into a new folder, `leads-guide`, so it does not clash with the `leads-app` folder of a recipe. Work inside the new folder.

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

- `SPACE_API_URL` in `.env`, set to the Vector Space API origin followed by `/api`, the same shape as `SPACE_JWKS_URL`, as in [step 1 of Part 2 of the quickstart](../quickstart.md#1-point-the-app-at-vector-space). The server calls Vector Space at that origin.
- Background: the [server primitives](../../sdk/reference/root.md), and the [quickstart](../quickstart.md) that registers the app in Vector Space.

## Steps

A call as the member carries the member's token, so Vector Space limits it to what that member may do. A call as the app carries a short-lived [app token](../glossary.md#app-token) that Vector Space issues in exchange for a [service secret](../glossary.md#service-secret). Vector Space limits that call to what the app may do, with no member present.

<!-- flavour node -->
### 1. Add the handlers

This guide uses the `@vectoragents/vs-apps/server` subpath of the [SDK](../../sdk/glossary.md#sdk) on a plain `node:http` server. The [app platform](../../sdk/glossary.md#app-platform) of the starter, `platform` in `server/src/platform.ts`, holds the clients that call Vector Space. Vector Space creates a service secret for each pair of app and space. It pushes the secret to `POST /api/provision`, as in [step 4 of Part 2 of the quickstart](../quickstart.md#4-add-the-app-to-a-space). The platform serves that route and keeps the secret in its credential store.

- `platform.spaceActions` has one method for each Vector Space action. Each method takes a bearer token as its first argument.
- `platform.s2s(appId, spaceId)` exchanges the service secret for an app token. It asks the store for the secret on every exchange and caches only the token.

The starter's `MemoryCredentialStore` loses the secrets on restart. Before production, [implement `AppCredentialStore` over your own storage](../quickstart.md#4-verify-the-token-on-the-server). After a restart, `platform.s2s` [fails until you recover the secret](../quickstart.md#4-verify-the-token-on-the-server).

The agent handler passes the caller's own token to `agentInvoke`. The connectors handler passes an app token to `connectorsList`. Each handler takes the platform, and the verified claims that `requireCapability` returns, as in step 3 of [gate an app page and an endpoint](../recipes/gate-by-capability.md).

```ts title="server/src/space-calls.ts"
import type { IncomingMessage } from 'node:http';
import type { UserTokenClaims } from '@vectoragents/vs-apps';
import { readBearer, readJsonBody, type AppPlatform } from '@vectoragents/vs-apps/server';

export async function startConversation(platform: AppPlatform, req: IncomingMessage, claims: UserTokenClaims) {
  // The route has verified the token, so the header holds it.
  const userToken = readBearer(req.headers) as string;
  const { message } = (await readJsonBody(req)) as { message: string };
  return platform.spaceActions.agentInvoke(userToken, { spaceId: claims.spaceId, message });
}

export async function listConnectors(platform: AppPlatform, claims: UserTokenClaims) {
  const token = await platform.s2s(claims.appId, claims.spaceId);
  return platform.spaceActions.connectorsList(token, { spaceId: claims.spaceId });
}
```

:::warning
An app token carries no member, so Vector Space does not limit `connectorsList` to what the caller may do. Check the capability on the route before you call the handler, as step 2 does.
:::

### 2. Register the routes

In `server/src/main.ts`, import `SpaceActionError` next to `AppAuthError`, and import the two handlers from `./space-calls`.

```ts title="server/src/main.ts" showLineNumbers=3 excerpt
import { PERMISSION } from '@hello-app/shared';
// removed-next-line
import { AppAuthError } from '@vectoragents/vs-apps/server';
// added-next-line
import { AppAuthError, SpaceActionError } from '@vectoragents/vs-apps/server';
import { requirePermission } from './auth';
import { platform } from './platform';
// added-next-line
import { listConnectors, startConversation } from './space-calls';
```

Then add the two routes inside the `try`, before the `platform.fetch` call. The agent route reads the request body, so it must run before `platform.fetch`. Each route verifies the capability first and then calls the handler. A failed call throws `SpaceActionError`, which has a `status` and an optional `code`. The new `catch` line answers with the status that Vector Space sent.

```ts title="server/src/main.ts" showLineNumbers=33 excerpt
  try {
    // added-start
    if (pathname === '/api/space/agent') return send(res, 200, await startConversation(platform, req, await requirePermission(req, 'lead:manage')));
    if (pathname === '/api/space/connectors') return send(res, 200, await listConnectors(platform, await requirePermission(req, 'lead:manage')));
    // added-end
    const handled = await platform.fetch(toFetchRequest(req));
    if (handled) return await sendFetchResponse(res, handled);
    if (pathname !== '/api/hello') return send(res, 404, { error: 'Not found' });
    const claims = await requirePermission(req, PERMISSION);
    send(res, 200, { sub: claims.sub, spaceId: claims.spaceId });
  } catch (error) {
    if (error instanceof AppAuthError) return send(res, error.status, { error: error.message });
    // added-next-line
    if (error instanceof SpaceActionError) return send(res, error.status, { error: error.message });
    send(res, 500, { error: 'Server error' });
  }
```
<!-- /flavour -->
<!-- flavour nest -->
### 1. Add the routes

This guide uses the `@vectoragents/vs-apps/nest` subpath of the [SDK](../../sdk/glossary.md#sdk) on a Nest.js server. `AppPlatformModule` provides three services to every module, so you import nothing to inject them.

- `SpaceActionsService` has one method for each Vector Space action. Each method takes a bearer token as its first argument.
- `AppActionsService` wraps `SpaceActionsService` for a caller. It reads the token and the `spaceId` from the request, so you pass only the request and the input.
- `SpaceS2sService` exchanges the service secret for an app token. Vector Space creates the secret for each pair of app and space and pushes it to the credential store, `MemoryCredentialStore` in `server/src/credential-store.ts`.

The starter's `MemoryCredentialStore` loses the secrets on restart. Before production, [implement `AppCredentialStore` over your own storage](../quickstart.md#4-verify-the-token-on-the-server). After a restart, `getToken` [fails until you recover the secret](../quickstart.md#4-verify-the-token-on-the-server).

The agent route passes the request to `AppActionsService`, which sends the caller's own token. The connectors route sends an app token. `getToken` takes the `appId` and the `spaceId` that `appCaller` reads from the verified claims, as in [open a route and read the caller](./open-route-and-read-caller.md). A failed Vector Space call reaches your caller as an HTTP error with the status that Vector Space sent.

```ts title="server/src/space-calls.controller.ts"
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  AppActionsService,
  RequirePermission,
  SpaceActionsService,
  SpaceS2sService,
  appCaller,
  type AppRequest,
} from '@vectoragents/vs-apps/nest';

@Controller('space')
export class SpaceCallsController {
  constructor(
    private readonly actions: AppActionsService,
    private readonly space: SpaceActionsService,
    private readonly s2s: SpaceS2sService,
  ) {}

  @Post('agent')
  @RequirePermission('lead:manage')
  startConversation(@Req() req: AppRequest, @Body() body: { message: string }) {
    return this.actions.agentInvoke(req, { message: body.message });
  }

  @Get('connectors')
  @RequirePermission('lead:manage')
  async listConnectors(@Req() req: AppRequest) {
    const { claims } = appCaller(req);
    const token = await this.s2s.getToken(claims.appId, claims.spaceId);
    return this.space.connectorsList(token, { spaceId: claims.spaceId });
  }
}
```

:::warning
An app token carries no member, so Vector Space does not limit `connectorsList` to what the caller may do. The `@RequireCapability` check on the route decides who may use it.
:::

### 2. Register the controller

In `server/src/app.module.ts`, import `SpaceCallsController` from `./space-calls.controller`, then add it to the `controllers` array next to `HelloController`.

```ts title="server/src/app.module.ts" showLineNumbers=3 excerpt
import type { AppSigningKeys } from '@vectoragents/vs-apps/server';
import { HelloController } from './hello.controller';
import { manifests } from './manifests';
// added-next-line
import { SpaceCallsController } from './space-calls.controller';

@Module({
```

```ts title="server/src/app.module.ts" showLineNumbers=39 excerpt
    }),
  ],
  // removed-next-line
  controllers: [HelloController],
  // added-next-line
  controllers: [HelloController, SpaceCallsController],
})
export class AppModule {}
```
<!-- /flavour -->

### 3. Check the routes

Restart `npm run dev:space`. In a second terminal, call both routes with no token. `SERVER_PORT` is the value in `.env`.

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:<SERVER_PORT>/api/space/agent
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:<SERVER_PORT>/api/space/connectors
```

Both commands print `401`, because each route refuses a request with no user token before it calls Vector Space.

To call the routes as the signed-in member, add two buttons to the app page. The user token lives in the memory of the page, so `curl` cannot send it. In `client/src/token.ts`, add `callRoute`. It sends the token to a route and returns the status and the body.

```ts title="client/src/token.ts" showLineNumbers=13 excerpt
}
// added-start

export async function callRoute(path: string, init: RequestInit = {}): Promise<string> {
  const headers = new Headers(init.headers);
  headers.set('Authorization', `Bearer ${appToken}`);
  const response = await fetch(path, { method: init.method, body: init.body, headers });
  return `${response.status} ${await response.text()}`;
}
// added-end
```

In `client/src/HelloPage.tsx`, import `callRoute` and hold one result line for each button in state.

```tsx title="client/src/HelloPage.tsx" showLineNumbers=3 excerpt
import { RequirePermission, useApp } from '@vectoragents/vs-apps/react';
// removed-next-line
import { fetchHello } from './token';
// added-next-line
import { callRoute, fetchHello } from './token';
```

```tsx title="client/src/HelloPage.tsx" showLineNumbers=8 excerpt
  const [serverSaw, setServerSaw] = useState<string>('waiting for the server');
  // added-start
  const [connectors, setConnectors] = useState('');
  const [agent, setAgent] = useState('');
  // added-end
```

Then add the buttons after the `Verified on the server` line.

```tsx title="client/src/HelloPage.tsx" showLineNumbers=24 excerpt
        <p>Verified on the server: {serverSaw}</p>
        {/* added-start */}
        <button onClick={() => callRoute('/api/space/connectors').then(setConnectors)}>Call connectors</button>
        <p>{connectors}</p>
        <button
          onClick={() =>
            callRoute('/api/space/agent', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ message: 'Say hello in five words.' }),
            }).then(setAgent)
          }
        >
          Call agent
        </button>
        <p>{agent}</p>
        {/* added-end */}
```

Open the app page in the space as a member who holds `lead:manage`. Select **Call connectors**. Its result line shows `200 []`. The array is empty while the space has no connector. Select **Call agent**. Its result line shows `200 {"threadId":"..."}`, and **Sessions** in the sidebar lists a new session titled `Say hello in five words.`

## Next steps

- [Agent action trees](./agent-action-trees.md): let the space agent call your app in return.
