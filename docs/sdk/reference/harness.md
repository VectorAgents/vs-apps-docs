---
title: Harness reference
description: Signature, behaviour and example of `VectorAppsHarness`, the dev routes it calls and the wiring of an app that is not built from the starter.
---

The [harness](../glossary.md#harness) of `@vectoragents/vs-apps/react/harness` is a local stand-in for [Vector Space](../../vector-space/glossary.md#vector-space). The starter includes the harness already wired. For an app that is not built from the starter, wire the harness by hand. An app does not ship the harness.

## Prerequisites

- React 18 or later with TypeScript.
- The app server running with `VA_DEV_ISSUER=true`, and serving the [dev routes](#dev-routes), which the [app platform](../glossary.md#app-platform) of the SDK serves. See [Turn the harness on and off](#turn-the-harness-on-and-off).
- A second HTML entry for the harness, served by your bundler.

## `VectorAppsHarness`

Renders a shell that looks like Vector Space around the app, which runs in an iframe from the same origin.

### Signature

```typescript
function VectorAppsHarness(): JSX.Element;
```

### Behaviour

- Fetches `/api/__dev/manifests` from the app server to build the sidebar of apps and [app pages](../../vector-apps/glossary.md#app-page).
- Mints a token for the chosen identity and capabilities through `POST /api/__dev/token`, and sends it to the iframe. Changing the capability set in the dev panel re-mints it.
- Shows the error `The app server did not answer /api/__dev/manifests` when the manifests request fails. The error tells you to run the server with `VA_DEV_ISSUER=true`.
- Keeps the selected app, page, capabilities, theme and identity in the page query string, so a reload restores them.
- Remembers the dev panel and sidebar open state in `localStorage`.
- Takes no props.
- Serve it only in development. Never build it into the production bundle: keep it in a separate HTML entry that the build does not list as an input.

### Example

```tsx title="src/harness.tsx"
import { VectorAppsHarness } from '@vectoragents/vs-apps/react/harness';
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <VectorAppsHarness />
  </StrictMode>,
);
```

Load it from `harness.html`, a sibling of `index.html` whose script tag points at this file:

```html title="harness.html"
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Harness</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/harness.tsx"></script>
  </body>
</html>
```

Serve `harness.html` with your bundler, and open `/harness.html` on the client port.

## Dev routes

The app server serves three routes on the same origin as the page, under `/api`, and your bundler forwards `/api` to it. The [app platform](../glossary.md#app-platform) of `@vectoragents/vs-apps/server` serves all three, and only while it holds a [dev issuer](../glossary.md#dev-issuer), which `VA_DEV_ISSUER=true` turns on in the example. The harness calls the first two routes. The third publishes the key set that verifies the dev tokens.

### `GET /api/__dev/manifests`

Returns status `200` and a JSON array with one entry per app in the server. The harness builds its sidebar from the array.

| Field | Type | Meaning |
| --- | --- | --- |
| `appKey` | string | The `key` of the app definition. |
| `appId` | UUID | The fixed dev id, `DEV_APP_ID` from `@vectoragents/vs-apps`. |
| `manifest` | object | The [manifest](../../vector-apps/glossary.md#manifest) that `buildManifests` returns for the app. |

### `POST /api/__dev/token`

Signs a token with the dev issuer. The body is JSON with a `kind` field. The harness sends `kind: "user"`. The other kinds are `provisioning`, `a2a`, `mcp`, `actions` and `events`.

A `user` request has these fields:

| Field | Type | Required | Meaning |
| --- | --- | --- | --- |
| `kind` | `"user"` | required | Selects the user token. |
| `sub` | string | required | The id of the member. |
| `appId` | UUID | required | The app id, for example `DEV_APP_ID`. |
| `appKey` | string | required | The app key. |
| `spaceId` | number | required | The space id. |
| `organizationId` | number | required | The organization id. |
| `capabilities` | string array | required | The capability keys the token holds. |
| `name` | string | optional | The display name. |
| `picture` | string | optional | The picture URL. |
| `ttlSeconds` | number | optional | The lifetime in seconds, 300 by default for a user token. |

An `appId` that is not a UUID gets status `400`.

A valid request returns status `200` and a JSON body:

| Field | Type | Meaning |
| --- | --- | --- |
| `token` | string | The signed token. |
| `expiresIn` | number | The lifetime in seconds. |
| `claims` | object | The claims inside the token, with `iss`, `aud`, `iat` and `exp` added. |

An invalid request returns status `400`. The harness shows the response text in its dev panel.

### `GET /api/__dev/jwks.json`

Returns status `200` and the public key set of the dev issuer. The set verifies the tokens that `POST /api/__dev/token` signs.

<!-- flavour node -->
## Serve the dev routes

`createAppPlatform` serves the three dev routes, the manifest route and the other routes that [Vector Space](../../vector-space/glossary.md#vector-space) calls. It serves the dev routes once it holds a dev issuer. `createDevIssuer` signs and verifies tokens, so one object does both. It stores nothing and makes a new key on each call, so a restart makes the tokens of the open harness invalid. To keep them valid, save the `privateKey` of the issuer and pass it back to `createDevIssuer`.

The platform also needs an `AppCredentialStore`, where it keeps the secret that Vector Space pushes when it adds the app. The store in the next snippet keeps the secrets in memory. The platform answers Fetch requests, so `handlePlatformRoute` bridges a `node:http` request to one. It returns `true` when the platform answered the request, and `false` for every other request.

```ts title="server/src/platform.ts"
import { createAppPlatform, createDevIssuer, type AppCredentialStore, type AppManifests } from '@vectoragents/vs-apps/server';

const secrets = new Map<string, string>();

const credentialStore: AppCredentialStore = {
  async upsert(appId, spaceId, secret) {
    secrets.set(`${appId}:${spaceId}`, secret);
  },
  async remove(appId, spaceId) {
    secrets.delete(`${appId}:${spaceId}`);
  },
  async get(appId, spaceId) {
    return secrets.get(`${appId}:${spaceId}`) ?? null;
  },
};

export async function createPlatform(manifests: AppManifests) {
  return createAppPlatform({
    options: {
      // The platform takes the Vector Space origin, and SPACE_API_URL ends in /api.
      spaceBaseUrl: (process.env.SPACE_API_URL ?? '').replace(/\/api\/?$/, ''),
      spaceJwksUrl: process.env.SPACE_JWKS_URL ?? '',
      allowedParentOrigin: process.env.ALLOWED_PARENT_ORIGIN ?? '',
    },
    manifests,
    credentialStore,
    devIssuer: process.env.VA_DEV_ISSUER === 'true' ? await createDevIssuer() : undefined,
  });
}
```

```ts title="server/src/platform-routes.ts"
import type { IncomingMessage, ServerResponse } from 'node:http';
import { Readable } from 'node:stream';
import type { AppPlatform } from '@vectoragents/vs-apps/server';

function toFetchRequest(req: IncomingMessage): Request {
  const method = req.method ?? 'GET';
  const body = method === 'GET' || method === 'HEAD' ? undefined : (Readable.toWeb(req) as ReadableStream);
  return new Request(new URL(req.url ?? '/', 'http://localhost'), {
    method,
    headers: req.headers as Record<string, string>,
    body,
    duplex: 'half',
  } as RequestInit);
}

export async function handlePlatformRoute(
  platform: AppPlatform,
  req: IncomingMessage,
  res: ServerResponse,
): Promise<boolean> {
  const response = await platform.fetch(toFetchRequest(req));
  if (!response) return false;
  res.writeHead(response.status, Object.fromEntries(response.headers));
  res.end(Buffer.from(await response.arrayBuffer()));
  return true;
}
```

## Accept dev tokens

Create the platform once at boot with `const platform = await createPlatform(manifests);`, with the manifests from `buildManifests`. Call `handlePlatformRoute` first inside the `try` block of your request handler, before any route of your own: `if (await handlePlatformRoute(platform, req, res)) return;`. Then make two more changes so the app accepts the tokens that the dev issuer signs. Without both, the iframe stays on `Waiting for Space.`.

1. **Allow the harness origin.** Set `ALLOWED_PARENT_ORIGIN` to the origin that your bundler serves `harness.html` from, for example `http://localhost:5173`. The harness page is the parent of the iframe, so the client accepts messages from this origin only. A Vector Space origin here makes the `postMessage` call from the iframe fail.
2. **Verify with the dev issuer.** Pass `platform.verifier` to `verifyUserToken` in place of a Vector Space verifier. While the platform holds a dev issuer, the verifier is that issuer. Otherwise `GET /api/hello` fails with status `401`.

The platform serves `GET /api/client-config` itself. While it holds a dev issuer, the `spaceJwksUrl` of that route is `/api/__dev/jwks.json`, so the browser verifies the token against the dev key set. A route of your own does not need to return it.

```ts title="server/src/auth.ts"
import type { IncomingMessage } from 'node:http';
import { readBearer, verifyUserToken, type AppPlatform } from '@vectoragents/vs-apps/server';

export function requireUser(platform: AppPlatform, req: IncomingMessage) {
  return verifyUserToken(platform.verifier, readBearer(req.headers));
}
```

When the page works, the harness card shows the member, the space and the capabilities of the token, and a request to your server succeeds.
<!-- /flavour -->
<!-- flavour nest todo -->
<!-- /flavour -->

## Turn the harness on and off

Set `VA_DEV_ISSUER=true` in the environment of the app server process, in the command that starts it, for example `VA_DEV_ISSUER=true npm run dev`. A watch runner such as `tsx watch` does not reload `.env`, so restart the server after you change the value.

To run against a real Vector Space, start the server without `VA_DEV_ISSUER`. Set `ALLOWED_PARENT_ORIGIN` to the Vector Space origin and `SPACE_JWKS_URL` to the Vector Space key set URL. Never build `harness.html` into the production bundle.

## Limits

The harness signs its own tokens, so it proves your app page and server. These parts of the path stay outside it:

- Vector's registration of the app.
- Vector Space fetching the manifest from your server.
- The license and space access that let a member open the app.
- The real Vector Space key set and the real iframe URL.
- A real Vector Space origin sending the token.

## Next steps

- [Server reference](./server.md): tell Vector Space when your manifests change.
