---
title: Browser reference
description: Signature, behaviour and example of each `@vectoragents/vs-apps/browser` export.
---

The `@vectoragents/vs-apps/browser` subpath is the framework-free browser runtime of an [app](../../vector-apps/glossary.md#app). It holds the loader of the boot configuration and the types of the member directory. It also holds the embed session, the iframe bridge and the token verifier that [`AppProvider`](./react.md#react-appprovider) drives. An app imports `loadAppClientConfig`, `DirectoryUser` and `DirectoryGroup` from it, and `AppClientConfig` from the package root. An app without React also calls `startAppSession`.

## Prerequisites

- A server route that returns the client configuration, `GET /api/client-config`, when the configuration is not baked into the bundle.

## `loadAppClientConfig`

Resolves the boot configuration for the iframe bridge and the token verifier.

### Signature

```typescript
function loadAppClientConfig(options?: {
  baked?: Partial<AppClientConfig>;
  url?: string;
}): Promise<AppClientConfig>;
```

| Option | Required | Meaning |
| --- | --- | --- |
| `baked` | optional | The configuration known at build time, used when `baked.allowedParentOrigin` is set. |
| `url` | optional | Where to fetch the configuration otherwise, `/api/client-config` by default. |

### Behaviour

- Returns the `baked` values without a network call when `baked.allowedParentOrigin` is set. It copies only the four configuration fields and drops empty optional fields.
- Otherwise fetches `url` and returns the JSON body.
- Rejects with `client config fetch failed: <status>` on a non-2xx response.
- Rejects with `client config: ALLOWED_PARENT_ORIGIN is not set on the server` when the body has no `allowedParentOrigin`.
- Starts the fetch on every call, so create the promise once and share it.
- Call it lazily. Build tooling that loads route modules outside a browser has no origin to fetch from, so the import of your module must not start the fetch.

### Example

```ts title="src/client-config.ts"
import { type AppClientConfig } from '@vectoragents/vs-apps';
import { loadAppClientConfig } from '@vectoragents/vs-apps/browser';

let configPromise: Promise<AppClientConfig> | null = null;

export function getClientConfig(): Promise<AppClientConfig> {
  configPromise ??= loadAppClientConfig();
  return configPromise;
}
```

Pass the result to `AppProvider`'s `config` prop.

## `AppClientConfig`

The shape of the boot configuration. The package root exports it, so a server and a client share one type.

### Signature

```typescript
interface AppClientConfig {
  allowedParentOrigin: string;
  spaceJwksUrl?: string;
  tokenIssuer?: string;
  spaceApiUrl?: string;
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `allowedParentOrigin` | required | The one origin the iframe bridge accepts messages from. |
| `spaceJwksUrl` | optional | Where the browser fetches the signing keys of [Vector Space](../../vector-space/glossary.md#vector-space) to verify a token. |
| `tokenIssuer` | optional | The expected `iss` claim of a token. |
| `spaceApiUrl` | optional | The Vector Space API base, which enables the member directory. |

### Behaviour

- Only `allowedParentOrigin` is required. `loadAppClientConfig` rejects without it.
- The environment of the server is the source of the values in every environment, so the same bundle runs in the [harness](./harness.md) and in Vector Space.
- Without `spaceApiUrl`, `useApp().directory` is `null` and `useUsers` returns placeholder names.

### Example

```ts title="src/static-config.ts"
import { type AppClientConfig } from '@vectoragents/vs-apps';
import { loadAppClientConfig } from '@vectoragents/vs-apps/browser';

const baked: AppClientConfig = {
  allowedParentOrigin: 'https://space.example.com',
  spaceApiUrl: 'https://space.example.com/api',
};

export const config = loadAppClientConfig({ baked });
```

## `startAppSession`

Runs the app side of the embed protocol for one [app page](../../vector-apps/glossary.md#app-page) and exposes its state as an external store. [`AppProvider`](./react.md#react-appprovider) calls it for a React tree, and you call it on another framework.

### Signature

```typescript
function startAppSession(options: AppSessionOptions): AppSession;

interface AppSessionOptions {
  config: AppClientConfig | Promise<AppClientConfig>;
  registry: AgentActionRegistry;
  navigate: (path: string) => void;
  onToken?: (token: string | null) => void;
  onTheme?: (theme: 'light' | 'dark') => void;
}

interface AppSession {
  subscribe(listener: () => void): () => void;
  getSnapshot(): AppSessionState;
  requestRefresh(): void;
  dispose(): void;
}

interface AppSessionState {
  claims: UserTokenClaims | null;
  permissions: ReadonlySet<string>;
  hasPermission: (permission: string) => boolean;
  requestRefresh: () => void;
  directory: UserDirectory | null;
}
```

| Option | Required | Meaning |
| --- | --- | --- |
| `config` | required | The boot configuration, or a promise of it. |
| `registry` | required | The [agent action registry](./root.md#createagentactionregistry) that receives the dispatched actions. |
| `navigate` | required | Called when Vector Space asks the app to open a path. |
| `onToken` | optional | Called with each verified token, and with `null` on `dispose`. |
| `onTheme` | optional | Called with `'light'` or `'dark'` when Vector Space changes theme. |

### Behaviour

- Starts the iframe bridge once the configuration resolves. The bridge accepts messages only from `allowedParentOrigin`.
- Verifies each token against the key set of the configuration. A token that fails verification is logged to the console and ignored, so `claims` stays `null`.
- Opens the member directory on the first verified token, when the configuration sets `spaceApiUrl`.
- Dispatches each action that Vector Space sends into `registry`, and reports the document height to Vector Space through a `ResizeObserver`.
- Keeps the token in memory only.
- `getSnapshot` returns the same object until the state changes, so it works as the snapshot function of a store such as `useSyncExternalStore`.
- `dispose` stops the bridge, calls `onToken(null)` and resets the state to the one before the first token.

### Example

```ts title="src/session.ts"
import { createAgentActionRegistry } from '@vectoragents/vs-apps';
import { loadAppClientConfig, startAppSession } from '@vectoragents/vs-apps/browser';

const session = startAppSession({
  config: loadAppClientConfig(),
  registry: createAgentActionRegistry(),
  navigate: (path) => window.history.pushState(null, '', path),
  onTheme: (theme) => {
    document.documentElement.dataset.theme = theme;
  },
});

const unsubscribe = session.subscribe(() => {
  const { claims } = session.getSnapshot();
  console.log(claims ? `Signed in as ${claims.sub}.` : 'Waiting for Space.');
});

export function stopSession(): void {
  unsubscribe();
  session.dispose();
}
```

## `DirectoryUser`

One member in the space directory.

### Signature

```typescript
interface DirectoryUser {
  id: string;
  displayName: string;
  avatarUrl: string | null;
  deleted: boolean;
}
```

### Behaviour

- `useUsers` returns these in a map keyed by `id`.
- `directory.search(q, take?)` returns them as an array.
- An id that Vector Space cannot show keeps its entry with `deleted: true`.
- `avatarUrl` is `null` when the member has none.

### Example

```tsx title="src/MemberPicker.tsx"
import type { DirectoryUser } from '@vectoragents/vs-apps/browser';
import { useApp } from '@vectoragents/vs-apps/react';
import { useState } from 'react';

export function MemberPicker({ onPick }: { onPick: (user: DirectoryUser) => void }) {
  const { directory } = useApp();
  const [matches, setMatches] = useState<DirectoryUser[]>([]);

  if (!directory) return <p>The directory is not available.</p>;

  return (
    <div>
      <input
        type="search"
        placeholder="Find a member"
        onChange={async (event) => setMatches(await directory.search(event.target.value, 5))}
      />
      <ul>
        {matches.map((user) => (
          <li key={user.id}>
            <button type="button" onClick={() => onPick(user)}>
              {user.displayName}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
```

## `DirectoryGroup`

One group in the space directory.

### Signature

```typescript
interface DirectoryGroup {
  id: number;
  name: string;
  userIds: string[];
}
```

### Behaviour

- `directory.groups()` returns every group.
- `userIds` holds member ids. Resolve them to names with `useUsers`.
- `id` is numeric, unlike the string `DirectoryUser.id`.

### Example

```tsx title="src/GroupList.tsx"
import type { DirectoryGroup } from '@vectoragents/vs-apps/browser';
import { useApp } from '@vectoragents/vs-apps/react';
import { useEffect, useState } from 'react';

export function GroupList() {
  const { directory } = useApp();
  const [groups, setGroups] = useState<DirectoryGroup[]>([]);

  useEffect(() => {
    void directory?.groups().then(setGroups);
  }, [directory]);

  return (
    <ul>
      {groups.map((group) => (
        <li key={group.id}>
          {group.name} ({group.userIds.length})
        </li>
      ))}
    </ul>
  );
}
```

## Next steps

- [React reference](./react.md): bind the app session to a React tree with `AppProvider`.
