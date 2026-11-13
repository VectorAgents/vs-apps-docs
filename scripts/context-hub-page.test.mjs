import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bannedTermsIn, bodyOf, brokenLinks, linksOf, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/context-hub.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text);
const plain = unlink(body);
const lead = body.split(/^## /m)[0].trim();
const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

test('the page runs lead, the scene, five detail H2s, Where to go next', () => {
  assert.deepEqual(headings, [
    'A sales team connects its data',
    'What the Context Hub holds',
    'Datasources',
    'APIs and MCP servers',
    'Mailboxes and the Omnibox',
    'Credentials and sharing',
    'Where to go next',
  ]);
  assert.doesNotMatch(text, /^#+ .*Example/m);
});

test('the lead defines the Context Hub with a glossary link and says what it gives', () => {
  assert.match(lead, /^The \[Context Hub\]\(\.\/glossary\.md#context-hub\) is the area of a \[space\]\(\.\/glossary\.md#space\) that lists what the space can reach/);
  assert.match(lead, /nobody hands out a login/);
});

test('the page has no figure slot and no figure component', () => {
  assert.doesNotMatch(text, /<(FigurePlaceholder|StructureFigure|FlowFigure)\b|^import /m);
});

test('the scene is the Acme sales team: lead database, REST API, shared mailbox, orchestrator agent', () => {
  const scene = section(text, 'A sales team connects its data');
  assert.match(scene, /^A sales team connects its data\n\nAcme's sales team has a space/);
  for (const word of ['database of leads', 'REST API', 'shared sales mailbox', 'orchestrator agent', 'Omnibox', 'credential']) assert.ok(scene.includes(word), word);
  assert.doesNotMatch(plain, /the sales space/i);
});

test('the six kinds of resource are listed, with context as the general kind and connector as one way to get one', () => {
  const hub = section(text, 'What the Context Hub holds');
  assert.match(hub, /six kinds of resource/);
  for (const anchor of ['context', 'knowledge-source', 'datasource', 'skill', 'vector-module']) {
    assert.match(hub, new RegExp(`\\]\\(\\./glossary\\.md#${anchor}\\)`), anchor);
  }
  assert.match(hub, /\]\(\.\.\/vector-apps\/glossary\.md#app\)/);
  assert.match(hub, /\*\*Resources\*\*/);
  assert.match(hub, /A context is the general kind, and a \[connector\]\(\.\/glossary\.md#connector\) is a context made from a pre-built provider/);
  assert.equal([...hub.matchAll(/^- \*\*/gm)].length, 6);
});

test('datasources list exactly four databases and no other database or engine', () => {
  const data = section(text, 'Datasources');
  assert.match(data, /one of four types of database: PostgreSQL, MySQL, SQL Server or Snowflake\./);
  assert.doesNotMatch(plain, /BigQuery|Oracle|MongoDB|SQLite|Trino|polyglot|federat|dialect|transpil/i);
  assert.match(data, /imports the schema/);
  assert.match(data, /Comments that a PostgreSQL database already holds/);
  for (const tab of ['Instructions', 'SQL pairs', 'Saved answers']) assert.ok(data.includes(`**${tab}**`), tab);
  assert.match(data, /never writes SQL/);
  assert.match(data, /the query runs on one datasource, so one question reaches one database/);
  assert.equal(plain.match(/read-only|only reads/g)?.length, 1, 'a datasource query only reads: stated once');
  assert.match(plain, /where each query only reads data and never changes it/);
});

test('APIs and MCP servers give the three routes and the five types of authentication', () => {
  const api = section(text, 'APIs and MCP servers');
  assert.match(api, /OpenAPI description/);
  assert.match(api, /base URL/);
  assert.match(api, /request and response parameters/);
  assert.match(api, /stays on the origin of the base URL/);
  assert.match(api, /GraphQL API\*\*: the operations come from introspection/);
  assert.match(api, /MCP server\*\*: the tools come from discovery/);
  assert.match(api, /five types of authentication: a bearer token, an API key, OAuth, basic authentication or a custom header/);
  assert.match(api, /An API key travels in a header by default, or in the query or in the body\. The space manager sets the header name\./);
  assert.doesNotMatch(api, /header name, /);
  assert.match(api, /Only OAuth tokens refresh on their own/);
  assert.doesNotMatch(api, /bearer[^.]*refresh/i);
  assert.match(api, /A connector skips the import, because its operations are already defined/);
});

test('the Omnibox is defined in the scene where it first appears, with Vector Module linked there', () => {
  const scene = section(text, 'A sales team connects its data');
  assert.match(scene, /The thread appears in the Omnibox, a \[Vector Module\]\(\.\/glossary\.md#vector-module\) that shows the mail threads of a space\./);
  assert.equal(body.indexOf('Omnibox'), body.indexOf('Omnibox, a [Vector Module]'), 'no Omnibox before its definition');
  assert.doesNotMatch(section(text, 'Mailboxes and the Omnibox'), /Vector Module/);
});

test('mailboxes: several in one stream, a shared mailbox is a shared context, send needs Can use on the Omnibox and a share', () => {
  const mail = section(text, 'Mailboxes and the Omnibox');
  assert.match(mail, /shows the threads of several mailboxes in one stream/);
  assert.match(mail, /A shared mailbox is a mailbox context that its owner has shared/);
  assert.match(mail, /holds \[Can use\]\(\.\/glossary\.md#can-use\) on the Omnibox and the mailbox is shared with the member/);
  assert.match(mail, /Restricted mailbox reach its owner and whoever it is shared with/);
  assert.doesNotMatch(plain, /Outlook|Gmail|LinkedIn|Instantly|Unipile/);
});

test('credentials belong to their creator, a shared resource runs on the owner\'s credential, a share names a user, a group or an app', () => {
  const cred = section(text, 'Credentials and sharing');
  assert.match(cred, /\[General access\]\(\.\/glossary\.md#general-access\).*Restricted, Can use or Can edit/);
  assert.match(cred, /A \[share\]\(\.\/glossary\.md#share\) adds a role on top of that/);
  assert.match(cred, /belongs to the person who created it and is never given to anyone, and not even/);
  assert.match(cred, /not even an \[organization admin\]\(\.\/glossary\.md#organization-admin\) can use it/);
  assert.match(cred, /run on the credential of its owner/);
  assert.match(cred, /never get the credential or its target/);
  assert.match(cred, /A share gives a role, Can use or Can edit, to a user or a group, and attaching a context or datasource to a Vector App shares it with that app/);
  assert.doesNotMatch(cred, /roles?\b[^.]*\b(people|subjects?)\b/i);
  assert.match(cred, /\]\(\.\/one-access-model\.md\)/);
});

test('each term is linked at its first use', () => {
  const noDescription = body.replace(/^#+ .*$/gm, '').replace(/Vector Space/g, 'VS');
  for (const [term, anchor] of [
    ['Context Hub', 'context-hub'], ['space', 'space'], ['members', 'member'], ['agents', 'agent'], ['space manager', 'space-manager'],
    ['orchestrator agent', 'orchestrator-agent'], ['Context', 'context'], ['Knowledge source', 'knowledge-source'], ['Datasource', 'datasource'],
    ['widgets', 'widget'], ['Skill', 'skill'], ['Vector Module', 'vector-module'], ['connector', 'connector'], ['Can edit', 'can-edit'],
    ['MCP', 'mcp'], ['Can use', 'can-use'], ['General access', 'general-access'], ['role', 'role'], ['share', 'share'], ['group', 'group'],
    ['organization admin', 'organization-admin'],
  ]) {
    const link = new RegExp(`\\[${term}\\]\\(\\./glossary\\.md#${anchor}\\)`, 'i').exec(noDescription);
    assert.ok(link, `${term} is linked`);
    const before = noDescription.slice(0, link.index).replace(/\]\([^)]*\)/g, ']');
    const bare = new RegExp(`(?<![\\w\\[-])${term}(?![\\w\\]])${term === 'Context' ? '(?! Hub)' : ''}`, /^[A-Z][a-z]+ [a-z]+$|^Can|^Context$/.test(term) ? '' : 'i').exec(before);
    assert.equal(bare, null, `${term} has no bare use before its link`);
  }
});

test('the page names no master doc, implementation name, vendor or banned term', () => {
  const noLinks = body.replace(/\]\([^)]*\)/g, ']');
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|RESOURCES|SPACES|PAGES|MODULES|CATALOG|README|RESOURCE|CALLS|CREDENTIALS)\.md/);
  assert.deepEqual(bannedTermsIn(noLinks), []);
  assert.doesNotMatch(noLinks, /\b(Apollo|Exa|BrightData|Meta|WhatsApp|Messenger|Instagram|ClickUp|Firecrawl|Google|Postgres)\b/);
  assert.doesNotMatch(noLinks, /gensql|ports and adapters|hexagonal|Trino|JWKS|staff vault|provider key|PROVIDER_ACCOUNT/i);
  assert.doesNotMatch(noLinks, /\bgrants?\b/i);
  assert.doesNotMatch(noLinks, /[A-Za-z]+[A-Z][a-z]+\(|[a-z]+_[a-z]+/, 'no function or field name');
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(plain, /TypeScript|Node|React/));

test('every link resolves, and Where to go next has 4 links and the glossary in order', () => {
  assert.deepEqual(brokenLinks(text, file), []);
  assert.deepEqual(linksOf(section(text, 'Where to go next')), [
    './one-access-model.md', './who-can-do-what.md', './extending-a-space.md', './agents-in-a-space.md', './glossary.md',
  ]);
  assert.match(section(text, 'Where to go next'), /^Where to go next\n\nA space manager can now connect a database, an API and a mailbox, and knows whose credential each one runs on\./);
});

test('the page follows the voice checks and has no em dash', () => {
  assert.deepEqual(voiceViolations(text), []);
  assert.doesNotMatch(plain, /—/);
});
