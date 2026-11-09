import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { linksOf, section } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-apps/why-vector-apps.md');
const text = readFileSync(file, 'utf8');

const headings = [...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]);

test('the page runs what an app is, where it fits, what a space gives, next steps', () => {
  assert.deepEqual(headings, ['What an app is', 'Where an app fits', 'What a space gives an app', 'Where to go next']);
});

test('the page opens with the definition of an app', () => {
  const body = text.replace(/^---\n[\s\S]*?\n---\n/, '').trim();
  assert.match(body, /^An \[app\]\(\.\/glossary\.md#app\) is /);
});

test('every link resolves, and the page links How a Vector App works, the quickstart and Choose your path', () => {
  const links = linksOf(text);
  for (const link of links) {
    const [path, anchor] = link.split('#');
    assert.ok(existsSync(resolve(dirname(file), path)), link);
    if (anchor && path.endsWith('glossary.md')) {
      const terms = readFileSync(resolve(dirname(file), path), 'utf8').split('\n').filter((l) => l.startsWith('### '));
      assert.ok(terms.some((l) => l.slice(4).toLowerCase().replaceAll(' ', '-') === anchor), link);
    }
  }
  for (const target of ['./how-a-vector-app-works.md', './quickstart.md', '../sdk/choose-your-path.md']) assert.ok(links.includes(target), target);
});

test('the space gives an app member identity, platform data, model access and the record of work', () => {
  const given = section(text, 'What a space gives an app').replace(/\[([^\]]+)\]\([^)]*\)/g, '$1');
  for (const term of ['identifies the member', 'allowed resources', 'model slot', 'AI gateway', 'acts', 'approvals']) assert.ok(given.includes(term), term);
});

test('the model access bullet says production publishes no gateway to apps, so it refuses with 503, and a local stack answers', () => {
  const bullet = section(text, 'What a space gives an app').split('\n').find((l) => l.startsWith('- **Governed model access.**')) ?? '';
  assert.match(bullet, /production Vector Space publishes no gateway address to apps/);
  assert.match(bullet, /refuses the request with status `503`/);
  assert.match(bullet, /local stack/);
  assert.doesNotMatch(bullet, /the call goes through the/i);
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
