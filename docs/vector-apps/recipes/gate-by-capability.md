---
title: Gate an app page and an endpoint by capability
start: leads-app
---

Hide an [app page](../glossary.md#app-page) from members who lack a [capability](../glossary.md#capability) and refuse the same members on the server. The example gates the `leads` app page of `hello-app` with `lead:manage`.

## Goal

End with one capability enforced twice: `RequireCapability` hides the `leads` app page in the browser, and the server answers `403` to a token without it. One wrapper gives every gated app page the same fallback.

## Prerequisites

- A GitHub package token in `GITHUB_PACKAGES_TOKEN`, as in [step 0 of the quickstart](../quickstart.md#0-set-up-access-to-the-package-registry). The scaffold command reads it.
- The `leads-app` start of the starter. It is `hello-app` with an ungated `leads` app page. Scaffold it and work inside the new folder.

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

- A member who holds the capability and one who does not. A [space admin](../../vector-space/glossary.md#space-admin) [grants](../glossary.md#capability-grant) capabilities in [Vector Space](../../vector-space/glossary.md#vector-space).
- Background: [`RequireCapability` on the client](../../sdk/reference/react.md#react-requirecapability).

## Steps

Each snippet is a complete file. The `leads-app` start already declares the `lead:manage` and `icp:manage` capabilities and the `leads` app page, and this recipe changes what is listed below.

### 1. Gate the app pages in the definition

An app page names its capability in `capability`. `defineApp` does not check that the name exists in `capabilities`, so keep the two keys identical.

In the start the `leads` app page has no `capability`. Add it, and add an `icp` app page gated by `icp:manage`, which step 5 uses as the second app page. Replace the definition in `shared/src/index.ts`.

```ts title="shared/src/index.ts"
import { defineApp } from '@vectoragents/vs-apps';

export const CAPABILITY = 'hello:view';

export const definition = defineApp({
  key: 'hello-app',
  name: 'Hello app',
  version: '0.1.0',
  pages: [
    { key: 'home', label: 'Home', path: '/', capability: CAPABILITY },
    { key: 'leads', label: 'Leads', path: '/leads', capability: 'lead:manage' },
    { key: 'icp', label: 'ICP', path: '/icp', capability: 'icp:manage' },
  ],
  capabilities: [
    { key: CAPABILITY, label: 'View hello', effect: 'read' },
    { key: 'lead:manage', label: 'Manage Leads', effect: 'write' },
    { key: 'icp:manage', label: 'Manage ICP', effect: 'write' },
  ],
});
```

The `CAPABILITY` export stays, because the `/api/hello` route and `HelloPage.tsx` use it.

<!-- flavour react -->
### 2. Gate the app page in the browser

`RequireCapability` renders its children only when the token holds the capability. A function `fallback` receives the missing capability name. Replace `client/src/LeadsPage.tsx`.

```tsx title="client/src/LeadsPage.tsx"
import { RequireCapability } from '@vectoragents/vs-apps/react';

export function LeadsPage() {
  return (
    <RequireCapability
      capability="lead:manage"
      fallback={(capability) => <p>Ask a space admin to grant {capability}.</p>}
    >
      <main>
        <h1>Leads</h1>
        <p>No leads yet.</p>
      </main>
    </RequireCapability>
  );
}
```

This check shapes the UI only. A member can still call the endpoint directly.
<!-- /flavour -->

### 3. Enforce the capability on the server

<!-- flavour node -->
`requireCapability` in `server/src/auth.ts` verifies the user token. It throws `AppAuthError` with status `403` when the claims lack the named capability. Add the leads handler in a new file. It receives the verified claims.

```ts title="server/src/leads.ts"
import type { UserTokenClaims } from '@vectoragents/vs-apps';

export function listLeads(claims: UserTokenClaims) {
  return { spaceId: claims.spaceId, leads: [] };
}
```

In `server/src/main.ts`, import `listLeads`. Inside the `try`, after the `platform.fetch` check and before the check for `/api/hello`, add this line: `if (pathname === '/api/leads') return send(res, 200, listLeads(await requireCapability(req, 'lead:manage')));`. The existing `catch` block turns the `403` into the response.
<!-- /flavour -->
<!-- flavour nest -->
The `RequireCapability` decorator refuses a token that lacks the capability, and the global guard of `AppPlatformModule` answers `403`. `CurrentUser` hands the controller the verified claims. Add the leads handler in a new controller.

```ts title="server/src/leads.controller.ts"
import { Controller, Get } from '@nestjs/common';
import { CurrentUser, RequireCapability } from '@vectoragents/vs-apps/nest';
import type { UserTokenClaims } from '@vectoragents/vs-apps';

@Controller('leads')
export class LeadsController {
  @Get()
  @RequireCapability('lead:manage')
  list(@CurrentUser() user: UserTokenClaims) {
    return { spaceId: user.spaceId, leads: [] };
  }
}
```

In `server/src/app.module.ts`, import `LeadsController` from `./leads.controller`. Add it to the `controllers` array, next to `HelloController`.

```text
controllers: [HelloController, LeadsController],
```
<!-- /flavour -->

### 4. Check both gates

Run `npm run dev` and open `http://localhost:5173/harness.html`. Choose the Leads app page in the sidebar.

In the dev panel, remove `lead:manage` from the capability set. The app page shows the fallback text. Add `lead:manage` back, and the app page shows the heading.

For the server, mint a development token without `lead:manage` through the [harness token route](../../sdk/reference/harness.md). Call `GET /api/leads` with it. The server answers `403` with `Missing capability: lead:manage`. A token that holds the capability gets `200`.

<!-- flavour react -->
### 5. Share one fallback across app pages

Each app page that repeats `fallback` can drift from the others. Wrap `RequireCapability` once, and every gated app page shows the same message.

```tsx title="client/src/GatedPage.tsx"
import type { ReactNode } from 'react';
import { RequireCapability } from '@vectoragents/vs-apps/react';

export function GatedPage({ capability, children }: { capability: string; children: ReactNode }) {
  return (
    <RequireCapability
      capability={capability}
      fallback={(missing) => <p>Ask a space admin to grant {missing}.</p>}
    >
      {children}
    </RequireCapability>
  );
}
```

In `client/src/LeadsPage.tsx`, replace the `RequireCapability` element with `<GatedPage capability="lead:manage">` and drop the import. Keep the `main` element inside it. The `icp` app page uses the same wrapper with its own capability.

```tsx title="client/src/IcpPage.tsx"
import { GatedPage } from './GatedPage';

export function IcpPage() {
  return (
    <GatedPage capability="icp:manage">
      <main>
        <h1>ICP</h1>
      </main>
    </GatedPage>
  );
}
```

In `client/src/App.tsx`, render `<IcpPage />` when `window.location.pathname` is `/icp`, the way the file does for `/leads`. Both app pages now show one fallback. To change the message, edit `GatedPage.tsx`.
<!-- /flavour -->

## Result

The `leads` and `icp` app pages render only for members with `lead:manage` and `icp:manage`. `GET /api/leads` refuses every other token. Both app pages share one fallback in `GatedPage`.

## Next step

Read the user and capabilities in other components with [read the app context](./read-app-context.md).
