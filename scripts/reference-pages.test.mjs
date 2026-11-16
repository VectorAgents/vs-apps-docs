import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';
import { section, treesOf } from './page-helpers.mjs';
import { descriptionOf, h2Sections, longCells, openingParagraph, overlong, proseOf, tablesOf, withoutCode } from './sdk-page-helpers.mjs';
import { installedSdkVersion } from './starter-sync.mjs';

const read = (name) => {
  const url = new URL(`../docs/sdk/reference/${name}.md`, import.meta.url);
  return existsSync(url) ? readFileSync(url, 'utf8') : '';
};

test('root and react prerequisites pin zod 3 and give the install command', () => {
  for (const name of ['root', 'react']) {
    const prerequisites = section(read(name), 'Prerequisites');
    assert.match(prerequisites, /npm install zod@3\b/, name);
    assert.match(prerequisites, /paramsJsonSchema/, name);
    assert.doesNotMatch(prerequisites, /npm install zod(?!@3)/, name);
  }
});

test('the description sentence states SDK guarantees only', () => {
  const root = read('root');
  assert.doesNotMatch(root, /only guidance/);
  assert.match(root, /in the manifest/);
  assert.doesNotMatch(read('react'), /so the agent sees the actions/);
  assert.match(read('root'), /reports the mounted actions/);
});

const serverTrees = treesOf('sdk/reference/server.md');
const serverTree = (name) => serverTrees.find(({ tree }) => tree === name).text;

test('the server reference is emitted once for each server', () => {
  assert.deepEqual(serverTrees.map(({ tree }) => tree), ['node', 'nest']);
});

test('the Nest.js tree of the server reference keeps the signature and shows a notice instead of the example', () => {
  const nest = serverTree('nest');
  const ping = section(nest, '`pingManifests`');
  for (const heading of ['Signature', 'Behaviour', 'Example']) assert.ok(ping.includes(`### ${heading}`), heading);
  assert.match(nest, /^:::warning\nNot yet written for Nest\.js\.\n:::$/m);
  assert.doesNotMatch(nest, /src\/ping\.ts|defineApp/);
});

test('the server reference documents pingManifests', () => {
  const text = serverTree('node');
  assert.match(text, /^title: Server reference$/m);
  const ping = section(text, '`pingManifests`');
  assert.deepEqual(
    ['Signature', 'Behaviour', 'Example'].filter((h) => !ping.includes(`### ${h}`)),
    [],
  );
  for (const term of ['spaceBaseUrl', 'manifests', 'log', 'Promise<void>', '/api/apps/manifest-ping', 'appKey', 'manifestHash', '429']) {
    assert.ok(ping.includes(term), term);
  }
  assert.match(ping, /never throws/i);
  assert.match(text, /\]\((\.\.\/)+vector-apps\/glossary\.md#manifest\)/);
});

const IMPORT_PATHS = {
  root: '@vectoragents/vs-apps',
  browser: '@vectoragents/vs-apps/browser',
  conformance: '@vectoragents/vs-apps/conformance',
  extract: '@vectoragents/vs-apps/extract',
  harness: '@vectoragents/vs-apps/react/harness',
  orpc: '@vectoragents/vs-apps/orpc',
  react: '@vectoragents/vs-apps/react',
  server: '@vectoragents/vs-apps/server',
};
/** The H2 sections of a page that are guides and not exports. */
const GUIDE_SECTIONS = {
  harness: ['Dev routes', 'Serve the dev routes', 'Accept dev tokens', 'Turn the harness on and off', 'Limits'],
};
const outlinePages = Object.keys(IMPORT_PATHS);
const allPages = [...outlinePages, 'platform-limits'];

/** Runs `check(text, label)` on each generated tree of a reference page. */
const eachTree = (name, check) => {
  for (const { tree, text } of treesOf(`sdk/reference/${name}.md`)) check(text, `${name} ${tree}`.trim());
};

test('every reference page has a one-sentence noun-phrase description of 160 characters or fewer', () => {
  for (const name of allPages) {
    eachTree(name, (text, label) => {
      const description = descriptionOf(text);
      assert.ok(description, `${label}: description`);
      assert.ok(description.length <= 160, `${label}: ${description.length} characters`);
      assert.doesNotMatch(description, /^(This page|Learn|Reference for|Describes)\b/, label);
      assert.equal(description.match(/[.!?](\s|$)/g)?.length, 1, `${label}: one sentence`);
    });
  }
});

test('no reference page holds the SDK version in its text', () => {
  const version = installedSdkVersion().replaceAll('.', '\\.');
  for (const name of allPages) {
    eachTree(name, (text, label) => {
      assert.doesNotMatch(text, new RegExp(`\\b${version}\\b`), label);
      assert.doesNotMatch(text, /`@vectoragents\/vs-apps[^`]*` \d+\.\d+\.\d+/, label);
    });
  }
});

test('the opening paragraph names the subpath and no sentence describes the page itself', () => {
  for (const name of outlinePages) {
    eachTree(name, (text, label) => {
      assert.ok(openingParagraph(text).includes(`\`${IMPORT_PATHS[name]}\``), `${label}: names the subpath`);
      assert.doesNotMatch(text, /Every symbol below|follows one layout|^Reference for\b/m, label);
      assert.doesNotMatch(text, /^## Result$/m, label);
    });
  }
});

