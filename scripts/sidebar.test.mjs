import assert from 'node:assert/strict';
import { readdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { default: sidebars } = await import(join(root, 'sidebars.ts'));
const { default: config } = await import(join(root, 'docusaurus.config.ts'));

const pageIds = readdirSync(join(root, 'docs'), { recursive: true })
  .filter((file) => /\.mdx?$/.test(file))
  .map((file) => file.replace(/\.mdx?$/, '').split('\\').join('/'));
const idOf = (item) => (typeof item === 'string' ? item : item.id);
const docIds = (items) => items.flatMap((item) => (item.type === 'category' ? docIds(item.items) : item.type === 'link' ? [] : [idOf(item)]));
const categoryOf = (sidebar, label) => sidebars[sidebar].find((item) => item.type === 'category' && item.label === label);
const topLevel = (sidebar) => sidebars[sidebar].map((item) => (item.type === 'category' ? item.label : item.type === 'link' ? item.label : idOf(item)));

test('no Nest section and no page in a nest folder remain', () => {
  assert.deepEqual(pageIds.filter((id) => id.startsWith('nest/')), []);
  for (const sidebar of Object.values(sidebars)) assert.ok(!sidebar.some((item) => item.label === 'Nest'));
});

test('every page of a section folder appears in exactly one sidebar, and the entry page in none', () => {
  const listed = Object.values(sidebars).flatMap(docIds);
  assert.deepEqual([...listed].sort(), pageIds.filter((id) => id !== 'index').sort());
});

test('each sidebar lists the pages of its own folder only', () => {
  for (const [name, folder] of [['vectorSpace', 'vector-space/'], ['vectorApps', 'vector-apps/'], ['sdk', 'sdk/']]) {
    for (const id of docIds(sidebars[name])) assert.ok(id.startsWith(folder), `${name}: ${id}`);
  }
});

test('the Vector Apps sidebar runs Why Vector Apps, How a Vector App works, Quickstart, Recipes, Guides, Glossary', () => {
  assert.deepEqual(topLevel('vectorApps'), ['vector-apps/why-vector-apps', 'vector-apps/how-a-vector-app-works', 'vector-apps/quickstart', 'Recipes', 'Guides', 'vector-apps/glossary']);
});

test('the SDK sidebar runs SDK overview, App definition, Definition builder, Examples, Reference, Glossary', () => {
  assert.deepEqual(topLevel('sdk'), ['sdk/overview', 'sdk/app-definition', 'Definition builder', 'sdk/examples', 'Reference', 'sdk/glossary']);
  const builder = sidebars.sdk.find((item) => item.label === 'Definition builder');
  assert.equal(builder.href, '/sdk/builder');
});

test('the Reference pages run Root, Server, Browser, React, Harness, oRPC, Extract, Conformance, Platform limits', () => {
  assert.deepEqual(
    docIds(categoryOf('sdk', 'Reference').items).map((id) => id.replace('sdk/reference/', '')),
    ['root', 'server', 'browser', 'react', 'harness', 'orpc', 'extract', 'conformance', 'platform-limits'],
  );
});

test('Glossary is the last item of each section', () => {
  assert.equal(idOf(sidebars.vectorSpace.at(-1)), 'vector-space/glossary');
  assert.equal(idOf(sidebars.vectorApps.at(-1)), 'vector-apps/glossary');
  assert.equal(idOf(sidebars.sdk.at(-1)), 'sdk/glossary');
});

test('the Vector Space sidebar runs the What, Why and How categories, then the Glossary, with no page of their own', () => {
  assert.deepEqual(topLevel('vectorSpace'), ['What', 'Why', 'How', 'vector-space/glossary']);
  for (const label of ['What', 'Why', 'How']) assert.equal(categoryOf('vectorSpace', label).link, undefined, label);
  assert.deepEqual(docIds(categoryOf('vectorSpace', 'What').items).map((id) => id.replace('vector-space/', '')), [
    'what-vector-space-is',
    'organizations-and-spaces',
    'what-a-space-holds',
    'agents-in-a-space',
    'who-can-do-what',
  ]);
  assert.deepEqual(docIds(categoryOf('vectorSpace', 'Why').items).map((id) => id.replace('vector-space/', '')), ['why-vector-space', 'one-access-model', 'the-record-of-work']);
  assert.deepEqual(docIds(categoryOf('vectorSpace', 'How').items).map((id) => id.replace('vector-space/', '')), [
    'how-work-moves-through-a-space',
    'approvals-and-the-command-center',
    'extending-a-space',
  ]);
});

test('the Guides section lists the open-route, connector-events, call-a-model and Call Space guides', () => {
  const guides = docIds(categoryOf('vectorApps', 'Guides').items);
  for (const id of [
    'vector-apps/guides/open-route-and-read-caller',
    'vector-apps/guides/handle-connector-events',
    'vector-apps/guides/call-a-model-from-your-server',
    'vector-apps/guides/call-space-from-your-server',
  ]) {
    assert.ok(guides.includes(id), id);
  }
});

test('Recipes, Guides and Reference open on a generated-index page with a description under their section prefix', () => {
  for (const [sidebar, label, prefix] of [
    ['vectorApps', 'Recipes', '/vector-apps'],
    ['vectorApps', 'Guides', '/vector-apps'],
    ['sdk', 'Reference', '/sdk'],
  ]) {
    const { link } = categoryOf(sidebar, label);
    assert.equal(link?.type, 'generated-index', label);
    assert.ok(link.description?.length > 0, label);
    assert.equal(link.slug, `${prefix}/category/${label.toLowerCase()}`, label);
  }
});

test('the Guides section lists the A2A guide', () => {
  assert.ok(docIds(categoryOf('vectorApps', 'Guides').items).includes('vector-apps/guides/expose-app-as-a2a-agent'));
});

test('the Recipes section lists the five client recipes in the Next-step chain order', () => {
  assert.deepEqual(docIds(categoryOf('vectorApps', 'Recipes').items), [
    'vector-apps/recipes/add-page-and-capability',
    'vector-apps/recipes/gate-by-capability',
    'vector-apps/recipes/read-app-context',
    'vector-apps/recipes/list-members',
    'vector-apps/recipes/expose-agent-actions',
  ]);
});

test('the navbar shows a tab for each sidebar and the builder link', () => {
  const { items } = config.themeConfig.navbar;
  assert.deepEqual(
    items.filter((item) => item.type === 'docSidebar').map((item) => [item.sidebarId, item.label]),
    [['vectorSpace', 'Vector Space'], ['vectorApps', 'Vector Apps'], ['sdk', 'vs-apps SDK']],
  );
  assert.ok(items.some((item) => item.to === '/sdk/builder' && item.label === 'Definition builder'));
});
