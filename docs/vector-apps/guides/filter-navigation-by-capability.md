---
title: Filter navigation by capability
description: Build an app navigation from the app definition and show only the app pages that the signed-in member may open.
start: leads-app
---

<!-- flavour react -->
Build your own navigation from the app definition. It lists each [app page](../glossary.md#app-page) only for a [member](../../vector-space/glossary.md#member) who holds its [capability](../glossary.md#capability).

## Prerequisites

- A GitHub package token in `GITHUB_PACKAGES_TOKEN`, as in [step 0 of the quickstart](../quickstart.md#0-set-up-access-to-the-package-registry). The scaffold command reads it.
- The `leads-app` start. Scaffold it into a new folder, `leads-guide`, so it does not clash with the `leads-app` folder of a recipe. Work inside the new folder. For a Nest.js server, use `--server nest`.

```bash
npm create @vectoragents/app leads-guide -- --client react --server node --start leads-app
cd leads-guide
```

- Background: [`appPages`](../../sdk/reference/root.md#apppages) and the [quickstart](../quickstart.md).

## Steps

### 1. Declare a default app page and gate each app page

`defaultPageKey` must name a declared app page. An app page without `capability` is ungated. Keep `CAPABILITY` and the gate on `home` as the starter has them. In `shared/src/index.ts`, gate `leads` with `lead:manage`, add `icp` with `icp:manage`, and add `defaultPageKey`.

```ts title="shared/src/index.ts"
import { defineApp } from '@vectoragents/vs-apps';

export const CAPABILITY = 'hello:view';

export const definition = defineApp({
  key: 'hello-app',
  name: 'Hello app',
  version: '0.1.0',
  // added-next-line
  defaultPageKey: 'home',
  pages: [
    {
      key: 'home',
      label: 'Home',
      path: '/',
      capability: CAPABILITY,
    },
    {
      key: 'leads',
      label: 'Leads',
      path: '/leads',
      // added-next-line
      capability: 'lead:manage',
    },
    // added-start
    {
      key: 'icp',
      label: 'ICP',
      path: '/icp',
      capability: 'icp:manage',
    },
    // added-end
  ],
  capabilities: [
    { key: CAPABILITY, label: 'View hello', effect: 'read' },
    { key: 'lead:manage', label: 'Manage Leads', effect: 'write' },
    { key: 'icp:manage', label: 'Manage ICP', effect: 'write' },
  ],
});
```

### 2. Filter the app pages

`appPages` returns the app pages of the definition whose `key` equals the `appKey` claim. It does not filter by capability, so filter with `hasCapability`. The links are plain `<a>` elements, so each click reloads the document. For a router, see [step 3 of add an app page and a capability](../recipes/add-page-and-capability.md#react-3-link-between-app-pages-without-a-reload).

```tsx title="client/src/AppNav.tsx"
import { appPages } from '@vectoragents/vs-apps';
import { useApp } from '@vectoragents/vs-apps/react';
import { definition } from '@hello-app/shared';

export function AppNav() {
  const { claims, hasCapability } = useApp();
  const pages = appPages([definition], claims?.appKey).filter(
    (page) => !page.capability || hasCapability(page.capability),
  );

  return (
    <nav>
      {pages.map((page) => (
        <a key={page.key} href={page.path}>
          {page.label}
        </a>
      ))}
    </nav>
  );
}
```

:::warning
A member can still call your server, so enforce each capability there, as in [gate an app page and an endpoint](../recipes/gate-by-capability.md).
:::

### 3. Mount the navigation under the gate

`claims` is `null` until the handshake completes, so mount `AppNav` under `BootGate`. In `client/src/App.tsx`, import `AppNav`.

```tsx title="client/src/App.tsx" showLineNumbers=1 excerpt
import { loadAppClientConfig } from '@vectoragents/vs-apps/browser';
import { AppProvider, BootGate } from '@vectoragents/vs-apps/react';
// added-next-line
import { AppNav } from './AppNav';
import { HelloPage } from './HelloPage';
import { LeadsPage } from './LeadsPage';
```

Then render it as the first child of `BootGate`.

```tsx title="client/src/App.tsx" showLineNumbers=19 excerpt
    >
      <BootGate fallback={<p>Waiting for Space.</p>}>
        {/* added-next-line */}
        <AppNav />
        {window.location.pathname === '/leads' ? <LeadsPage /> : <HelloPage />}
      </BootGate>
    </AppProvider>
  );
```

### 4. Check the navigation

Run `npm run dev` and open `http://localhost:5173/harness.html`. The navigation shows the links `Home`, `Leads` and `ICP`. In the dev panel, remove `icp:manage` from the capability set. The `ICP` link disappears.

## Next steps

- [Gate an app page and an endpoint by capability](../recipes/gate-by-capability.md): enforce each capability on the server.
<!-- /flavour -->
