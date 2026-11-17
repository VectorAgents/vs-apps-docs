import assert from 'node:assert/strict';
import { test } from 'node:test';
import { bodyOf, linksOf, section, treesOf } from './page-helpers.mjs';
import { CLI_PACKAGE } from './starter-source.mjs';
import { voiceViolations } from './voice.mjs';

const SCAFFOLD = `npm create ${CLI_PACKAGE.replace('/create-', '/')}`;
const trees = treesOf('vector-apps/quickstart.md');

test('the quickstart is emitted once per pair, react with node and with nest', () => {
  assert.deepEqual(trees.map(({ tree }) => tree), ['react/node', 'react/nest']);
});

test('Part 2 is the same text in every tree', () => {
  const [first, ...rest] = trees.map(({ text }) => section(text, 'Part 2'));
  for (const part of rest) assert.equal(part, first);
});

for (const { tree, text } of trees) {
  const server = tree.split('/')[1];
  const nest = server === 'nest';
  const t = (name, fn) => test(`[${tree}] ${name}`, fn);
  const sections = text.split(/^## /m).slice(1);
  const titles = sections.map((s) => s.split('\n')[0]);
  const codeBlocks = [...text.matchAll(/^```(\w+)([^\n]*)\n([\s\S]*?)^```/gm)].map(([, lang, meta, body]) => ({ lang, meta, body }));
  const part1 = section(text, 'Part 1');
  const part2 = section(text, 'Part 2');
  const opening = bodyOf(text).trim().split('\n\n')[0];
  const description = text.match(/^description: (.*)$/m)?.[1] ?? '';
  const firstCommand = text.indexOf('```');
  const subsections = (part) => part.split(/^### /m).slice(1);
  const steps = (part) => subsections(part).filter((s) => /^\d+\. /.test(s));
  const title = (step) => step.split('\n')[0];
  const hasCheck = (step) => step.includes('**Check**');
  const count = (re) => (text.match(re) ?? []).length;
  const prose = text
    .replace(/^---\n[\s\S]*?\n---\n/, '')
    .replace(/^```[\s\S]*?^```/gm, '')
    .replace(/^#{1,6} .*$/gm, '');
  /** The link targets of the page with the generator's relative prefix removed. */
  const bare = (link) => link.replace(/^(\.\.?\/)+/, '');
  const targets = linksOf(text).map(bare);

  t('follows the tutorial voice checked by voiceViolations', () => {
    assert.deepEqual(voiceViolations(text), []);
  });

  t('leaves no flavour marker behind', () => {
    assert.doesNotMatch(text, /<!--\s*\/?flavour/);
  });

  t('follows the page order', () => {
    assert.deepEqual(titles, ['Prerequisites', 'Part 1: Run the app locally', 'Part 2: Add the app to a space', 'Next steps']);
  });

  t('has a description of one sentence, 160 characters or fewer, that starts with a verb', () => {
    assert.ok(description.length > 0 && description.length <= 160, description);
    assert.match(description, /^[A-Z][a-z]+ /);
    assert.doesNotMatch(description, /^(This|Learn|Here)\b/);
    assert.equal(description.split(/(?<=\.)\s/).length, 1);
    assert.match(description, /\.$/);
  });

  t('has the Quickstart frontmatter title and a one-paragraph opening that links Space', () => {
    assert.match(text, /^---\ntitle: Quickstart\n/);
    assert.doesNotMatch(opening, /^#/);
    assert.match(opening, /\]\((\.\.?\/)+vector-space\/glossary\.md#vector-space\)/);
  });

  t('the opening states what you build, the result and one security sentence, with no code before the first command', () => {
    assert.match(opening, /harness/);
    assert.match(opening, /add it to a \[space\]/);
    assert.match(opening, /Build a small app/);
    assert.doesNotMatch(opening, /\bclone/i);
    assert.match(opening, /A check in the browser is display only: the server check decides\./);
    assert.doesNotMatch(opening, /\busers?\b/);
    const before = text.slice(0, firstCommand);
    assert.doesNotMatch(before, /```mermaid/);
    assert.doesNotMatch(before, /hello-app\/\n/);
    assert.equal(before.split('```').length - 1, 0);
  });

  t('the first diagram sits in the step that opens the app page, after the first command', () => {
    const diagrams = codeBlocks.filter((f) => f.lang === 'mermaid');
    assert.equal(diagrams.length, 2);
    assert.ok(text.indexOf('```mermaid') > firstCommand);
    const open = steps(part2)[5];
    assert.equal(open.split('```mermaid').length, 2);
    const { body } = diagrams.at(-1);
    assert.ok(open.includes(body));
    assert.match(body, /^sequenceDiagram$/m);
    assert.match(body, /^\s+accTitle: \S/m);
    assert.match(body, /^\s+accDescr: \S/m);
    assert.equal([...body.matchAll(/^\s+participant \w+ as /gm)].length, 4);
    assert.match(body, /display only/);
    assert.match(open.split('</DiagramControls>')[1], /the public keys that Vector Space publishes\.\n\n\*\*Check\*\*/);
  });

  t('each mermaid code block sits inside DiagramControls, imported right after the opening paragraph', () => {
    const [openingParagraph, importLine] = bodyOf(text).trim().split('\n\n');
    assert.doesNotMatch(openingParagraph, /DiagramControls/);
    assert.equal(importLine, "import DiagramControls from '@site/src/components/DiagramControls';");
    const wrapped = (after) => new RegExp(`<DiagramControls>\\n\\n\`\`\`mermaid\\n(?:(?!\`\`\`)[\\s\\S])*\`\`\`\\n\\n</DiagramControls>\\n\\n${after}`);
    assert.match(text, wrapped('Vector Space mints the token'));
    assert.match(text, wrapped('Step \\(3\\) of the harness diagram produces'));
    assert.equal(count(/<DiagramControls>/g), 2);
  });

  t('step 2 shows the harness diagram after the dev server code block and before the Check', () => {
    const run = steps(part1)[2];
    assert.equal(run.split('```mermaid').length, 2);
    const [beforeCodeBlock, afterCodeBlock] = run.split('```mermaid');
    assert.match(beforeCodeBlock, /```bash\nnpm run dev\n```\n\nOpen `http:\/\/localhost:5173\/harness\.html`[^\n]*\n\n<DiagramControls>\n\n$/);
    const [body, afterBody] = afterCodeBlock.split(/^```$/m);
    assert.match(body, /^sequenceDiagram$/m);
    assert.match(body, /^\s+accTitle: \S/m);
    assert.match(body, /^\s+accDescr: \S/m);
    assert.equal([...body.matchAll(/^\s+participant \w+ as /gm)].length, 4);
    assert.match(body, /display only/);
    assert.match(afterBody, /^\n\n<\/DiagramControls>\n\nStep \(3\) of the harness diagram produces `Verified in the browser`\. Steps \(5\) and \(6\) produce `Verified on the server`\.\n\n\*\*Check\*\*/);
  });

  t('prerequisites are one app-side checklist and state the baseline once', () => {
    const prerequisites = section(text, 'Prerequisites');
    const items = prerequisites.split('\n').filter((l) => /^- /.test(l));
    assert.equal(items.length, 3);
    for (const line of items) assert.match(line, /^- \[ \] /);
    assert.match(prerequisites, /`npm` and \[Node\.js\]\(https:\/\/nodejs\.org\/en\/download\) 22\.12 or later\./);
    assert.doesNotMatch(prerequisites, /20\.19|LTS/);
    assert.match(prerequisites, /For Part 2 only: staff who register the app\. Part 1 needs no staff\./);
    assert.match(prerequisites, /`read:packages`/);
    assert.match(prerequisites, /\(classic\)/);
    assert.equal(count(/\[Node\.js\]\(/g), 1);
    assert.doesNotMatch(prerequisites, /\bGit\b/);
    assert.doesNotMatch(prerequisites, /space admin|published agent|Space server/i);
  });

  t('Part 1 has steps 0 to 5, with the registry access first and the run third', () => {
    assert.deepEqual(steps(part1).map(title), [
      '0. Set up access to the package registry',
      '1. Scaffold the app',
      '2. Run the app in the harness',
      '3. Read the app definition',
      '4. Verify the token on the server',
      '5. Read the token in the app page',
    ]);
  });

  t('Part 2 has Before you start, then six steps with roles only on steps 3, 4 and 5', () => {
    const [intro, ...rest] = subsections(part2);
    assert.equal(title(intro), 'Before you start');
    const items = intro.split('\n').filter((l) => /^- /.test(l));
    assert.equal(items.length, 4);
    for (const line of items) assert.match(line, /^- \[ \] /);
    assert.deepEqual(rest.map(title), [
      '1. Point the app at Vector Space',
      '2. Ask staff to register the app',
      '3. Publish the space agent',
      '4. Add the app to a space',
      '5. Share the app with a member',
      '6. Open the app page',
    ]);
    assert.match(intro, /\]\(#3-publish-the-space-agent\)/);
    assert.ok(rest[2].includes('**Role**: organization admin.'));
    const roled = rest.filter((step) => step.includes('**Role**: space admin.'));
    assert.deepEqual(roled.map(title), rest.slice(3, 5).map(title));
    assert.equal([...part2.matchAll(/\*\*Role\*\*: space admin\./g)].length, 2);
    assert.match(text, /An \[organization admin\]\([^)]*\), [^.]*, to do \[step 3 of Part 2\]\(#3-publish-the-space-agent\)\. A space admin to do steps 4 and 5 of Part 2\./);
    assert.match(text, /then continue at step 4 of Part 2\. \*\*Hello app\*\* appears/);
    assert.match(intro, /^- \[ \] Your Vector representative, one of the staff who register apps, to send the registration request to\. Staff also supply the origin of the Vector Space API and the origin of the Vector Space web client\.$/m);
    assert.equal((part2.match(/Vector representative/g) ?? []).length, 2);
    assert.doesNotMatch(part2, /organization license|Vector staff|Ask Vector|Contact your Vector/i);
    assert.doesNotMatch(part2, /\bstep [0-9](?! of Part [12])/);
    assert.doesNotMatch(part2, /\bSteps [0-9](?:, [0-9])*(?: and [0-9]| to [0-9])(?! of Part [12])/);
    assert.doesNotMatch(text, /Each step names the role/);
  });

  t('Checks sit in Part 1 steps 0, 1 and 2 and in every Part 2 step', () => {
    assert.deepEqual(steps(part1).map(hasCheck), [true, true, true, false, false, false]);
    for (const step of steps(part2)) assert.ok(hasCheck(step), title(step));
  });

  t('step 0 sets the two ~/.npmrc lines and exports the token, with the PowerShell form', () => {
    const [access] = steps(part1);
    const npmrc = codeBlocks.find((f) => /title="~\/\.npmrc"/.test(f.meta));
    assert.ok(npmrc, 'a code block titled ~/.npmrc');
    const lines = npmrc.body.trim().split('\n');
    assert.deepEqual(lines, [
      '# added-start',
      '@vectoragents:registry=https://npm.pkg.github.com',
      '//npm.pkg.github.com/:_authToken=${GITHUB_PACKAGES_TOKEN}',
      '# added-end',
    ]);
    assert.ok(access.includes(npmrc.body));
    assert.equal(count(/export GITHUB_PACKAGES_TOKEN=/g), 1);
    assert.match(access, /^export GITHUB_PACKAGES_TOKEN=YOUR_GITHUB_PACKAGES_TOKEN$/m);
    assert.match(access, /^In PowerShell, run `\$env:GITHUB_PACKAGES_TOKEN = "YOUR_GITHUB_PACKAGES_TOKEN"` instead of the `export` line\./m);
    assert.match(access, /^\*\*Check\*\*: run `npm view @vectoragents\/vs-apps version`/m);
    assert.doesNotMatch(text, /_authToken=[A-Za-z0-9_]{20,}/);
  });

  t('one tree of the generated layout, in the step that reads the files, with no per-step trees or new markers', () => {
    const layouts = codeBlocks.filter((f) => f.lang === 'text' && /^hello-app\/$/m.test(f.body));
    assert.equal(layouts.length, 1);
    assert.ok(steps(part1)[3].includes(layouts[0].body));
    assert.ok(text.indexOf(layouts[0].body) > text.indexOf('npm run dev'));
    for (const name of ['client/', 'server/', 'shared/', '.env.example', '.npmrc', 'index.html', 'main.tsx', 'vite.config.ts']) {
      assert.ok(layouts[0].body.includes(name), name);
    }
    assert.doesNotMatch(layouts[0].body, /node_modules|package-lock|agent-catalog/);
    assert.doesNotMatch(text, /# new\b/);
  });

  t('the tree lists the files of the server flavour', () => {
    const [layout] = codeBlocks.filter((f) => f.lang === 'text' && /^hello-app\/$/m.test(f.body));
    const files = nest
      ? ['app.module.ts', 'credential-store.ts', 'hello.controller.ts', 'main.ts', 'manifests.ts']
      : ['auth.ts', 'credential-store.ts', 'dev-issuer.ts', 'main.ts', 'manifests.ts', 'platform.ts'];
    for (const file of files) assert.ok(layout.body.includes(file), file);
    for (const file of nest ? ['auth.ts', 'dev-issuer.ts', 'platform.ts'] : ['app.module.ts', 'hello.controller.ts']) assert.ok(!layout.body.includes(file), file);
  });

  t('the scaffold step shows the command for this pair with the `--` and no clone', () => {
    const scaffold = steps(part1)[1];
    assert.match(scaffold, new RegExp(`^${SCAFFOLD} hello-app -- --client react --server ${server}$`, 'm'));
    assert.equal(count(/^npm create /gm), 1);
    assert.match(scaffold, /^cd hello-app$/m);
    assert.match(scaffold, /`--`/);
    assert.match(scaffold, /^\*\*Check\*\*: run `npm ls @vectoragents\/vs-apps`/m);
    assert.doesNotMatch(text, /git clone|\bcloned?\b|STARTER_URL/i);
    assert.doesNotMatch(text, /^npm install$/m);
  });

  t('commands run in the step that needs them', () => {
    const list = steps(part1);
    assert.match(list[2], /^npm run dev$/m);
    assert.match(list[2], /http:\/\/localhost:5173\/harness\.html/);
    assert.match(list[2], /port 3101/);
    assert.match(list[2], /port 5173/);
    assert.match(list[2], /Waiting for Space\./);
    const space = steps(part2)[0];
    assert.match(space, /^cp \.env\.example \.env$/m);
    assert.match(space, /^npm run dev:space$/m);
    for (const name of ['SPACE_JWKS_URL', 'SPACE_API_URL', 'ALLOWED_PARENT_ORIGIN', 'PUBLIC_BASE_URL', 'SERVER_PORT', 'CLIENT_PORT']) {
      assert.match(space, new RegExp(`^- \`${name}\``, 'm'), name);
    }
    assert.match(space, /^200 \{"keys":\[$/m);
    assert.match(space, /\/api\/\.well-known\/apps\/jwks\.json/);
    for (const dropped of ['dev:server', 'dev:client', 'check:server', 'SPACE_BASE_URL']) {
      assert.doesNotMatch(text, new RegExp(dropped));
    }
  });

  t('Part 2 defines SPACE_API_URL with its exact shape and says what the start-up ping shows', () => {
    const env = steps(part2)[0];
    const bullet = env.split('\n').find((l) => l.startsWith('- `SPACE_API_URL`'));
    assert.ok(bullet);
    assert.match(bullet, /origin of the Vector Space API followed by `\/api`/);
    assert.match(bullet, /`https:\/\/space-api\.example\.com\/api`/);
    assert.match(bullet, /no trailing slash/);
    assert.match(env, /`npm run dev` clears `SPACE_API_URL`/);
    assert.match(env, /pings Vector Space/);
    assert.doesNotMatch(env, /prints nothing when the ping works|Manifest ping sent for/);
    assert.match(env, /manifest ping for "hello-app" got/);
    assert.match(env, /server keeps running/);
  });

  t('step 4 shows the files of the server flavour', () => {
    const verify = steps(part1)[4];
    const shown = [...verify.matchAll(/title="([^"]+)"/g)].map((m) => m[1]);
    assert.deepEqual(
      shown,
      nest
        ? ['server/src/hello.controller.ts', 'server/src/manifests.ts', 'server/src/credential-store.ts', 'server/src/app.module.ts', 'server/src/main.ts']
        : ['server/src/auth.ts', 'server/src/main.ts', 'server/src/manifests.ts', 'server/src/credential-store.ts', 'server/src/platform.ts', 'server/src/main.ts'],
    );
  });

  t('the Node.js excerpts show the platform in the request handler and the start-up ping; the Nest.js ones show the module', () => {
    const mains = codeBlocks.filter((f) => /title="server\/src\/main\.ts"/.test(f.meta));
    if (nest) {
      assert.equal(mains.length, 1);
      assert.match(mains[0].body, /app\.setGlobalPrefix\('api'\);/);
      const module = codeBlocks.find((f) => /title="server\/src\/app\.module\.ts"/.test(f.meta));
      assert.match(module.body, /devIssuer: process\.env\.VA_DEV_ISSUER === 'true',/);
      assert.match(module.body, /AppPlatformModule\.forRoot/);
      return;
    }
    assert.equal(mains.length, 2);
    assert.match(mains[0].body, /await platform\.fetch\(toFetchRequest\(req\)\);/);
    assert.match(mains[1].body, /void platform\.pingManifests\(\);/);
    const platformBlock = codeBlocks.find((f) => /title="server\/src\/platform\.ts"/.test(f.meta));
    assert.match(platformBlock.body, /createAppPlatform\(\{/);
    assert.match(platformBlock.body, /devIssuer: process\.env\.VA_DEV_ISSUER === 'true'/);
    assert.match(text, /`GET \/api\/client-config`/);
    assert.match(text, /`spaceApiUrl`/);
  });

  t('the harness Check shows three lines and a limits sentence follows it', () => {
    const step = steps(part1)[2];
    const [, afterCheck] = step.split(/^\*\*Check\*\*/m);
    assert.match(
      afterCheck,
      /^Verified in the browser: user dev-user in space 1\.\nCapabilities: hello:view\nVerified on the server: space 1, user dev-user$/m,
    );
    const afterBlock = afterCheck.split(/^```$/m).at(-1);
    assert.match(afterBlock, /The run proves your app page and your server, but not your registration or Vector Space access\./);
    assert.match(afterBlock, /Part 2 covers those\./);
  });

  t('the page says a client check is display only and the server check decides', () => {
    assert.match(steps(part1)[5], /display only/);
    assert.match(steps(part1)[5], /server check/);
  });

  t('every ts and tsx block is a starter excerpt of a named file with no ellipsis', () => {
    const code = codeBlocks.filter((f) => f.lang === 'ts' || f.lang === 'tsx');
    assert.ok(code.length >= 6);
    for (const f of code) {
      assert.match(f.meta, /title="[\w./-]+"/);
      assert.match(f.meta.replace(/title="[^"]*"/, ''), /(^|\s)starter(\s|$)/);
      assert.doesNotMatch(f.meta, /\badd\b/);
      assert.doesNotMatch(f.body, /\.\.\.|…/);
    }
  });

  t('shell blocks have no prompt and one command per line', () => {
    const shell = codeBlocks.filter((f) => f.lang === 'bash');
    assert.ok(shell.length >= 4);
    for (const f of shell) {
      for (const line of f.body.trim().split('\n')) {
        assert.doesNotMatch(line, /^\$ /);
        assert.doesNotMatch(line, /&&|;\s*\w|\\$/);
      }
    }
  });

  t('covers the client symbols and the server symbols of the flavour, and gates one page with one capability', () => {
    for (const s of ['defineApp', 'buildManifests', 'AppProvider', 'BootGate', 'loadAppClientConfig', 'RequireCapability']) {
      assert.match(text, new RegExp(s), s);
    }
    const serverSymbols = nest
      ? ['AppPlatformModule', 'CurrentUser', 'AppCredentialStore', 'devIssuer']
      : ['createAppPlatform', 'readBearer', 'assertCapability', 'verifyUserToken', 'AppCredentialStore', 'devIssuer'];
    for (const s of serverSymbols) assert.match(text, new RegExp(s), s);
    if (nest) {
      assert.match(text, /@vectoragents\/vs-apps\/nest/);
      assert.doesNotMatch(text, /node:http|createSpaceTokenVerifier/);
    } else {
      assert.match(text, /from 'node:http'/);
      assert.doesNotMatch(text, /@vectoragents\/vs-apps\/nest|@nestjs/);
    }
    assert.equal(count(/'hello:view'/g), 1);
  });

  t('shows no Nest.js install step and no `@Inject`', () => {
    assert.doesNotMatch(text, /@Inject\b/);
    assert.doesNotMatch(text, /npm install @/);
  });

  t('names Vite once the page shows it, so the baseline allowance holds', () => {
    assert.match(text, /\bVite\b/);
  });

  t('Part 2 click paths and Checks', () => {
    const [, , publish, addApp, share, open] = steps(part2);
    assert.match(publish, /\*\*Organization\*\*, then \*\*Spaces\*\*/);
    assert.match(publish, /\*\*Agent Studio\*\*/);
    assert.match(publish, /The space switcher, the menu in which a member picks a space, lists/);
    assert.match(publish, /^2\. .*skip item 3\./m);
    assert.match(publish, /\*\*Publish All\*\*/);
    assert.match(publish, /All published/);
    assert.match(addApp, /\*\*Add an app\*\*/);
    assert.match(addApp, /App enabled/);
    assert.match(share, /\*\*Access\*\*/);
    assert.match(share, /\*\*Direct access\*\*/);
    assert.match(share, /choose \*\*Add users or groups…\*\*/);
    assert.match(share, /Keep the access level at \*\*Can use\*\*\. It gives every capability the app declares/);
    assert.equal((share.match(/Vector Space shows a capability as a permission\./g) ?? []).length, 1);
    assert.doesNotMatch(share, /\*\*View\*\*|Add people, roles or groups/);
    assert.match(open, /shared the app with at the \*\*Can use\*\* level/);
    assert.doesNotMatch(open, /Only the server check protects data|Anyone can change what runs/);
    assert.match(share, /Member added/);
    assert.match(share, /Save changes/);
    assert.match(share.split(/^\*\*Check\*\*/m).at(-1), /Access saved/);
    assert.match(
      open,
      /^Verified in the browser: user <id> in space <id>\.\nCapabilities: hello:view\nVerified on the server: space <id>, user <id>$/m,
    );
    assert.doesNotMatch(steps(part2)[1], /Auto-apply/);
  });

  t('Part 2 says each provisioning fact once, where the reader meets it, and makes no 404 claim in steps 2 and 4', () => {
    const [, register, , addApp] = steps(part2);
    const once = (re) => assert.equal((part2.match(re) ?? []).length, 1, String(re));
    once(/`serviceSecret`/g);
    once(/a status outside 200 to 299/g);
    assert.match(register, /verifies that token/);
    assert.match(addApp, /`serviceSecret`/);
    assert.match(addApp, /a status outside 200 to 299/);
    assert.doesNotMatch(register, /\b404\b/);
    assert.doesNotMatch(addApp, /\b404\b/);
  });

  t('ends on a Check with the exact output, and holds no Goal or Result section', () => {
    const last = steps(part2).at(-1);
    assert.equal(title(last), '6. Open the app page');
    assert.ok(hasCheck(last));
    assert.match(last.split(/^\*\*Check\*\*/m)[1], /^```text\nVerified in the browser: user <id> in space <id>\.\n/m);
    assert.doesNotMatch(text, /^## (Goal|Result)$/m);
    assert.doesNotMatch(text, /same three lines as the last Check/);
  });

  t('links the glossary terms and the harness reference', () => {
    assert.ok(targets.includes('sdk/app-definition.md'));
    const links = targets.filter((l) => l.includes('glossary.md#'));
    const common = [
      'glossary.md#app-page',
      'glossary.md#app-registration',
      'glossary.md#binding',
      'glossary.md#capability',
      'glossary.md#manifest',
      'glossary.md#service-secret',
      'vector-space/glossary.md#agent-studio',
      'vector-space/glossary.md#context-hub',
      'sdk/glossary.md#agent-catalog',
      'sdk/glossary.md#app-definition',
      'sdk/glossary.md#dev-issuer',
      'sdk/glossary.md#harness',
      'sdk/glossary.md#sdk',
      'vector-space/glossary.md#member',
      'vector-space/glossary.md#organization-admin',
      'vector-space/glossary.md#space',
      'vector-space/glossary.md#space-admin',
      'vector-space/glossary.md#staff',
      'vector-space/glossary.md#vector-space',
    ];
    assert.deepEqual([...new Set(links)].sort(), common.sort());
    assert.ok(linksOf(section(text, 'Next steps')).map(bare).some((link) => link.endsWith('reference/harness.md')));
  });

  t('links each glossary term at its first use and gives no appositive definition', () => {
    const plain = prose.replace(/`[^`]*`/g, 'CODE');
    const firstUse = (term) => plain.search(new RegExp(`\\b${term}\\b`, 'i'));
    for (const term of ['capability', 'space admin', 'manifest', 'harness', 'member']) {
      const at = firstUse(term);
      assert.ok(at >= 0, term);
      assert.match(plain.slice(Math.max(0, at - 1), at + term.length + 2), new RegExp(`^\\[${term}\\]\\(`, 'i'), `${term} is linked at first use`);
    }
    assert.doesNotMatch(prose, /capability\]\([^)]*\), a permission/);
    assert.doesNotMatch(prose, /manifest\]\([^)]*\), a JSON document/);
  });

  t('a sentence carries at most three glossary links', () => {
    for (const sentence of prose.split(/(?<=[.!?])\s+/)) {
      assert.ok((sentence.match(/\]\([^)]*glossary\.md#/g) ?? []).length <= 3, sentence);
    }
  });

  t('provision and deprovision calls come when a space admin adds or removes the app', () => {
    const lines = prose.split('\n').filter((l) => l.includes('DELETE /api/deprovision') && l.includes('when a '));
    assert.ok(lines.length >= 1);
    for (const line of lines) assert.match(line, /when a \[?space admin\]?(\([^)]*\))? adds or removes the app/);
  });

  t('names the people who open the app members, never users', () => {
    const plain = prose.replace(/`[^`]*`/g, 'CODE').replace(/\buser (token|ids?)\b/g, 'TERM').replace('Add users or groups…', 'LABEL');
    assert.doesNotMatch(plain, /\busers?\b/i);
    assert.match(steps(part2)[4], /pick the member/);
    assert.match(steps(part2)[4], /\*\*Direct access\*\* lists the member\./);
  });

  t('puts the reason after the command only when it changes the action, and has no roadmap sentence', () => {
    assert.doesNotMatch(text, /so you start from running code/);
    assert.doesNotMatch(text, /Steps 3 to 5 read/);
    assert.doesNotMatch(text, /The tour reads/);
    assert.equal(count(/The harness stands in for Vector Space/g), 1);
    assert.match(steps(part1)[1], /^The address of this page names your pair/m);
  });

  t('names no SDK package version in page text', () => {
    assert.doesNotMatch(text, /@vectoragents\/vs-apps(?:\/[\w-]+)*@?\s?\d+\.\d+/);
    assert.match(steps(part1)[1], /@vectoragents\/vs-apps@<version>/);
  });

  t('points at page content by name, not by direction', () => {
    assert.doesNotMatch(prose, /\b(above|below|earlier|as shown)\b/i);
  });

  t('link text names the target', () => {
    const labels = [...text.matchAll(/\[([^\]]+)\]\([^)]+\)/g)].map((m) => m[1].toLowerCase());
    for (const label of labels) {
      assert.doesNotMatch(label, /^(here|this page|read more|learn more|https?:\/\/\S+|create one)$/);
    }
  });

  t('follows the writing standard', () => {
    assert.doesNotMatch(text.replace(/`[^`\n]*`/g, ''), /—|–/);
    assert.doesNotMatch(text, /\b(we|our|let's)\b/i);
    assert.doesNotMatch(text, /\b(simply|just|easy|easily)\b/i);
  });
}
