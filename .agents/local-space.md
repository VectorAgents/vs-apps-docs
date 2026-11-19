# Local Space runbook

Not published. Run a Space on your machine to check the docs against a real Space. Start commands live in the Space repo, so this file holds only what that repo does not.

## Rule

If a port or command here disagrees with `../vector-spaces`, trust the Space repo and fix this file.

## Start the Space

Read `../vector-spaces/CLAUDE.md` under "Build, verify, run" and `../vector-spaces/docker-compose.yml` for the commands. Three facts are not there:

- The Space server listens on port 3000.
- The Space client listens on port 3001.
- Set `SERVER_PORT=3101` for the starter. Its client proxies `/api` to `SERVER_PORT`.

On this machine the env exists, so ask the user for no credentials:

- `pnpm dev:server` and `pnpm dev:client` in `../vector-spaces` start the Space. Run each in the background with its log in a scratch file. Stop them by port with `ss -ltnp`, never with `pkill -f <name>`: the name also matches your own command line.
- The server reads `apps/server/.env`. Its `EGRESS_PRIVATE_HOSTS` lists `localhost:3101` and `localhost:5173`, the starter's server and client. Postgres (5433) and Redis (6379) run in Docker.
- The Edge debug browser on port 9222 stays signed in to the Space.

## Register the app

Follow `.agents/staff-registration.md`. Run every step through the user interface, as Vector staff would. Never write SQL. A step that needs SQL is a guide defect: stop and report it to the user.

An existing registration blocks a new one: see "Replace an existing registration" in that file.

## Local source only

After a pull, pending database migrations break pages in the local space. Read `docs/engineering/DATABASE.md` under "Branch databases" in `../vector-spaces`, then run `pnpm migration:run` there.

## Settings URLs

Open a settings page by its address. The route files under `../vector-spaces/apps/client/src/routes/_authenticated/settings/` give the paths, and `<id>` is the space id (1 in the local Space):

| Page | Address |
| --- | --- |
| Installed apps of a space | `/settings/space/<id>/vector-apps/installed` |
| App catalog of the organization | `/settings/organization/vector-apps/catalog` |
| Organizations and their license (staff) | `/settings/admin/organizations` |
| App registrations (staff) | `/settings/admin/apps` |

`SPACE_DIR=../vector-spaces pnpm check:space` fails when a label or toast that Part 2 of the quickstart or `.agents/staff-registration.md` names no longer exists in the Space client source.

## Drive the interface

Follow `.agents/browser-checks.md`.
