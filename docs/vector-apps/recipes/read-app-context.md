---
title: Read the member and permissions
description: Read the signed-in member, the space and the permissions with useApp, and show them in a header.
start: leads-app
---

<!-- flavour react -->
Read the signed-in [member](../../vector-space/glossary.md#member), the [space](../../vector-space/glossary.md#space) and the [permissions](../glossary.md#permission) from `useApp`, and show them in a header. The header names the member and the space, and shows a line only to members who hold `lead:manage`.

## Prerequisites

- A GitHub package token in `GITHUB_PACKAGES_TOKEN`, as in [step 0 of the quickstart](../quickstart.md#0-set-up-access-to-the-package-registry). The scaffold command reads it.
- The `leads-app` start. Scaffold it and work inside the new folder. For a Nest.js server, use `--server nest`.

```bash
npm create @vectoragents/app leads-app -- --client react --server node --start leads-app
cd leads-app
```

- Background: [`useApp`](../../sdk/reference/react.md#react-useapp).

## Steps

### 1. Read the context

`useApp` returns the token claims and the permissions that a [space admin](../../vector-space/glossary.md#space-admin) granted to the member. `claims` is `null` until the handshake completes, so step 2 mounts the component under `BootGate`.

```tsx title="client/src/AppHeader.tsx"
import { useApp } from '@vectoragents/vs-apps/react';

export function AppHeader() {
  const { claims, hasPermission, requestRefresh } = useApp();

  return (
    <header>
      <p>
        {claims?.name ?? claims?.sub} in space {claims?.spaceId}
      </p>
      {hasPermission('lead:manage') ? <p>You can manage leads.</p> : null}
      <button type="button" onClick={requestRefresh}>
        Refresh token
      </button>
    </header>
  );
}
```

Call `requestRefresh` after a space admin changes a permission. Vector Space sends a fresh token, and `permissions` updates.

:::warning
`hasPermission` changes what the member sees. A member can still call your server, so enforce the permission there, as in [gate an app page and an endpoint](./gate-by-permission.md).
:::

### 2. Mount the header under the gate

In `client/src/App.tsx`, import `AppHeader`.

```tsx title="client/src/App.tsx" showLineNumbers=1 excerpt
import { loadAppClientConfig } from '@vectoragents/vs-apps/browser';
import { AppProvider, BootGate } from '@vectoragents/vs-apps/react';
// added-next-line
import { AppHeader } from './AppHeader';
import { HelloPage } from './HelloPage';
import { LeadsPage } from './LeadsPage';
```

Then render it as the first child of `BootGate`.

```tsx title="client/src/App.tsx" showLineNumbers=19 excerpt
    >
      <BootGate fallback={<p>Waiting for Space.</p>}>
        {/* added-next-line */}
        <AppHeader />
        {window.location.pathname === '/leads' ? <LeadsPage /> : <HelloPage />}
      </BootGate>
    </AppProvider>
  );
```

### 3. Check the header

Run `npm run dev` and open `http://localhost:5173/harness.html`. The header shows the member, then `in space` and the space id, and the line `You can manage leads.` In the dev panel, remove `lead:manage` from the permission set. The line `You can manage leads.` disappears.

## Next steps

- [List and pick members](./list-members.md): resolve member ids to names.
<!-- /flavour -->
