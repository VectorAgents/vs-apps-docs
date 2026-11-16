---
title: Add an app page and a capability
description: Add a leads and an icp app page, gate each by a capability, link them without a reload and open them in a space.
---

<!-- flavour react -->
Add two [app pages](../glossary.md#app-page), `leads` and `icp`, gate each with a [capability](../glossary.md#capability) and link them without a page reload. When you finish, a [space](../../vector-space/glossary.md#space) lists both app pages to the [members](../../vector-space/glossary.md#member) who hold the capabilities.

## Prerequisites

- The app from the [quickstart](../quickstart.md), registered in a space and run with `npm run dev:space`.
- `SPACE_API_URL` in `.env`, set to the [Vector Space](../../vector-space/glossary.md#vector-space) API origin followed by `/api`, for example `https://space-api.example.com/api`. Step 4 uses it.
- Background: the [app definition](../../sdk/app-definition.md) page, the [`RequireCapability` reference](../../sdk/reference/react.md#react-requirecapability).

## Steps

### 1. Extend the definition

The `icp` app page holds the ideal customer profile (ICP) library. This step adds the `leads` and `icp` app pages and their capabilities to `shared/src/index.ts`, and moves the app pages into one exported array. Step 3 reads the same array for the path type.

An app page `capability` must match a capability `key` exactly, because `defineApp` does not check it. A capability key has the form `<group>:<action>`, and an app page `path` starts with `/`. `as const satisfies` keeps each path as a literal type, and TypeScript still checks each entry as an `AppPageDef`. `slice()` copies the read-only array into the mutable one that `defineApp` takes.

```ts title="shared/src/index.ts"
// removed-next-line
import { defineApp } from '@vectoragents/vs-apps';
// added-next-line
import { defineApp, type AppPageDef } from '@vectoragents/vs-apps';

export const CAPABILITY = 'hello:view';

// added-start
export const pages = [
  { key: 'home', label: 'Home', path: '/', capability: CAPABILITY },
  { key: 'leads', label: 'Leads', path: '/leads', capability: 'lead:manage' },
  { key: 'icp', label: 'ICP Library', path: '/icp', capability: 'icp:manage' },
] as const satisfies readonly AppPageDef[];

export type PagePath = (typeof pages)[number]['path'];
// added-end

export const definition = defineApp({
  key: 'hello-app',
  name: 'Hello app',
  // removed-next-line
  version: '0.1.0',
  // added-next-line
  version: '0.2.0',
  // removed-start
  pages: [
    {
      key: 'home',
      label: 'Home',
      path: '/',
      capability: CAPABILITY,
    },
  ],
  capabilities: [{ key: CAPABILITY, label: 'View hello', effect: 'read' }],
  // removed-end
  // added-start
  pages: pages.slice(),
  capabilities: [
    { key: CAPABILITY, label: 'View hello', effect: 'read' },
    { key: 'lead:manage', label: 'Manage Leads', effect: 'write' },
    { key: 'icp:manage', label: 'Manage ICPs', effect: 'write' },
  ],
  // added-end
});
```

### 2. Write the app pages

Gate each app page with the same capability as its definition entry, so the browser matches the definition.

```tsx title="client/src/LeadsPage.tsx"
import { RequireCapability } from '@vectoragents/vs-apps/react';

export function LeadsPage() {
  return (
    <RequireCapability capability="lead:manage" fallback={<p>You do not hold lead:manage.</p>}>
      <main>
        <h1>Leads</h1>
        <p>No leads yet.</p>
      </main>
    </RequireCapability>
  );
}
```

```tsx title="client/src/IcpPage.tsx"
import { RequireCapability } from '@vectoragents/vs-apps/react';

export function IcpPage() {
  return (
    <RequireCapability capability="icp:manage" fallback={<p>You do not hold icp:manage.</p>}>
      <main>
        <h1>ICP Library</h1>
      </main>
    </RequireCapability>
  );
}
```

The server enforces both capabilities on the endpoints that the app pages call. [Gate an app page and an endpoint by capability](./gate-by-capability.md) shows how.

### 3. Link between app pages without a reload

A member picks an app page in the navigation of the space, and Vector Space asks the app to open its path. `AppProvider` then calls its `navigate` prop. The `navigate` prop of the starter calls `history.replaceState`. It changes the address and leaves the screen as it is, because the starter has no router.

A plain `<a href>` inside the app loads the document again, and the iframe repeats the token handshake with Vector Space. Add a small router instead. `navigate` pushes the path and tells the subscribers, and `usePath` re-renders on each change and on the back button. A router library works the same way: pass its navigate function as the `navigate` prop.

```ts title="client/src/router.ts"
import { useSyncExternalStore } from 'react';

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  window.addEventListener('popstate', listener);
  return () => {
    listeners.delete(listener);
    window.removeEventListener('popstate', listener);
  };
}

export function navigate(path: string): void {
  window.history.pushState(null, '', path);
  for (const listener of listeners) listener();
}

export function usePath(): string {
  return useSyncExternalStore(subscribe, () => window.location.pathname);
}
```

`appPages` returns the app pages of the definition, and the filter keeps the app pages the member may open, as in [filter navigation by capability](../guides/filter-navigation-by-capability.md). The link calls `navigate` and cancels the default load.

```tsx title="client/src/Nav.tsx"
import { definition } from '@hello-app/shared';
import { appPages } from '@vectoragents/vs-apps';
import { useApp } from '@vectoragents/vs-apps/react';
import { navigate } from './router';

export function Nav() {
  const { claims, hasCapability } = useApp();
  const pages = appPages([definition], claims?.appKey).filter(
    (page) => !page.capability || hasCapability(page.capability),
  );

  return (
    <nav>
      {pages.map((page) => (
        <a
          key={page.key}
          href={page.path}
          onClick={(event) => {
            event.preventDefault();
            navigate(page.path);
          }}
        >
          {page.label}
        </a>
      ))}
    </nav>
  );
}
```

`routes` is typed with `PagePath`, so an app page added to `pages` without a component fails to compile. The `home` prop takes the `HelloPage` of the starter.

```tsx title="client/src/CurrentPage.tsx"
import type { PagePath } from '@hello-app/shared';
import type { ReactElement } from 'react';
import { IcpPage } from './IcpPage';
import { LeadsPage } from './LeadsPage';
import { usePath } from './router';

export function CurrentPage({ home }: { home: ReactElement }) {
  const routes: Record<PagePath, ReactElement> = {
    '/': home,
    '/leads': <LeadsPage />,
    '/icp': <IcpPage />,
  };
  const path = usePath();
  return path in routes ? routes[path as PagePath] : <p>Page not found.</p>;
}
```

In `client/src/App.tsx`, import `CurrentPage`, `Nav` and `navigate`.

```tsx title="client/src/App.tsx" showLineNumbers=1 excerpt
import { loadAppClientConfig } from '@vectoragents/vs-apps/browser';
import { AppProvider, BootGate } from '@vectoragents/vs-apps/react';
// added-next-line
import { CurrentPage } from './CurrentPage';
import { HelloPage } from './HelloPage';
// added-start
import { Nav } from './Nav';
import { navigate } from './router';
// added-end
import { setAppToken } from './token';
```

Then pass `navigate` to `AppProvider`, and render `Nav` and `CurrentPage` in place of `HelloPage`.

```tsx title="client/src/App.tsx" showLineNumbers=13 excerpt
    <AppProvider
      config={config}
      // removed-next-line
      navigate={(path) => window.history.replaceState(null, '', path)}
      // added-next-line
      navigate={navigate}
      onToken={setAppToken}
      onTheme={(theme) => {
        document.documentElement.dataset.theme = theme;
      }}
    >
      <BootGate fallback={<p>Waiting for Space.</p>}>
        {/* removed-next-line */}
        <HelloPage />
        {/* added-start */}
        <Nav />
        <CurrentPage home={<HelloPage />} />
        {/* added-end */}
      </BootGate>
    </AppProvider>
  );
```

Run `npm run dev` and open `http://localhost:5173/harness.html`. Select **Leads**, then **ICP Library**. The app page changes, and the Network panel of your browser developer tools shows no new document request. The harness dev panel opens an app page through the same `navigate` prop.

### 4. Let Vector Space read the manifest

The server must tell Vector Space that the manifest changed. Stop `npm run dev:space` and start it again. The starter calls `platform.pingManifests` at start, and Vector Space reads the new manifest. `npm run dev` clears `SPACE_API_URL` and turns the dev issuer on, and the platform skips the ping while it holds a dev issuer, so the harness never tells Vector Space.

A manifest change waits as a pending review until Vector applies it. If Vector Space shows no change after the restart, ask Vector to select **Check for updates** on your [app registration](../glossary.md#app-registration). Vector Space then reads the manifest again.

### 5. Grant the capabilities

A [space admin](../../vector-space/glossary.md#space-admin) grants `lead:manage` and `icp:manage` to a member in Vector Space.

### 6. Check the app pages in the space

Refresh the browser page as that member. The navigation of the app lists **Home**, **Leads** and **ICP Library**. Select **Leads**: the app page shows the heading `Leads` and the text `No leads yet.` Select **ICP Library**: the app page shows the heading `ICP Library`.

## Next steps

- [Gate an app page and an endpoint by capability](./gate-by-capability.md): enforce the same capabilities on the server and share one fallback across app pages.
<!-- /flavour -->
