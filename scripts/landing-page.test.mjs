import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { test } from 'node:test';

const text = readFileSync(new URL('../docs/index.mdx', import.meta.url), 'utf8');
const body = text.replace(/^---\n[\s\S]*?\n---\n/, '');
const docs = new URL('../docs/', import.meta.url);
const pages = new URL('../src/pages/', import.meta.url);

const lead = body.slice(body.search(/^# .*\n/m), body.indexOf('<div className="path-cards">')).replace(/^# .*\n/, '').trim();
const cards = [...body.matchAll(/<section className="path-card[^"]*"[^>]*>([\s\S]*?)<\/section>/g)].map(([, card]) => ({
  eyebrow: card.match(/<p className="path-eyebrow">(.+?)<\/p>/)?.[1],
  heading: card.match(/<h2 [^>]*>(.+?)<\/h2>/)?.[1],
  linkTexts: [...card.matchAll(/\[([^\]]+)\]\([^)]+\)|<Link [^>]*>([^<]+)<\/Link>/g)].map((m) => m[1] ?? m[2]),
  links: [...card.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]),
  card,
}));
const card = (eyebrow) => cards.find((c) => c.eyebrow === eyebrow);

/** A site route resolves to a docs page or to a page under src/pages. */
const resolves = (route) => {
  const path = route.split('#')[0].slice(1);
  return ['.md', '.mdx'].some((ext) => existsSync(new URL(`${path}${ext}`, docs))) || existsSync(new URL(`${path}.tsx`, pages));
};

test('the page has a single top-level heading', () => {
  assert.equal((body.match(/^# /gm) ?? []).length, 1);
});

test('the lead is three sentences: Vector Space, Vector App, vs-apps SDK', () => {
  const sentences = lead.split(/(?<=\.) /);
  assert.equal(sentences.length, 3);
  assert.match(sentences[0], /^\[Vector Space\]\(\/vector-space\/glossary#vector-space\) is /);
  assert.match(sentences[1], /^A \[Vector App\]\(\/vector-apps\/glossary#app\) /);
  assert.match(sentences[2], /^The \[vs-apps SDK\]\(\/sdk\/glossary#sdk\) /);
});

test('three cards in the order Understand, Build, Look up', () => {
  assert.deepEqual(cards.map((c) => c.eyebrow), ['Understand', 'Build', 'Look up']);
});

test('Understand links the four concept pages', () => {
  assert.deepEqual(card('Understand').links, [
    '/vector-space/why-vector-space',
    '/vector-space/what-vector-space-is',
    '/vector-apps/why-vector-apps',
    '/vector-apps/how-a-vector-app-works',
  ]);
});

test('Build holds the one primary button, then the goal list', () => {
  const build = card('Build').card;
  assert.equal((text.match(/button--primary/g) ?? []).length, 1);
  assert.match(build, /<Link className="button button--primary button--lg" to="\/vector-apps\/quickstart">Start Quickstart<\/Link>/);
  assert.ok(build.indexOf('Start Quickstart') < build.indexOf('<TrackList />'));
  assert.ok(text.includes("import TrackList from '@site/src/components/TrackList';"));
});

test('Look up links the six reference pages', () => {
  assert.deepEqual(card('Look up').links, [
    '/sdk/app-definition',
    '/sdk/reference/root',
    '/sdk/reference/platform-limits',
    '/sdk/builder',
    '/sdk/examples',
    '/vector-apps/glossary',
  ]);
});

test('every link resolves to a page', () => {
  const links = [...body.matchAll(/\]\((\/[^)]+)\)|to="(\/[^"]+)"/g)].map((m) => m[1] ?? m[2]);
  assert.ok(links.length > 10);
  for (const link of links) assert.ok(resolves(link), link);
});

test('the page has no snippet, goal H2, reference strip, badge, emoji, time estimate or flavour note', () => {
  assert.ok(!body.includes('```'));
  assert.ok(!/Pick a goal|landing-reference|badge/i.test(body));
  assert.ok(!/\p{Extended_Pictographic}/u.test(body));
  assert.ok(!/\b\d+\s*(?:min|minutes|hours?)\b/i.test(body));
  assert.ok(!/flavour|Node|Nest/i.test(body));
});

test('no card heading repeats the text of a link', () => {
  for (const { heading, linkTexts } of cards) {
    assert.ok(heading, 'every card has an H2');
    assert.ok(!linkTexts.map((t) => t.toLowerCase()).includes(heading.toLowerCase()), heading);
  }
});

test('the description is one sentence of 160 characters or fewer and names what the page holds', () => {
  const description = text.match(/^description: (.+)$/m)?.[1];
  assert.ok(description);
  assert.ok(description.length <= 160, `${description.length} characters`);
  assert.ok(!/^(This page|Learn)\b/i.test(description));
  assert.equal(description.split(/(?<=\.) /).length, 1);
});

test('the page never calls the site the hub', () => {
  assert.ok(!/\bhub\b/i.test(text));
});
