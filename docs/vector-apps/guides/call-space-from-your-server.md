---
title: Call Vector Space from your server
description: Call Vector Space from your server as the signed-in member and as the app, with one route for each.
start: leads-app
---

Call [Vector Space](../../vector-space/glossary.md#vector-space) from your server in two ways: as the signed-in [member](../../vector-space/glossary.md#member), and as the app itself. When you finish, `POST /api/space/agent` starts a conversation with the space agent as the caller, and `GET /api/space/connectors` lists the connectors of the caller's space as the app.

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

- Background: the [server primitives](../../sdk/reference/root.md), and the [quickstart](../quickstart.md) that registers the app in Vector Space.

## Steps

### 1. Point the server at Vector Space

The server calls Vector Space at its origin. The `SPACE_API_URL` value is that origin plus `/api`, the same shape as `SPACE_JWKS_URL`. Skip this step if `.env` already has it.

```bash
echo 'SPACE_API_URL=YOUR_SPACE_API_URL' >> .env
```

### 2. Learn how the server calls Vector Space

A call as the member carries the member's token, so Vector Space limits it to what that member may do. A call as the app carries a short-lived [app token](../glossary.md#app-token) that Vector Space issues in exchange for a [service secret](../glossary.md#service-secret). Vector Space limits that call to what the app may do, with no member present.

<!-- flavour node -->
This guide uses the `@vectoragents/vs-apps/server` subpath of the [SDK](../../sdk/glossary.md#sdk) on a plain `node:http` server. The [app platform](../../sdk/glossary.md#app-platform) of the starter, `platform` in `server/src/platform.ts`, holds the clients that call Vector Space. Vector Space creates a service secret for each pair of app and space. It pushes the secret to `POST /api/provision`, as in [step 4 of Part 2 of the quickstart](../quickstart.md#4-add-the-app-to-a-space). The platform serves that route and keeps the secret in its credential store.

- `platform.spaceActions` has one method for each Vector Space action. Each method takes a bearer token as its first argument.
- `platform.s2s(appId, spaceId)` exchanges the service secret for an app token. It asks the store for the secret on every exchange and caches only the token.

The store of the starter keeps the secrets in memory and loses them on restart. `AppCredentialStore` is the one interface you implement over your own storage, so plan a persistent store before production. After a restart, `platform.s2s` fails until the secret of the [binding](../glossary.md#binding) is rotated in Vector Space, which pushes it again.

### 3. Add the handlers

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
An app token carries no member, so Vector Space does not limit `connectorsList` to what the caller may do. Check the capability on the route before you call the handler, as step 4 does.
:::

### 4. Register the routes

In `server/src/main.ts`, import `SpaceActionError` next to `AppAuthError`, and import the two handlers from `./space-calls`.

```ts title="server/src/main.ts" showLineNumbers=3 excerpt
import { CAPABILITY } from '@hello-app/shared';
// removed-next-line
import { AppAuthError } from '@vectoragents/vs-apps/server';
// added-next-line
import { AppAuthError, SpaceActionError } from '@vectoragents/vs-apps/server';
import { requireCapability } from './auth';
import { platform } from './platform';
// added-next-line
import { listConnectors, startConversation } from './space-calls';
```

Then add the two routes inside the `try`, after the `platform.fetch` check and before the `/api/hello` check. Each route verifies the capability first and then calls the handler. A failed call throws `SpaceActionError`, which has a `status` and an optional `code`. The new `catch` line answers with the status that Vector Space sent.

```ts title="server/src/main.ts" showLineNumbers=33 excerpt
  try {
    const handled = await platform.fetch(toFetchRequest(req));
    if (handled) return await sendFetchResponse(res, handled);
    // added-start
    if (pathname === '/api/space/agent') return send(res, 200, await startConversation(platform, req, await requireCapability(req, 'lead:manage')));
    if (pathname === '/api/space/connectors') return send(res, 200, await listConnectors(platform, await requireCapability(req, 'lead:manage')));
    // added-end
    if (pathname !== '/api/hello') return send(res, 404, { error: 'Not found' });
    const claims = await requireCapability(req, CAPABILITY);
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
This guide uses the `@vectoragents/vs-apps/nest` subpath of the [SDK](../../sdk/glossary.md#sdk) on a Nest.js server. `AppPlatformModule` provides three services to every module, so you import nothing to inject them.

- `SpaceActionsService` has one method for each Vector Space action. Each method takes a bearer token as its first argument.
- `AppActionsService` wraps `SpaceActionsService` for a caller. It reads the token and the `spaceId` from the request, so you pass only the request and the input.
- `SpaceS2sService` exchanges the service secret for an app token. Vector Space creates the secret for each pair of app and space and pushes it to the credential store, `MemoryCredentialStore` in `server/src/credential-store.ts`.

The store keeps the secrets in memory and loses them on restart. `AppCredentialStore` is the one interface you implement over your own storage, so plan a persistent store before production. After a restart, `getToken` fails until the secret of the [binding](../glossary.md#binding) is rotated in Vector Space, which pushes it again.

### 3. Add the routes

The agent route passes the request to `AppActionsService`, which sends the caller's own token. The connectors route sends an app token. `getToken` takes the `appId` and the `spaceId` that `appCaller` reads from the verified claims, as in [open a route and read the caller](./open-route-and-read-caller.md). A failed Vector Space call reaches your caller as an HTTP error with the status that Vector Space sent.

```ts title="server/src/space-calls.controller.ts"
import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  AppActionsService,
  RequireCapability,
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
  @RequireCapability('lead:manage')
  startConversation(@Req() req: AppRequest, @Body() body: { message: string }) {
    return this.actions.agentInvoke(req, { message: body.message });
  }

  @Get('connectors')
  @RequireCapability('lead:manage')
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

### 4. Register the controller

In `server/src/app.module.ts`, import `SpaceCallsController` from `./space-calls.controller`, then add it to the `controllers` array next to `HelloController`.

```ts title="server/src/app.module.ts" showLineNumbers=3 excerpt
import { MemoryCredentialStore } from './credential-store';
import { HelloController } from './hello.controller';
import { manifests } from './manifests';
// added-next-line
import { SpaceCallsController } from './space-calls.controller';

@Module({
```

```ts title="server/src/app.module.ts" showLineNumbers=21 excerpt
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

### 5. Check the routes

Restart `npm run dev:space`. In a second terminal, call both routes with no token. `SERVER_PORT` is the value in `.env`.

```bash
curl -s -o /dev/null -w '%{http_code}\n' -X POST http://localhost:<SERVER_PORT>/api/space/agent
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:<SERVER_PORT>/api/space/connectors
```

Both commands print `401`, because each route refuses a request with no user token before it calls Vector Space.

## Next steps

- [Agent action trees](./agent-action-trees.md): let the space agent call your app in return.
