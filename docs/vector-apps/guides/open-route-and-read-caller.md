---
title: Open a route and read the caller
description: Leave one route of your server open to anyone, and read the verified caller on another route.
---

Leave one route of your server open to anyone, and read who is calling on another route. When you finish, `GET /api/open` answers with no token, and `GET /api/caller` answers with the claims of the caller and refuses a request with no token.

This guide covers a Nest.js server.

<!-- flavour nest -->
## Prerequisites

- The Nest.js app from Part 1 of the [quickstart](../quickstart.md#part-1-run-the-app-locally), running with `npm run dev:space`. Step 1 of [Part 2](../quickstart.md#part-2-add-the-app-to-a-space) sets up the `.env` file that command reads.
- Background: the [server primitives](../../sdk/reference/root.md) that the adapter wraps.

## Steps

### 1. Open a route with `@Public`

This guide uses the `@vectoragents/vs-apps/nest` subpath of the [SDK](../../sdk/glossary.md#sdk). By default, the global guard of the adapter verifies the user token of every route and rejects a request that has none. Put `@Public()` on a route to skip the guard for it.

```ts title="server/src/open-route.controller.ts"
import { Controller, Get } from '@nestjs/common';
import { Public } from '@vectoragents/vs-apps/nest';

@Controller('open')
export class OpenRouteController {
  @Public()
  @Get()
  open() {
    return { status: 'ok' };
  }
}
```

:::warning
A public route runs for every caller. Return nothing that belongs to one [space](../../vector-space/glossary.md#space) or one member.
:::

`@Public()` also works on a controller class. Every route of the class is then open.

### 2. Read the caller with `appCaller`

`CurrentUser`, which the quickstart controller uses, gives a controller the verified claims. `appCaller` gives the claims and the raw token string, and works in any function that receives the request.

`AppRequest` is the request type that `appCaller` takes. It lists only the fields the SDK reads, so you need no HTTP framework types. Inject the request with `@Req()` and type it as `AppRequest`.

```ts title="server/src/caller.controller.ts"
import { Controller, Get, Req } from '@nestjs/common';
import { appCaller, type AppRequest } from '@vectoragents/vs-apps/nest';

@Controller('caller')
export class CallerController {
  @Get()
  caller(@Req() req: AppRequest) {
    const { claims } = appCaller(req);
    return {
      sub: claims.sub,
      appKey: claims.appKey,
      spaceId: claims.spaceId,
      capabilities: claims.capabilities,
    };
  }
}
```

`appCaller` returns `{ userToken, claims, headers }`. `userToken` is the token string the caller sent. `headers` are the headers of the request. `claims` is the verified payload, with `sub` (the member identifier), `appKey`, `spaceId` and `capabilities`.

The guard attaches both values to every route that is not `@Public`. On a `@Public` route the guard attaches nothing, so `appCaller` throws a `401` there. To add a capability check to the caller route, use `RequireCapability`, as the quickstart controller does.

### 3. Register the routes

Put both controllers in one module, so that `server/src/app.module.ts` changes by two lines.

```ts title="server/src/open-route.module.ts"
import { Module } from '@nestjs/common';
import { CallerController } from './caller.controller';
import { OpenRouteController } from './open-route.controller';

@Module({
  controllers: [OpenRouteController, CallerController],
})
export class OpenRouteModule {}
```

In `server/src/app.module.ts`, import `OpenRouteModule`.

```ts title="server/src/app.module.ts" showLineNumbers=3 excerpt
import { MemoryCredentialStore } from './credential-store';
import { HelloController } from './hello.controller';
import { manifests } from './manifests';
// added-next-line
import { OpenRouteModule } from './open-route.module';

@Module({
```

Then add it to the `imports` array, after `AppPlatformModule.forRoot(...)`.

```ts title="server/src/app.module.ts" showLineNumbers=21 excerpt
    }),
    // added-next-line
    OpenRouteModule,
  ],
  controllers: [HelloController],
```

### 4. Check the routes

Restart `npm run dev:space`. In a second terminal, request both routes without a token. `SERVER_PORT` is the value in `.env`.

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:<SERVER_PORT>/api/open
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:<SERVER_PORT>/api/caller
```

The first command prints `200`, because `@Public` skips the guard. The second prints `401`, because the guard refuses a request with no user token.

## Next steps

- [Add the app to a space](../quickstart.md#part-2-add-the-app-to-a-space): send a real user token to `/api/caller` from an app page.
<!-- /flavour -->
<!-- flavour node todo -->
<!-- /flavour -->
