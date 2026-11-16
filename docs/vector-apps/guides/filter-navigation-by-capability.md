---
title: Filter navigation by capability
description: Build an app navigation from the app definition and show only the app pages that the signed-in member may open.
start: leads-app
---

<!-- flavour react -->
Build your own navigation from the app definition, and show only the [app pages](../glossary.md#app-page) that a [member](../../vector-space/glossary.md#member) may open. When you finish, the navigation lists Home for every member, and lists `leads` and `icp` only for members who hold their [capabilities](../glossary.md#capability).

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

`defaultPageKey` must name a declared app page. An app page without `capability` is ungated. Leave `home` ungated, gate `leads` and `icp`, and mark the changes in `shared/src/index.ts`.

`CAPABILITY` stays an export, because the starter server and `HelloPage.tsx` use it. It now holds `lead:manage`.

```ts title="shared/src/index.ts"
import { defineApp } from '@vectoragents/vs-apps';

// removed-next-line
export const CAPABILITY = 'hello:view';
// added-next-line
export const CAPABILITY = 'lead:manage';

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
      // removed-next-line
      capability: CAPABILITY,
    },
    {
      key: 'leads',
      label: 'Leads',
      path: '/leads',
      // added-next-line
      capability: CAPABILITY,
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
    // removed-start
    { key: CAPABILITY, label: 'View hello', effect: 'read' },
    { key: 'lead:manage', label: 'Manage Leads', effect: 'write' },
    // removed-end
    // added-next-line
    { key: CAPABILITY, label: 'Manage Leads', effect: 'write' },
    { key: 'icp:manage', label: 'Manage ICP', effect: 'write' },
  ],
});
```

### 2. Filter the app pages

`appPages` returns the app pages of the definition whose `key` equals the `appKey` claim. It does not filter by capability, so filter with `hasCapability`.

```tsx title="client/src/AppNav.tsx"
import { appPages } from '@vectoragents/vs-apps';
import { useApp } from '@vectoragents/vs-apps/react';
import { definition } from '../../shared/src/index';

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
The list shapes the UI only. A member can still call your server, so enforce each capability there, as in [gate an app page and an endpoint](../recipes/gate-by-capability.md).
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
