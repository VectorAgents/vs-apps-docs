import assert from 'node:assert/strict';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';
import { after, test } from 'node:test';
import { generate } from './generate.mjs';

const config = {
  docsRoot: 'docs',
  outDir: 'docs-gen',
  todoCap: 5,
  axes: { client: { react: 'React' }, server: { node: 'Node.js + TypeScript', nest: 'Nest.js' } },
  defaults: { client: 'react', server: 'node' },
};

const sandboxes = [];
after(() => sandboxes.forEach((dir) => rmSync(dir, { recursive: true, force: true })));

/** Writes `pages` (path to text) under a temp project and runs the generator on it. */
function run(pages, overrides = {}) {
  const root = mkdtempSync(join(tmpdir(), 'generate-test-'));
  sandboxes.push(root);
  const merged = { ...config, ...overrides };
  for (const [path, body] of Object.entries(pages)) {
    mkdirSync(dirname(join(root, merged.docsRoot, path)), { recursive: true });
    writeFileSync(join(root, merged.docsRoot, path), body);
  }
  const result = generate({ root, config: merged });
  const out = join(root, merged.outDir);
  const read = (path) => readFileSync(join(out, path), 'utf8');
  const files = () => readdirSync(out, { recursive: true }).filter((f) => /\.mdx?$/.test(f)).map((f) => f.replaceAll('\\', '/')).sort();
  return { result, read, files, exists: (path) => existsSync(join(out, path)), root, out };
}

const server = (extra = '') => `---\ntitle: Server page\n---\n\nShared prose.\n\n<!-- flavour node -->\nNODE BODY\n<!-- /flavour -->\n\n<!-- flavour nest -->\nNEST BODY\n<!-- /flavour -->\n${extra}`;
const hook = '<!-- flavour react -->\nREACT\n<!-- /flavour -->\n';
const both = '<!-- flavour react -->\nR\n<!-- /flavour -->\n<!-- flavour node -->\nN\n<!-- /flavour -->\n<!-- flavour nest -->\nS\n<!-- /flavour -->\n';

test('a neutral page goes to site/ with a neutral flag in its front matter and has no pair copy', () => {
  const page = '---\ntitle: Plain\n---\n\nSee [other](./other.md#part).\n';
  const { files, read } = run({ 'plain.md': page, 'other.md': '# Other\n' });
  assert.deepEqual(files(), ['site/other.md', 'site/plain.md']);
  assert.equal(read('site/plain.md'), '---\ntitle: Plain\nneutral: true\n---\n\nSee [other](./other.md#part).\n');
  assert.equal(read('site/other.md'), '---\nneutral: true\n---\n# Other\n');
});

test('a file that is not a page is copied to site/ byte for byte', () => {
  const { read } = run({ 'plain.md': '# P\n', 'data.json': '{ "a": 1 }\n' });
  assert.equal(read('site/data.json'), '{ "a": 1 }\n');
});

test('a flavoured page is written once to site/, at its own path, with no stub or per-flavour copy', () => {
  const { files } = run({ 'guides/call.md': server() });
  assert.deepEqual(files().filter((f) => f.startsWith('site/')), ['site/guides/call.md']);
});

test('the site page keeps the shared text and wraps each flavour block with its axis, flavour and label', () => {
  const { read } = run({ 'guides/call.md': server() });
  const page = read('site/guides/call.md');
  assert.match(page, /^---\ntitle: Server page\n---\n/);
  assert.match(page, /Shared prose\./);
  assert.doesNotMatch(page, /<!-- \/?flavour|neutral/);
  assert.match(
    page,
    /<div className="flavour-block" data-axis="server" data-flavour="node">\n\n<p className="flavour-label">Node\.js \+ TypeScript<\/p>\n\nNODE BODY\n\n<\/div>/,
  );
  assert.match(
    page,
    /<div className="flavour-block" data-axis="server" data-flavour="nest">\n\n<p className="flavour-label">Nest\.js<\/p>\n\nNEST BODY\n\n<\/div>/,
  );
});

