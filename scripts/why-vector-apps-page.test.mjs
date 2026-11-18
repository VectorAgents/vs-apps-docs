import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bodyOf, linksOf, longSentences, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-apps/why-vector-apps.md');
const text = readFileSync(file, 'utf8');

const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

test('the page runs the extension choice, identity data models and record of work, client server and manifest, next steps', () => {
  assert.deepEqual(headings, ['App, A2A agent or MCP server', 'Identity, data, models and a record of work', 'Client, server and manifest', 'Where to go next']);
});

test('the body holds 490 words or fewer', () => {
  const words = unlink(bodyOf(text)).split(/\s+/).filter((w) => /[A-Za-z0-9]/.test(w)).length;
  assert.ok(words <= 490, `${words} words`);
});

test('the page opens with the definition of an app', () => {
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
  assert.match(body, /^An \[app\]\(\.\/glossary\.md#app\) is /);
});

test('every link resolves, and the page links How a Vector App works, the quickstart, Extending a space and the SDK overview', () => {
  const links = linksOf(text);
  for (const link of links) {
    const [path, anchor] = link.split('#');
    assert.ok(existsSync(resolve(dirname(file), path)), link);
    if (anchor && path.endsWith('glossary.md')) {
      const terms = readFileSync(resolve(dirname(file), path), 'utf8').split('\n').filter((l) => l.startsWith('### '));
      assert.ok(terms.some((l) => l.slice(4).toLowerCase().replaceAll(' ', '-') === anchor), link);
    }
  }
  for (const target of ['./how-a-vector-app-works.md', './quickstart.md', '../vector-space/extending-a-space.md', '../sdk/overview.md']) assert.ok(links.includes(target), target);
  assert.equal(links.filter((l) => l === '../vector-space/extending-a-space.md').length, 2, 'once in App, A2A agent or MCP server, once in Where to go next');
  assert.doesNotMatch(text, /choose-your-path|Choose your path/);
});

test('App, A2A agent or MCP server gives three when-to-use lines, links Extending a space, then the app-offered agents', () => {
  const methods = section(text, 'App, A2A agent or MCP server');
  assert.match(methods, /^Build an app for work that members do on screen\. An A2A agent and an MCP server serve agents\.$/m);
  assert.match(methods, /\[Extending a space\]\(\.\.\/vector-space\/extending-a-space\.md\) compares all three\./);
  const lines = methods.split('\n').filter((l) => l.startsWith('- '));
  assert.equal(lines.length, 3);
  assert.match(lines[0], /^- \*\*Vector App:\*\*.*screens/);
  assert.match(lines[1], /^- \*\*\[A2A\]\(\.\.\/vector-space\/glossary\.md#a2a\) agent:\*\*.*reasoning/);
  assert.match(lines[2], /^- \*\*\[MCP\]\(\.\.\/vector-space\/glossary\.md#mcp\) server:\*\*.*API/);
  assert.match(methods, /An app can also offer an A2A agent and an MCP server of its own/);
});

test('Client, server and manifest names the client, server and manifest with the runtimes the SDK README gives', () => {
  const core = unlink(section(text, 'Client, server and manifest'));
  assert.match(core, /\*\*Client:\*\*.*React bindings.*framework-free browser helpers/);
  assert.match(core, /Web-standard APIs, so it runs on Node\.js, Bun, Deno or Workers/);
  assert.match(core, /The SDK builds the manifest from one app definition\./);
  assert.doesNotMatch(text, /subpaths need Node\.js|React is not a server wrapper/);
  assert.doesNotMatch(text, /redempt|seamless|governed|NextJS|Astro|vanilla/i);
});

test('the space gives an app member identity, platform data, model access and the record of work', () => {
  const given = section(text, 'Identity, data, models and a record of work').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  for (const term of ['identifies the member', 'allowed resources', 'model slot', 'AI gateway', 'acts', 'approvals']) assert.ok(given.includes(term), term);
});

test('the model access bullet opens with the benefit, then names the slot and the short-lived key, and says nothing of a 503', () => {
  const bullet = section(text, 'Identity, data, models and a record of work').split('\n').find((l) => l.startsWith('- **Model access through a slot.**')) ?? '';
  assert.match(bullet, /^- \*\*Model access through a slot\.\*\* Your app can call a model without holding an AI provider key\. /);
  assert.match(bullet, /Your server asks for a model through the slot and gets a short-lived key for the \[AI gateway\]/);
  assert.doesNotMatch(text, /503|gateway address|local stack/);
  assert.doesNotMatch(bullet, /the call goes through the/i);
});

test('the server check leads Identity, data, models and a record of work and links How a Vector App works', () => {
  const lead = section(text, 'Identity, data, models and a record of work').trim().split('\n')[2];
  assert.equal(lead, 'Your server checks every call, as [How a Vector App works](./how-a-vector-app-works.md#the-parts-of-an-app) shows.');
  assert.doesNotMatch(text, /Each one stays inside the rules|display only|^\*[^*]/m);
});

test('no sentence announces a list or its count, and each list but the last follows a sentence', () => {
  assert.doesNotMatch(text, /four things|three parts|three extensions|Choose by the job/);
  const lines = text.replace(/^---\n[\s\S]*?\n---\n/, '').split('\n');
  const lastHeading = lines.findLastIndex((l) => l.startsWith('## '));
  lines.forEach((line, i) => {
    if (i >= lastHeading || !line.startsWith('- ') || lines[i - 1] !== '') return;
    assert.ok(lines[i - 2] && !lines[i - 2].startsWith('#') && !lines[i - 2].startsWith('- '), `list at line ${i + 1} follows a heading`);
  });
});

test('the user token identifies the member and the page never says a token names them', () => {
  assert.doesNotMatch(text, /names the member/i);
});

test('the page has no "good app" test and no only-way claim', () => {
  assert.doesNotMatch(text, /good app|public product|back-office|only way/i);
});

test('the page holds no closed list and no placeholder example app', () => {
  assert.doesNotMatch(text, /\b(ANTHROPIC|AZURE_OPENAI|COHERE|CLICKUP|FIRECRAWL|INSTANTLY|UNIPILE|APOLLO|WHATSAPP|MESSENGER|INSTAGRAM|omnibox|contacts|Hiring|SDR|CSR)\b/);
});

test('the page follows the voice checks and names no master doc', () => {
  assert.deepEqual(voiceViolations(text), []);
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|APPS|GLOSSARY|README)\.md/);
});

test('a space admin adds the app and picks the model, and a member who can edit the app and share the resource attaches resources', () => {
  assert.match(unlink(text), /Vector Space adds them when a space admin adds the app\./);
  assert.match(unlink(text), /Your app can use connectors and knowledge sources\. A member who can edit your app and share the resource attaches them to it, as allowed resources\./);
  assert.match(unlink(text), /and a space admin picks the model\./);
});

test('registration is not explained here, and the How a Vector App works link points to it', () => {
  assert.doesNotMatch(text, /manifest URL/);
  assert.match(text, /^- \[How a Vector App works\]\(\.\/how-a-vector-app-works\.md\): how staff register an app and a space admin adds it to a space\.$/m);
});

test('the description is a noun phrase of 160 characters or fewer that does not open with "This page" or "Learn"', () => {
  const description = text.match(/^description: (.+)$/m)?.[1];
  assert.ok(description);
  assert.ok(description.length <= 160, `${description.length} characters`);
  assert.doesNotMatch(description, /^(This page|Learn)\b/i);
});

test('no sentence passes 35 words, and no dash or directional word appears in prose', () => {
  const prose = unlink(bodyOf(text)).replace(/`[^`]*`/g, 'CODE');
  assert.deepEqual(longSentences(prose, { max: 35 }), []);
  assert.doesNotMatch(prose, /[\u2013\u2014]| - /);
  assert.doesNotMatch(prose, /\b(above|below|earlier|as shown)\b/i);
});

test('link text names its target, and a glossary term is linked once', () => {
  assert.doesNotMatch(text, /\[(here|this page|read more|learn more|https?:[^\]]*)\]\(/i);
  const seen = linksOf(bodyOf(text)).filter((l) => /glossary\.md#/.test(l));
  assert.deepEqual(seen.filter((l, i) => seen.indexOf(l) !== i), []);
});

test('the page follows the build-page frame: no scene, no result sentence, no Related links, no "user" for a member', () => {
  assert.doesNotMatch(text, /^## (A |An )?(scene|example)\b|You now know|^Related$/im);
  assert.doesNotMatch(unlink(bodyOf(text)).replace(/\buser token\b/gi, ''), /\buser (id|ids)\b|\bthe user\b|\busers\b/i);
});

test('a sentence carries at most one glossary link, and the AI gateway is linked where the key is explained', () => {
  const pieces = bodyOf(text).split(/(?<=\.)\s+|\n/);
  const over = pieces.filter((p) => (p.match(/\]\([^)]*glossary\.md#[^)]*\)/g) ?? []).length > 1);
  assert.deepEqual(over, []);
  assert.match(text, /\[AI gateway\]\(\.\.\/vector-space\/glossary\.md#ai-gateway\)/);
});

test('a sentence states one idea: the short-lived key and the missing provider key are two sentences', () => {
  assert.doesNotMatch(text, /in place of a key, so your app|ticket/);
});
