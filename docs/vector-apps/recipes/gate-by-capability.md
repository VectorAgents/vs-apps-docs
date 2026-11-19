---
title: Gate an app page and an endpoint by capability
description: Gate an app page in the browser and an endpoint on the server by capability, and share one fallback across app pages.
start: leads-app
---

Gate the `leads` [app page](../glossary.md#app-page) in the browser and `GET /api/leads` on the server with the `lead:manage` [capability](../glossary.md#capability). A [member](../../vector-space/glossary.md#member) without the capability sees a fallback message, and the server answers `403` to a token without it.

## Prerequisites

- A GitHub package token in `GITHUB_PACKAGES_TOKEN`, as in [step 0 of the quickstart](../quickstart.md#0-set-up-access-to-the-package-registry). The scaffold command reads it.
- The `leads-app` start. Scaffold it and work inside the new folder.

<!-- flavour node -->
```bash
npm create @vectoragents/app leads-app -- --client react --server node --start leads-app
cd leads-app
```
<!-- /flavour -->
<!-- flavour nest -->
```bash
npm create @vectoragents/app leads-app -- --client react --server nest --start leads-app
cd leads-app
```
<!-- /flavour -->

- Background: [`RequireCapability` on the client](../../sdk/reference/react.md#react-requirecapability).

## Steps

### 1. Gate the `leads` app page in the definition

An app page names its capability in `capability`. `defineApp` does not check that the name exists in `capabilities`, so keep the two keys identical.

The `leads` app page in the start has no `capability`. Add it.

```ts title="shared/src/index.ts" showLineNumbers=16 excerpt
    {
      key: 'leads',
      label: 'Leads',
      path: '/leads',
      // added-next-line
      permission: 'lead:manage',
    },
```

<!-- flavour react -->
### 2. Gate the app page in the browser

`RequireCapability` renders its children only when the token holds the capability. A function `fallback` receives the missing capability name.

```tsx title="client/src/LeadsPage.tsx"
// added-next-line
import { RequirePermission } from '@vectoragents/vs-apps/react';

export function LeadsPage() {
  return (
    // added-start
    <RequirePermission
      permission="lead:manage"
      fallback={(permission) => <p>Ask a space admin to grant {permission}.</p>}
    >
      {/* added-end */}
      {/* removed-start */}
    <main>
      <h1>Leads</h1>
      <p>No leads yet.</p>
    </main>
      {/* removed-end */}
      {/* added-start */}
      <main>
        <h1>Leads</h1>
        <p>No leads yet.</p>
      </main>
    </RequirePermission>
    // added-end
  );
}
```

:::warning
A member can still call the endpoint directly, so step 3 enforces the capability on the server.
:::
<!-- /flavour -->

### 3. Enforce the capability on the server

<!-- flavour node -->
`requireCapability` in `server/src/auth.ts` verifies the token. It throws `AppAuthError` with status `403` when the claims lack the named capability. Add the leads handler in a new file. It receives the verified claims.

```ts title="server/src/leads.ts"
import type { UserTokenClaims } from '@vectoragents/vs-apps';

export function listLeads(claims: UserTokenClaims) {
  return { spaceId: claims.spaceId, leads: [] };
}
```

In `server/src/main.ts`, import `listLeads`.

```ts title="server/src/main.ts" showLineNumbers=3 excerpt
import { PERMISSION } from '@hello-app/shared';
import { AppAuthError } from '@vectoragents/vs-apps/server';
import { requirePermission } from './auth';
// added-next-line
import { listLeads } from './leads';
import { platform } from './platform';
```

Then add the route inside the `try`, after the `platform.fetch` check and before the `/api/hello` check. The existing `catch` block turns the `403` into the response.

```ts title="server/src/main.ts" showLineNumbers=33 excerpt
  try {
    const handled = await platform.fetch(toFetchRequest(req));
    if (handled) return await sendFetchResponse(res, handled);
    // added-next-line
    if (pathname === '/api/leads') return send(res, 200, listLeads(await requirePermission(req, 'lead:manage')));
    if (pathname !== '/api/hello') return send(res, 404, { error: 'Not found' });
    const claims = await requirePermission(req, PERMISSION);
    send(res, 200, { sub: claims.sub, spaceId: claims.spaceId });
```
<!-- /flavour -->
<!-- flavour nest -->
The `RequireCapability` decorator refuses a token that lacks the capability, and the global guard of `AppPlatformModule` answers `403`. `CurrentUser` hands the controller the verified claims. Add the leads handler in a new controller.

```ts title="server/src/leads.controller.ts"
import { Controller, Get } from '@nestjs/common';
import { CurrentUser, RequirePermission } from '@vectoragents/vs-apps/nest';
import type { UserTokenClaims } from '@vectoragents/vs-apps';

@Controller('leads')
export class LeadsController {
  @Get()
  @RequirePermission('lead:manage')
  list(@CurrentUser() user: UserTokenClaims) {
    return { spaceId: user.spaceId, leads: [] };
  }
}
```

Register `LeadsController` in the `controllers` array of `AppModule`, in `server/src/app.module.ts`. First import it.

```ts title="server/src/app.module.ts" showLineNumbers=3 excerpt
import type { AppSigningKeys } from '@vectoragents/vs-apps/server';
import { HelloController } from './hello.controller';
// added-next-line
import { LeadsController } from './leads.controller';
import { manifests } from './manifests';
```

Then add it next to `HelloController`.

```ts title="server/src/app.module.ts" showLineNumbers=39 excerpt
    }),
  ],
  // removed-next-line
  controllers: [HelloController],
  // added-next-line
  controllers: [HelloController, LeadsController],
})
export class AppModule {}
```
<!-- /flavour -->

<!-- flavour react -->
### 4. Share one fallback across app pages

Each app page that repeats `fallback` can drift from the others. Wrap `RequireCapability` once, and every gated app page shows the same message.

```tsx title="client/src/GatedPage.tsx"
import type { ReactNode } from 'react';
import { RequirePermission } from '@vectoragents/vs-apps/react';

export function GatedPage({ permission, children }: { permission: string; children: ReactNode }) {
  return (
    <RequirePermission
      permission={permission}
      fallback={(missing) => <p>Ask a space admin to grant {missing}.</p>}
    >
      {children}
    </RequirePermission>
  );
}
```

In `client/src/LeadsPage.tsx`, replace the `RequireCapability` element with `GatedPage` and drop the import. Keep the `main` element inside it.

```tsx title="client/src/LeadsPage.tsx" showLineNumbers=1 excerpt
// removed-next-line
import { RequirePermission } from '@vectoragents/vs-apps/react';
// added-next-line
import { GatedPage } from './GatedPage';

export function LeadsPage() {
  return (
    // removed-start
    <RequirePermission
      permission="lead:manage"
      fallback={(permission) => <p>Ask a space admin to grant {permission}.</p>}
    >
      {/* removed-end */}
    // added-next-line
    <GatedPage permission="lead:manage">
      <main>
        <h1>Leads</h1>
        <p>No leads yet.</p>
      </main>
      {/* removed-next-line */}
    </RequirePermission>
      {/* added-next-line */}
    </GatedPage>
  );
}
```

The `icp` app page uses the same wrapper with its own capability. Add its entry to `pages` in `shared/src/index.ts`, after `leads`.

```ts title="shared/src/index.ts" showLineNumbers=21 excerpt
    },
    // added-start
    {
      key: 'icp',
      label: 'ICP',
      path: '/icp',
      permission: 'icp:manage',
    },
    // added-end
  ],
```

Then add the page itself.

```tsx title="client/src/IcpPage.tsx"
import { GatedPage } from './GatedPage';

export function IcpPage() {
  return (
    <GatedPage permission="icp:manage">
      <main>
        <h1>ICP</h1>
      </main>
    </GatedPage>
  );
}
```

In `client/src/App.tsx`, render `IcpPage` when `window.location.pathname` is `/icp`, the way the file does for `/leads`. First import it.

```tsx title="client/src/App.tsx" showLineNumbers=2 excerpt
import { AppProvider, BootGate } from '@vectoragents/vs-apps/react';
import { HelloPage } from './HelloPage';
// added-next-line
import { IcpPage } from './IcpPage';
import { LeadsPage } from './LeadsPage';
import { setAppToken } from './token';
```

Then branch on the path.

```tsx title="client/src/App.tsx" showLineNumbers=19 excerpt
    >
      <BootGate fallback={<p>Waiting for Space.</p>}>
        {/* removed-next-line */}
        {window.location.pathname === '/leads' ? <LeadsPage /> : <HelloPage />}
        {/* added-start */}
        {window.location.pathname === '/leads' ? (
          <LeadsPage />
        ) : window.location.pathname === '/icp' ? (
          <IcpPage />
        ) : (
          <HelloPage />
        )}
        {/* added-end */}
      </BootGate>
    </AppProvider>
  );
```

To change the message of both app pages, edit `GatedPage.tsx`.
<!-- /flavour -->

### 5. Check both gates

Run `npm run dev` and open `http://localhost:5173/harness.html`. Select **Leads** in the sidebar. In the dev panel, remove `lead:manage` from the capability set. The app page shows `Ask a space admin to grant lead:manage.` Add `lead:manage` back, and the app page shows the heading `Leads`.

For the server, call the route with no token.

```bash
curl -s -o /dev/null -w '%{http_code}\n' http://localhost:3101/api/leads
```

The command prints `401`. Then mint a development token without `lead:manage` through the [harness token route](../../sdk/reference/harness.md#post-api__devtoken) and send it as a bearer token. The server answers `403` with the body `{"error":"Missing capability: lead:manage"}`. A token that holds the capability gets `200`.

## Next steps

- [Read the app context](./read-app-context.md): read the member and the capabilities in other components.