test('a page without front matter keeps none', () => {
  const { read } = run({ 'quickstart.md': '# Quickstart\n\n<!-- flavour node -->\nA\n<!-- /flavour -->\n<!-- flavour nest -->\nB\n<!-- /flavour -->\n' });
  assert.match(read('site/quickstart.md'), /^# Quickstart\n/);
});

test('a client-only page is one site page with a block for its client flavour', () => {
  const page = `---\ntitle: Hook\n---\n\n${hook}`;
  const { files, read } = run({ 'recipes/hook.md': page });
  assert.deepEqual(files().filter((f) => f.startsWith('site/')), ['site/recipes/hook.md']);
  assert.match(read('site/recipes/hook.md'), /data-axis="client" data-flavour="react">\n\n<p className="flavour-label">React<\/p>\n\nREACT\n\n<\/div>/);
});

test('each pair gets a copy of every flavoured page with its own blocks only, and no markers or wrappers', () => {
  const { files, read } = run({ 'guides/call.md': server() });
  assert.deepEqual(files().filter((f) => f.startsWith('pairs/')), ['pairs/react/nest/guides/call.md', 'pairs/react/node/guides/call.md']);
  const node = read('pairs/react/node/guides/call.md');
  assert.match(node, /^---\ntitle: Server page\n---\n/);
  assert.match(node, /Shared prose\./);
  assert.match(node, /NODE BODY/);
  assert.doesNotMatch(node, /NEST BODY|flavour|<div/);
  const nest = read('pairs/react/nest/guides/call.md');
  assert.match(nest, /NEST BODY/);
  assert.doesNotMatch(nest, /NODE BODY/);
});

test('a both-axis page carries the blocks of both axes in each pair copy', () => {
  const { read } = run({ 'quickstart.md': `---\ntitle: Both\n---\n\n${both}` });
  const nest = read('pairs/react/nest/quickstart.md');
  assert.match(nest, /\nR\n/);
  assert.match(nest, /\nS\n/);
  assert.doesNotMatch(nest, /\nN\n/);
});

test('a link stays as written in the site page and in the pair copy', () => {
  const link = '\nSee [call](../guides/call.md#part) and [glossary](../glossary.md#term).\n';
  const { read } = run({ 'guides/call.md': server(), 'other/page.md': server(link), 'glossary.md': '# G\n' });
  const written = /See \[call\]\(\.\.\/guides\/call\.md#part\) and \[glossary\]\(\.\.\/glossary\.md#term\)\./;
  assert.match(read('site/other/page.md'), written);
  assert.match(read('pairs/react/node/other/page.md'), written);
});

const withTodo = (flavour, rest) => `---\ntitle: Gap\n---\n\n<!-- flavour ${flavour} todo -->\n<!-- /flavour -->\n\n${rest}`;

test('a todo block renders a notice in its wrapper on the site page and in the pair copy of its flavour', () => {
  const { read, result } = run({ 'open-route.md': withTodo('node', '<!-- flavour nest -->\nNEST BODY\n<!-- /flavour -->\n') });
  assert.match(
    read('site/open-route.md'),
    /<div className="flavour-block" data-axis="server" data-flavour="node">\n\n<p className="flavour-label">Node\.js \+ TypeScript<\/p>\n\n:::warning\nNot yet written for Node\.js \+ TypeScript\.\n:::\n\n<\/div>/,
  );
  assert.match(read('pairs/react/node/open-route.md'), /^:::warning\nNot yet written for Node\.js \+ TypeScript\.\n:::$/m);
  assert.doesNotMatch(read('pairs/react/nest/open-route.md'), /Not yet written/);
  assert.equal(result.todos, 1);
});

test('the generator fails when open todo blocks exceed the cap', () => {
  const pages = { 'a.md': withTodo('node', both.replace(/<!-- flavour node -->\nN\n<!-- \/flavour -->\n/, '')) };
  assert.throws(() => run(pages, { todoCap: 0 }), /1 open todo notice exceeds the cap of 0/);
  assert.doesNotThrow(() => run(pages, { todoCap: 1 }));
});

const fails = (page, pattern, overrides) => assert.throws(() => run({ 'guides/x.md': page }, overrides), pattern);

test('an unclosed block fails with the file and the opening line', () => {
  fails('# X\n\n<!-- flavour node -->\ncode\n', /docs\/guides\/x\.md:3: block "node" is not closed/);
});

test('a closing marker without a block fails', () => {
  fails('# X\n<!-- /flavour -->\n', /docs\/guides\/x\.md:2: closing marker outside a block/);
});

test('a block inside a block fails', () => {
  fails('<!-- flavour node -->\n<!-- flavour nest -->\n<!-- /flavour -->\n<!-- /flavour -->\n', /docs\/guides\/x\.md:2: block "nest" opens inside block "node"/);
});

test('an unknown flavour name fails', () => {
  fails('<!-- flavour python -->\nx\n<!-- /flavour -->\n', /docs\/guides\/x\.md:1: unknown flavour "python"/);
});

test('a marker that does not match the syntax fails', () => {
  fails('<!-- flavour node  todo -->\n', /docs\/guides\/x\.md:1: malformed marker/);
  fails('<!--flavour node-->\n', /docs\/guides\/x\.md:1: malformed marker/);
});

test('a page that varies on an axis needs a block or a todo for every flavour of it', () => {
  fails('<!-- flavour node -->\nx\n<!-- /flavour -->\n', /docs\/guides\/x\.md: no block or todo for flavour "nest"/);
  fails('<!-- flavour node todo -->\n<!-- /flavour -->\n<!-- flavour nest todo -->\n<!-- /flavour -->\n', /docs\/guides\/x\.md: every block of axis "server" is todo/);
});

test('every marker error is reported in one run', () => {
  assert.throws(
    () => run({ 'a.md': '<!-- flavour python -->\n', 'b.md': '<!-- /flavour -->\n' }),
    (error) => /a\.md:1: unknown flavour/.test(error.message) && /b\.md:1: closing marker outside a block/.test(error.message),
  );
});

test('a flavour name must belong to one axis', () => {
  const axes = { client: { react: 'React', node: 'Node client' }, server: { node: 'Node.js' } };
  fails('plain\n', /flavour name "node" is on both axis "client" and axis "server"/, { axes });
});

test('a flavour name must differ from every top-level docs folder', () => {
  assert.throws(() => run({ 'nest/a.md': '# A\n' }), /flavour name "nest" is also a top-level folder of docs/);
});

test('a nested folder named like a flavour is allowed', () => {
  assert.doesNotThrow(() => run({ 'guides/nest/a.md': '# A\n' }));
});

test('the docs root and output folder come from config', () => {
  const { exists } = run({ 'guides/call.md': server(), 'plain.md': '# P\n' }, { docsRoot: 'content/sdk', outDir: 'build/gen' });
  assert.ok(exists('site/plain.md') && exists('site/guides/call.md') && exists('pairs/react/node/guides/call.md'));
});

test('flavours.json lists each flavoured page with its URL, axes and the pair copy that holds each tree', () => {
  const { read } = run({ 'quickstart.md': both, 'plain.md': '# P\n', 'recipes/index.md': server() });
  assert.deepEqual(JSON.parse(read('flavours.json')).pages, [
    {
      source: 'quickstart.md',
      url: '/quickstart',
      axes: ['client', 'server'],
      trees: [
        { flavours: { client: 'react', server: 'node' }, file: 'pairs/react/node/quickstart.md' },
        { flavours: { client: 'react', server: 'nest' }, file: 'pairs/react/nest/quickstart.md' },
      ],
    },
    {
      source: 'recipes/index.md',
      url: '/recipes',
      axes: ['server'],
      trees: [
        { flavours: { server: 'node' }, file: 'pairs/react/node/recipes/index.md' },
        { flavours: { server: 'nest' }, file: 'pairs/react/nest/recipes/index.md' },
      ],
    },
  ]);
});

test('the shipped config writes a page without a flavour marker to site/ unchanged but for the neutral flag, and lists the others', () => {
  const repo = join(dirname(fileURLToPath(import.meta.url)), '..');
  const shipped = JSON.parse(readFileSync(join(repo, 'flavours.config.json'), 'utf8'));
  const out = mkdtempSync(join(tmpdir(), 'generate-site-'));
  sandboxes.push(out);
  const { todos } = generate({ root: repo, config: { ...shipped, outDir: relative(repo, out) } });
  const sources = readdirSync(join(repo, shipped.docsRoot), { recursive: true, withFileTypes: true }).filter((e) => e.isFile());
  assert.ok(sources.length > 20);
  const flavoured = [];
  for (const entry of sources) {
    const rel = relative(join(repo, shipped.docsRoot), join(entry.parentPath, entry.name));
    const text = readFileSync(join(repo, shipped.docsRoot, rel), 'utf8');
    if (/^<!-- flavour /m.test(text)) flavoured.push(rel);
    else if (/\.mdx?$/.test(rel)) assert.match(readFileSync(join(out, 'site', rel), 'utf8'), /^---\n(?:[\s\S]*?\n)?neutral: true\n---\n/, rel);
    else assert.deepEqual(readFileSync(join(out, 'site', rel), 'utf8'), text, rel);
  }
  assert.deepEqual(JSON.parse(readFileSync(join(out, 'flavours.json'), 'utf8')).pages.map((page) => page.source).sort(), flavoured.sort());
  assert.ok(todos <= shipped.todoCap);
});