test('a reference page has Prerequisites only for more than the installed package', () => {
  for (const name of outlinePages) {
    eachTree(name, (text, label) => {
      assert.doesNotMatch(section(text, 'Prerequisites'), /^- `@vectoragents\/vs-apps` installed/m, label);
    });
  }
});

test('each export has a full-name heading with Signature, Behaviour and Example, in order', () => {
  for (const name of outlinePages) {
    eachTree(name, (text, label) => {
      const skipped = ['Prerequisites', 'Next steps', ...(GUIDE_SECTIONS[name] ?? [])];
      const exports = h2Sections(text).filter(({ title }) => !skipped.includes(title));
      assert.ok(exports.length > 0, label);
      for (const { title, body } of exports) {
        assert.match(title, /^`[^`]+`$/, `${label}: ${title} is a full name in a code span`);
        const parts = [...body.matchAll(/^### (.+)$/gm)].map((m) => m[1]);
        assert.deepEqual(parts.filter((p) => ['Signature', 'Behaviour', 'Example'].includes(p)), ['Signature', 'Behaviour', 'Example'], `${label}: ${title}`);
      }
    });
  }
});

test('the Example of an export is a codeblock titled with a file path', () => {
  for (const name of outlinePages) {
    eachTree(name, (text, label) => {
      if (name === 'server' && label.endsWith('nest')) return;
      for (const { title, body } of h2Sections(text).filter(({ title: t }) => t.startsWith('`'))) {
        assert.match(body.split(/^### Example$/m)[1] ?? '', /^```\w+ title="[^"]+\.\w+"/m, `${label}: ${title}`);
      }
    });
  }
});

test('input tables say whether each field is required, and output tables do not', () => {
  for (const name of outlinePages) {
    eachTree(name, (text, label) => {
      for (const { header, rows } of tablesOf(text)) {
        if (!['Option', 'Prop', 'Parameter', 'Field', 'Property', 'Method'].includes(header[0])) continue;
        const column = header.indexOf('Required');
        if (column < 0) {
          assert.ok(['Property', 'Method', 'Field'].includes(header[0]), `${label}: ${header.join(' | ')}`);
          continue;
        }
        for (const row of rows) assert.match(row[column], /^(required|optional)$/, `${label}: ${row[0]}`);
      }
    });
  }
  const inputs = { server: 'pingManifests', react: 'AppProvider', extract: 'extractAgentCatalog', conformance: 'appPlatformConformance', root: 'defineAgentPage', browser: 'startAppSession' };
  for (const [name, entry] of Object.entries(inputs)) {
    eachTree(name, (text, label) => {
      if (label.endsWith('nest')) return;
      const table = tablesOf(section(text, `\`${entry}\``)).find(({ header }) => header[0] !== 'Property');
      assert.ok(table?.header.includes('Required'), `${label}: ${entry}`);
    });
  }
});

test('every table cell is one sentence of 15 words or fewer', () => {
  for (const name of allPages) eachTree(name, (text, label) => assert.deepEqual(longCells(text), [], label));
});

test('no sentence of prose runs over 35 words', () => {
  for (const name of allPages) eachTree(name, (text, label) => assert.deepEqual(overlong(text), [], label));
});

test('no outline page lists a closed value of platform-limits in prose', () => {
  for (const name of outlinePages) {
    eachTree(name, (text, label) => assert.doesNotMatch(proseOf(text), /AZURE_OPENAI|FIRECRAWL|INSTANTLY|UNIPILE|structuredOutput|toolCalling|rerank/, label));
  }
});

test('a reference page ends with Next steps of 1 to 3 links with a reason each', () => {
  for (const name of allPages) {
    eachTree(name, (text, label) => {
      const next = text.split(/^## /m).at(-1);
      assert.match(next, /^Next steps\n/, label);
      const items = next.split('\n').slice(1).filter((l) => l.trim());
      assert.ok(items.length >= 1 && items.length <= 3, `${label}: ${items.length} links`);
      for (const item of items) assert.match(item, /^- \[[^\]]+\]\([^)]+\): .*\S\.$/, `${label}: ${item}`);
    });
  }
});

test('a page that needs Node.js or React names the minimum version in Prerequisites', () => {
  for (const name of ['extract', 'conformance']) {
    eachTree(name, (text, label) => assert.match(section(text, 'Prerequisites'), /Node\.js 20\.19 or later/, label));
  }
  eachTree('react', (text, label) => assert.match(section(text, 'Prerequisites'), /React 18 or later/, label));
});

test('a page writes "member" for the people who open an app, never "user"', () => {
  for (const name of outlinePages) {
    eachTree(name, (text, label) => {
      assert.doesNotMatch(withoutCode(text).replace(/\buser tokens?\b/gi, ''), /\busers?\b/i, label);
    });
  }
});

test('limits are literal values and errors are quoted exactly', () => {
  eachTree('react', (text, label) => {
    assert.match(text, /within 60 seconds/, label);
    assert.match(text, /up to 3 times/, label);
    assert.doesNotMatch(text, /within a minute|back-off/, label);
    assert.match(text, /`useApp must be used within an AppProvider`/, label);
  });
  eachTree('browser', (text, label) => {
    assert.match(text, /`client config fetch failed: <status>`/, label);
    assert.match(text, /`client config: ALLOWED_PARENT_ORIGIN is not set on the server`/, label);
  });
  eachTree('harness', (text, label) => {
    if (label.endsWith('nest')) return;
    assert.match(text, /`The app server did not answer \/api\/__dev\/manifests`/, label);
  });
});
