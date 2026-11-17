---
title: Conformance reference
description: Signature, behaviour and example of each `@vectoragents/vs-apps/conformance` export.
---

The `@vectoragents/vs-apps/conformance` subpath is the [conformance kit](../glossary.md#conformance-kit), a test kit for your server. A fake [Vector Space](../../vector-space/glossary.md#vector-space) signs every kind of token. A list of cases drives the routes that Vector Space calls on your server and checks each answer. Each case holds one rule, such as refusing a token that Vector Space did not sign.

## Prerequisites

- Node.js 20.19 or later and a test runner. The fake Vector Space listens on a local port, so the subpath does not run in a browser.
- A server that serves the routes of the [app platform](../glossary.md#app-platform), from `createAppPlatform` or from the Nest.js module.

## `startFakeVectorSpace`

Starts a fake Vector Space on a local port.

### Signature

```typescript
function startFakeVectorSpace(options?: { issuer?: string }): Promise<FakeVectorSpace>;

interface FakeVectorSpace {
  baseUrl: string;
  jwksUrl: string;
  issuer: string;
  sign(request: DevTokenRequest): Promise<string>;
  signForeign(request: DevTokenRequest): Promise<string>;
  readonly pings: readonly ManifestPingInput[];
  dispose(): Promise<void>;
}
```

| Property | Meaning |
| --- | --- |
| `baseUrl` | The origin of the fake Vector Space, for the `spaceBaseUrl` of your server. |
| `jwksUrl` | The key set that your server verifies tokens against, for its `spaceJwksUrl`. |
| `issuer` | The `iss` claim of every token, for the `tokenIssuer` of your server. |
| `sign` | Signs a token with the key that `jwksUrl` publishes. |
| `signForeign` | Signs a token with a key that `jwksUrl` does not publish, to test a refusal. |
| `pings` | The manifest pings that your server sent, oldest first. |
| `dispose` | Closes the port. |

### Behaviour

- Listens on an ephemeral port of `127.0.0.1`.
- Publishes the key set, signs the six token kinds with the claims and lifetimes that Vector Space uses, and records manifest pings.
- Answers `404` to every other path, so a server that calls Vector Space for anything else fails in the test.
- Call `dispose` after the last case.

### Example

```ts title="test/fake-space.ts"
import { DEV_APP_ID } from '@vectoragents/vs-apps';
import { startFakeVectorSpace } from '@vectoragents/vs-apps/conformance';

export async function signTokens(): Promise<{ signed: string; foreign: string }> {
  const space = await startFakeVectorSpace();
  const request = {
    kind: 'user' as const,
    sub: 'member-1',
    appId: DEV_APP_ID,
    appKey: 'hello-app',
    spaceId: 1,
    organizationId: 1,
    capabilities: ['hello:view'],
  };
  try {
    return { signed: await space.sign(request), foreign: await space.signForeign(request) };
  } finally {
    await space.dispose();
  }
}
```

A server that verifies against `space.jwksUrl` accepts `signed` and refuses `foreign`.

## `appPlatformConformance`

Returns the cases that an app platform must pass.

### Signature

```typescript
function appPlatformConformance(target: AppPlatformConformanceTarget): ConformanceCase[];

interface AppPlatformConformanceTarget {
  baseUrl: string;
  space: FakeVectorSpace;
  appKey: string;
  storedSecret(appId: string, spaceId: number): Promise<string | null>;
  handlers?: {
    event?: { slot: string; handler: string };
    failingEvent?: { slot: string; handler: string };
    askDecision?: boolean;
  };
}

interface ConformanceCase {
  name: string;
  run(): Promise<void>;
}
```

| Field | Required | Meaning |
| --- | --- | --- |
| `baseUrl` | required | The origin of your server plus the prefix of the platform routes, such as `http://127.0.0.1:4000/api`. |
| `space` | required | The fake Vector Space that `startFakeVectorSpace` returned. |
| `appKey` | required | An app key that your server hosts. |
| `storedSecret` | required | Reads the secret that your credential store holds for an app and a space. |
| `handlers` | optional | The handlers that your server registered, named only for cases that need them. |

### Behaviour

- Each case is a protocol rule. `run` throws when your server breaks it, and needs no test runner of its own.
- The cases cover the manifest route, provisioning, the client configuration, connector events and ask decisions.
- A case checks the status of each refusal: `401` for a missing token, a token that Vector Space did not sign and a token of the wrong kind. It expects `403` for a token minted for another space or app, `400` for a malformed body and `404` for an app the server does not host.
- Read `target.space.baseUrl` and `target.space.jwksUrl` into the settings of your server before you boot it. The list exists before the server is up, so `baseUrl` may be set later.
- Pass `handlers.event` when your server registers an event handler that resolves, and `handlers.failingEvent` for one that throws. The kit then checks that the first is acknowledged as handled and that the second answers `500`, so Vector Space tries again.
- Run one test for each case, so a failure names the rule.

### Example

```ts title="test/conformance.test.ts"
import { createServer, type Server } from 'node:http';
import type { AddressInfo } from 'node:net';
import { after, before, it } from 'node:test';
import { defineApp } from '@vectoragents/vs-apps';
import { appPlatformConformance, startFakeVectorSpace, type FakeVectorSpace } from '@vectoragents/vs-apps/conformance';
import { buildManifests, createAppPlatform } from '@vectoragents/vs-apps/server';

const definition = defineApp({
  key: 'hello-app',
  version: '0.1.0',
  pages: [{ key: 'home', label: 'Home', path: '/' }],
  capabilities: [],
});

const secrets = new Map<string, string>();
const manifests = buildManifests([definition], { catalog: undefined, publicBaseUrl: 'http://localhost' });

let space: FakeVectorSpace;
let server: Server;
const target = {
  baseUrl: '',
  space: undefined as unknown as FakeVectorSpace,
  appKey: definition.key,
  storedSecret: async (appId: string, spaceId: number) => secrets.get(`${appId}:${spaceId}`) ?? null,
};

before(async () => {
  space = await startFakeVectorSpace();
  const platform = createAppPlatform({
    options: { spaceBaseUrl: space.baseUrl, spaceJwksUrl: space.jwksUrl, tokenIssuer: space.issuer, allowedParentOrigin: 'http://localhost' },
    manifests,
    credentialStore: {
      upsert: async (appId, spaceId, secret) => void secrets.set(`${appId}:${spaceId}`, secret),
      remove: async (appId, spaceId) => void secrets.delete(`${appId}:${spaceId}`),
      get: async (appId, spaceId) => secrets.get(`${appId}:${spaceId}`) ?? null,
    },
  });
  server = createServer(async (req, res) => {
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const method = req.method ?? 'GET';
    const response = await platform.fetch(
      new Request(`http://127.0.0.1${req.url}`, {
        method,
        headers: req.headers as Record<string, string>,
        body: method === 'GET' ? undefined : Buffer.concat(chunks),
      }),
    );
    res.writeHead(response?.status ?? 404, Object.fromEntries(response?.headers ?? []));
    res.end(response ? Buffer.from(await response.arrayBuffer()) : undefined);
  });
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', () => resolve()));
  target.space = space;
  target.baseUrl = `http://127.0.0.1:${(server.address() as AddressInfo).port}/api`;
});

after(async () => {
  server.close();
  await space.dispose();
});

for (const { name, run } of appPlatformConformance(target)) it(name, run);
```

## Next steps

- [Platform limits](./platform-limits.md): look up the closed lists that an app definition accepts.
