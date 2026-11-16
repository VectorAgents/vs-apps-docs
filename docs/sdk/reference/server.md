---
title: Server reference
description: Signature, behaviour and example of the `@vectoragents/vs-apps/server` export that tells Vector Space your manifests changed.
---

Of the exports of `@vectoragents/vs-apps/server`, `pingManifests` is the one that reaches out to [Vector Space](../../vector-space/glossary.md#vector-space). It tells Vector Space that your [manifests](../../vector-apps/glossary.md#manifest) changed, so Vector Space does not wait for a [staff](../../vector-space/glossary.md#staff) refresh.

## Prerequisites

- A server that builds its manifests with `buildManifests`, covered in the [app definition guide](../app-definition.md). `buildManifests` takes the [agent catalog](../glossary.md#agent-catalog) that [`readExtractedAgentCatalog`](./extract.md#readextractedagentcatalog) reads.
- The origin of a Vector Space that the server can reach, for example `https://space.example.com`.

## `pingManifests`

Sends Vector Space the current hash of each manifest at boot.

### Signature

```typescript
function pingManifests(options: {
  spaceBaseUrl: string;
  manifests: Record<string, AppManifest>;
  log?: (message: string) => void;
}): Promise<void>;
```

| Option | Required | Meaning |
| --- | --- | --- |
| `spaceBaseUrl` | required | The Vector Space origin, with no `/api` suffix. |
| `manifests` | required | The record that `buildManifests` returns, keyed by app key. |
| `log` | optional | Receives each failure message, `console.warn` by default. |

### Behaviour

- Call it once at boot, after `buildManifests`. A server that runs [`createAppPlatform`](../glossary.md#app-platform) calls `platform.pingManifests()` instead. It sends the same ping with the platform's own `spaceBaseUrl` and `manifests`. It does nothing while the platform holds a [dev issuer](../glossary.md#dev-issuer).
- Removes one trailing `/` from `spaceBaseUrl`.
- Sends `POST {spaceBaseUrl}/api/apps/manifest-ping` once for each manifest. The body is JSON with `appKey` and `manifestHash`, the SHA-256 hex digest of the manifest as the server serves it.
- Vector Space reads the manifest again for each app whose hash changed.
- Stops on a status from 200 to 299 or on `429`, which means Vector Space is already reading that manifest.
- Tries a failing ping up to 3 times, at 0, 5 and 15 seconds after the call. It logs each failure.
- Never throws. Failures go to `log`, so call it without `await`. A manual refresh in Vector Space is the fallback.
- Resolves after every manifest has either succeeded or used its 3 attempts.
- Sends no credentials. The body holds a hash and an app key, not manifest data.

### Example

<!-- flavour node -->
```ts title="src/ping.ts"
import { defineApp } from '@vectoragents/vs-apps';
import { readExtractedAgentCatalog } from '@vectoragents/vs-apps/extract';
import { buildManifests, pingManifests } from '@vectoragents/vs-apps/server';

const definition = defineApp({
  key: 'hello-app',
  version: '0.1.0',
  pages: [{ key: 'home', label: 'Home', path: '/' }],
  capabilities: [],
});

const manifests = buildManifests([definition], {
  catalog: readExtractedAgentCatalog('agent-catalog.json'),
  publicBaseUrl: process.env.PUBLIC_BASE_URL ?? '',
});

if (process.env.SPACE_API_URL) {
  // A value that ends in /api is the API root, not the origin.
  const spaceBaseUrl = process.env.SPACE_API_URL.replace(/\/api\/?$/, '');
  void pingManifests({ spaceBaseUrl, manifests });
}
```
<!-- /flavour -->
<!-- flavour nest todo -->
<!-- /flavour -->

## Next steps

- [oRPC reference](./orpc.md): mark the routes that the space agent may call.
