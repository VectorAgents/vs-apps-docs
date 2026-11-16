import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { test } from 'node:test';
import { codeOf, lastStep, nextLinks, section, titledSnippets, treesOf } from './page-helpers.mjs';

const NOTICE = /^:::warning\nNot yet written for Node\.js \+ TypeScript\.\n:::$/m;
const FLAVOUR_NOTE = /^This guide covers a Nest\.js server\.$/m;

for (const name of ['open-route-and-read-caller', 'handle-connector-events']) {
  const trees = treesOf(`vector-apps/guides/${name}.md`);
  const nest = trees.find(({ tree }) => tree === 'nest')?.text ?? '';
  const node = trees.find(({ tree }) => tree === 'node')?.text ?? '';

  test(`${name}: emitted once for each server`, () => {
    assert.deepEqual(trees.map(({ tree }) => tree), ['node', 'nest']);
  });

  test(`${name}: the Node.js tree is a notice`, () => {
    assert.match(node, NOTICE);
    assert.doesNotMatch(node, /^## /m);
  });

  test(`${name}: one neutral sentence says the page covers a Nest.js server, in both trees`, () => {
    assert.match(node, FLAVOUR_NOTE);
    assert.match(nest, FLAVOUR_NOTE);
    const source = readFileSync(new URL(`../docs/vector-apps/guides/${name}.md`, import.meta.url), 'utf8');
    const outsideBlocks = source.replace(/<!-- flavour [^>]*-->[\s\S]*?<!-- \/flavour -->/g, '');
    assert.match(outsideBlocks, FLAVOUR_NOTE);
  });

  test(`${name}: the Nest.js tree has the guide sections and no notice`, () => {
    assert.doesNotMatch(nest, /Not yet written/);
    const titles = nest.split(/^## /m).slice(1).map((s) => s.split('\n')[0]);
    assert.deepEqual(titles, ['Prerequisites', 'Steps', 'Next steps']);
  });

  test(`${name}: builds on the quickstart app, not on nest-adapter`, () => {
    const prerequisites = section(nest, 'Prerequisites');
    assert.match(prerequisites, /quickstart/);
    assert.doesNotMatch(nest, /nest-adapter/);
  });

  test(`${name}: every snippet title starts with client/, server/ or shared/ and the blocks keep type-only injection`, () => {
    for (const { title } of titledSnippets(nest)) assert.match(title, /^(server|shared)\//);
    assert.doesNotMatch(nest, /@Inject\(/);
  });

  test(`${name}: Next steps is one link to the quickstart`, () => {
    assert.deepEqual(nextLinks(nest).map((l) => l.replace(/^(\.\.\/)+/, '')), ['quickstart.md#part-2-add-the-app-to-a-space']);
  });
}

const openRoute = treesOf('vector-apps/guides/open-route-and-read-caller.md').find(({ tree }) => tree === 'nest').text;

test('the open-route guide shows @Public, appCaller and AppRequest in labelled server files', () => {
  const body = titledSnippets(openRoute).filter(({ title }) => title.startsWith('server/')).map(({ body }) => body).join('\n');
  assert.match(body, /@Public\(\)/);
  assert.match(body, /\bappCaller\(/);
  assert.match(body, /\bAppRequest\b/);
  assert.match(body, /\bimport \{[^}]*\bappCaller\b[^}]*\} from '@vectoragents\/vs-apps\/nest'/);
});

test('the open-route guide checks that the open route answers 200 and the caller route answers 401 with no token', () => {
  const check = lastStep(openRoute);
  const curls = [...check.matchAll(/^curl .*localhost:<SERVER_PORT>\/api\/([\w-]+)$/gm)].map((m) => m[1]);
  assert.equal(curls.length, 2);
  assert.match(check, /`200`[\s\S]*`401`/);
});

const connector = treesOf('vector-apps/guides/handle-connector-events.md').find(({ tree }) => tree === 'nest').text;
const connectorCode = titledSnippets(connector)
  .filter(({ title }) => /^(server|shared)\//.test(title))
  .map(({ body }) => body)
  .join('\n');

test('the connector-events guide registers a handler with ConnectorEventsService and checks a ConnectorExecuteResult', () => {
  assert.match(connectorCode, /\bimport \{[^}]*\bConnectorEventsService\b[^}]*\} from '@vectoragents\/vs-apps\/nest'/);
  assert.match(connectorCode, /\.on\(\s*\{[^}]*\bappKey\b[^}]*\bslot\b[^}]*\bhandler\b/);
  assert.match(connectorCode, /\bimport type \{[^}]*\bConnectorExecuteResult\b[^}]*\} from '@vectoragents\/vs-apps'/);
  assert.match(connectorCode, /\bPromise<ConnectorExecuteResult>/);
  assert.match(connectorCode, /\.status\b/);
});

test('the connector-events guide declares the slot with a handler key that the code registers', () => {
  const declared = [...connector.matchAll(/^\s+key: '([\w-]+)',\n\s+label: '[^']+',\n\s+defaultEventTypes/gm)].map((m) => m[1]);
  assert.equal(declared.length, 1);
  assert.match(connectorCode, new RegExp(`handler: '${declared[0]}'`));
  assert.ok(codeOf(connector, 'support-slot.ts'));
});

test('the connector-events guide checks that the events route refuses a request with no token', () => {
  const check = lastStep(connector);
  assert.equal([...check.matchAll(/^curl .*localhost:<SERVER_PORT>\/api\/events\/hello-app/gm)].length, 1);
  assert.match(check, /`401`/);
});
