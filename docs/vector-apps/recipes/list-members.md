---
title: List and pick members
description: Show lead owners by name, search members for an owner picker and list the members of each group from the member directory.
start: leads-app
---

<!-- flavour react -->
Show the owners of leads by name, let a [member](../../vector-space/glossary.md#member) pick an owner and list the people in each group. The leads app page reads all three from the [member directory](../glossary.md#member-directory) of the [space](../../vector-space/glossary.md#space).

## Prerequisites

- A GitHub package token in `GITHUB_PACKAGES_TOKEN`, as in [step 0 of the quickstart](../quickstart.md#0-set-up-access-to-the-package-registry). The scaffold command reads it.
- The `leads-app` start, added to a space and run with `npm run dev:space`. The harness has no member directory, because `npm run dev` clears `SPACE_API_URL`. Scaffold the start and work inside the new folder. For a Nest.js server, use `--server nest`.

```bash
npm create @vectoragents/app leads-app -- --client react --server node --start leads-app
cd leads-app
```

- `SPACE_API_URL` in `.env`, set to the [Vector Space](../../vector-space/glossary.md#vector-space) API origin followed by `/api`, for example `https://space-api.example.com/api`. The starter returns it as `spaceApiUrl` in `/api/client-config`. Without it, `useApp().directory` is `null`.
- Background: [`useUsers`](../../sdk/reference/react.md#react-useusers), [`DirectoryUser` and `DirectoryGroup`](../../sdk/reference/browser.md#directoryuser).

## Steps

### 1. Resolve owner identifiers to names

`useUsers` takes member identifiers your data already holds, for example the owner of each lead. It fetches again only when the set of identifiers changes, so a new array on each render costs nothing. If Vector Space cannot show an identifier, the map holds an entry with `deleted: true` and the name `Former member`. Vector Space cannot show an identifier for a deleted member, a member who left the organization or an unknown identifier.

```tsx title="client/src/LeadOwners.tsx"
import { useUsers } from '@vectoragents/vs-apps/react';

export function LeadOwners({ ownerIds }: { ownerIds: readonly string[] }) {
  const { users, loading } = useUsers(ownerIds);

  if (loading) return <p>Loading owners.</p>;

  return (
    <ul>
      {ownerIds.map((id) => {
        const user = users.get(id);
        return (
          <li key={id}>
            {user?.displayName ?? id}
            {user?.deleted ? ' (removed)' : ''}
          </li>
        );
      })}
    </ul>
  );
}
```

### 2. Search members for a picker

`useApp().directory` is `null` without a member directory. `search` returns `DirectoryUser` entries and rejects when Vector Space answers with an error, so the snippet catches the rejection and shows an error line.

Search runs from an effect that waits 300 ms after the last keystroke. The cleanup cancels the timer when the query changes, so only the last pause sends a call. The same cleanup drops a reply that arrives after the query changed.

```tsx title="client/src/OwnerPicker.tsx"
import type { DirectoryUser } from '@vectoragents/vs-apps/browser';
import { useApp } from '@vectoragents/vs-apps/react';
import { useEffect, useState } from 'react';

export function OwnerPicker({ onPick }: { onPick: (user: DirectoryUser) => void }) {
  const { directory } = useApp();
  const [query, setQuery] = useState('');
  const [matches, setMatches] = useState<DirectoryUser[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!directory || query.trim() === '') {
      setMatches([]);
      return;
    }
    let stale = false;
    const timer = setTimeout(() => {
      directory
        .search(query, 5)
        .then((found) => {
          if (stale) return;
          setMatches(found);
          setError(null);
        })
        .catch(() => {
          if (!stale) setError('The search failed. Try again.');
        });
    }, 300);
    return () => {
      stale = true;
      clearTimeout(timer);
    };
  }, [directory, query]);

  if (!directory) return <p>The directory is not available.</p>;

  return (
    <div>
      <input type="search" placeholder="Find an owner" value={query} onChange={(event) => setQuery(event.target.value)} />
      {error ? <p role="alert">{error}</p> : null}
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

### 3. Show the members of a group

A `DirectoryGroup` holds `userIds`, not names. `userIds` lists only members that Vector Space shows. Pass them to `useUsers` to get names. A hook cannot run in a loop, so one component takes one group.

```tsx title="client/src/GroupRoster.tsx"
import type { DirectoryGroup } from '@vectoragents/vs-apps/browser';
import { useUsers } from '@vectoragents/vs-apps/react';

export function GroupRoster({ group }: { group: DirectoryGroup }) {
  const { users, loading } = useUsers(group.userIds);

  if (loading) return <p>Loading members.</p>;

  return (
    <ul>
      {group.userIds.map((id) => (
        <li key={id}>{users.get(id)?.displayName ?? id}</li>
      ))}
    </ul>
  );
}
```

### 4. List groups

`directory.groups()` returns every `DirectoryGroup` of the space. Its `id` is numeric, unlike the string identifier of a member. Like `search`, it rejects when Vector Space answers with an error, so the snippet shows an error line.

```tsx title="client/src/TeamGroups.tsx"
import type { DirectoryGroup } from '@vectoragents/vs-apps/browser';
import { useApp } from '@vectoragents/vs-apps/react';
import { useEffect, useState } from 'react';
import { GroupRoster } from './GroupRoster';

export function TeamGroups() {
  const { directory } = useApp();
  const [groups, setGroups] = useState<DirectoryGroup[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    directory
      ?.groups()
      .then(setGroups)
      .catch(() => setError('The groups failed to load. Try again.'));
  }, [directory]);

  return (
    <div>
      {error ? <p role="alert">{error}</p> : null}
      {groups.map((group) => (
        <section key={group.id}>
          <h3>{group.name}</h3>
          <GroupRoster group={group} />
        </section>
      ))}
    </div>
  );
}
```

### 5. Mount the components

Each component calls `useApp` or `useUsers`, so it must render inside `AppProvider`, as the app pages do. The leads app page keeps the owner identifiers in state, and the picker adds the member it returns.

```tsx title="client/src/LeadsPage.tsx"
// added-start
import { useState } from 'react';
import { LeadOwners } from './LeadOwners';
import { OwnerPicker } from './OwnerPicker';
import { TeamGroups } from './TeamGroups';
// added-end

export function LeadsPage() {
  // added-next-line
  const [ownerIds, setOwnerIds] = useState<string[]>([]);

  return (
    <main>
      <h1>Leads</h1>
      <p>No leads yet.</p>
      {/* added-start */}
      <LeadOwners ownerIds={ownerIds} />
      <OwnerPicker onPick={(user) => setOwnerIds((ids) => (ids.includes(user.id) ? ids : ids.concat(user.id)))} />
      <TeamGroups />
      {/* added-end */}
    </main>
  );
}
```

### 6. Check the lists in the space

Run `npm run dev:space` and open the leads app page in the space. Type a name in the **Find an owner** box and pause for 300 ms. The box lists up to 5 matching members, one button each. Select one: the name appears in the owners list.

`TeamGroups` lists each group of the space with the names of its members. A failed search or group call shows an error line.

## Next steps

- [Expose agent actions on an app page](./expose-agent-actions.md): let the space agent drive these app pages.
<!-- /flavour -->
