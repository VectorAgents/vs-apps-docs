import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';
import { bannedTermsIn, bodyOf, brokenLinks, linksOf, section, unlink } from './page-helpers.mjs';
import { voiceViolations } from './voice.mjs';

const docs = resolve(dirname(fileURLToPath(import.meta.url)), '../docs');
const file = resolve(docs, 'vector-space/who-can-do-what.md');
const glossaryFile = resolve(docs, 'vector-space/glossary.md');
const text = readFileSync(file, 'utf8');
const body = bodyOf(text);
const plain = unlink(body);

test('the page runs lead, the scene, two detail sections, Where to go next', () => {
  assert.deepEqual([...text.matchAll(/^## (.+)$/gm)].map((m) => m[1]), [
    'A new member in a team\'s space',
    'How each kind reaches a space',
    'What Can use and Can edit mean',
    'Where to go next',
  ]);
});

test('the lead names the five kinds, each with a glossary link', () => {
  const lead = body.split(/^## /m)[0];
  for (const term of ['organization-admin', 'space-manager', 'member', 'staff', 'service-account']) {
    assert.match(lead, new RegExp(`\\]\\(\\./glossary\\.md#${term}\\)`), term);
  }
});

test('the lead is a bold-term list of the five kinds in order, with no table', () => {
  assert.doesNotMatch(body, /^\s*\|/m);
  const lead = body.split(/^## /m)[0];
  const terms = [...lead.matchAll(/^- \*\*\[([^\]]+)\]/gm)].map((m) => m[1]);
  assert.deepEqual(terms, ['Organization admin', 'Space managers', 'Members', 'Staff', 'Service accounts']);
});

test('the scene is the first H2, names no Example and says Acme\'s sales team', () => {
  assert.equal(text.match(/^## (.+)$/m)[1], 'A new member in a team\'s space');
  assert.doesNotMatch(text, /^#+ .*Example/m);
  assert.doesNotMatch(plain, /the sales space/i);
  assert.match(section(text, 'A new member in a team\'s space'), /\nAcme's sales team has a space/);
});

test('the page has no figure slot', () => {
  assert.doesNotMatch(text, /FigurePlaceholder|StructureFigure|FlowFigure/);
});

test('every link resolves, every glossary anchor exists, and Where to go next links its two pages and the glossary', () => {
  assert.deepEqual(brokenLinks(text, file), []);
  assert.deepEqual(linksOf(section(text, 'Where to go next')), ['./one-access-model.md', './organizations-and-spaces.md', './glossary.md']);
});

test('the page says one organization admin, and the glossary row agrees', () => {
  assert.match(plain, /an organization has one, and a transfer passes the position/);
  assert.doesNotMatch(text, /every organization admin|organization admins/i);
  const row = readFileSync(glossaryFile, 'utf8').split(/^### /m).find((s) => s.startsWith('organization admin'));
  assert.ok(row, 'glossary row');
  assert.doesNotMatch(row, /every organization admin|organization admins/i);
  assert.match(row, /\bone\b/i);
});

test('the page says a Restricted resource is closed to the organization admin unless a share names them, and points to one-access-model', () => {
  const sentence = body.split(/(?<=[.!?])\s+/).find((s) => /Restricted/.test(s));
  assert.ok(sentence, 'a sentence on Restricted');
  assert.match(unlink(sentence), /organization admin/);
  assert.match(unlink(sentence), /share/);
  assert.match(sentence, /\(\.\/one-access-model\.md\)/);
});

test('staff get two sentences and no claim of global reach', () => {
  const lead = body.split(/^## /m)[0];
  const staff = lead.split('\n').find((l) => /^- \*\*\[Staff\]/.test(l));
  const sentences = unlink(staff.replace(/^- \*\*[^:]*:\s*/, '')).split(/(?<=[.!?])\s+/).filter(Boolean);
  assert.equal(sentences.length, 2, staff);
  assert.doesNotMatch(staff, /global/i);
});

test('Can use and Can edit are the two roles of a share, and a role is not a set of people', () => {
  const part = section(text, 'What Can use and Can edit mean');
  for (const anchor of ['can-use', 'can-edit']) assert.match(part, new RegExp(`\\]\\(\\./glossary\\.md#${anchor}\\)`), anchor);
  for (const anchor of ['share', 'group']) assert.match(body, new RegExp(`\\]\\(\\./glossary\\.md#${anchor}\\)`), anchor);
  assert.match(part, /not a set of people/);
  assert.match(part, /\]\(\.\/one-access-model\.md\)/);
});

test('the page has no View level, Edit level or custom roles', () => {
  assert.doesNotMatch(text, /View level|Edit level|custom role|role as a set/i);
});

test('the page names no master doc, implementation name, banned term, vendor or use case', () => {
  assert.doesNotMatch(text, /(PROTOCOL|BINDINGS|REGISTRY|OVERVIEW|RESOURCES|SPACES|README)\.md/);
  assert.deepEqual(bannedTermsIn(plain), []);
  assert.doesNotMatch(plain, /OrganizationRole|five roles/i);
  assert.doesNotMatch(plain, /\b(Apollo|Exa|BrightData|Hiring|SDR|CSR)\b/);
  assert.doesNotMatch(plain, /\b(support|hiring)\b/i);
});

test('the page assumes no TypeScript, Node or React', () => assert.doesNotMatch(plain, /TypeScript|Node|React/));

test('the page follows the voice checks and has no em dash', () => {
  assert.deepEqual(voiceViolations(text), []);
  assert.doesNotMatch(plain, /—/);
});

test('the page names no vague actor', () => assert.doesNotMatch(plain, /\bsomeone\b/i));

test('service accounts are the identity behind an API key or a schedule, and a group share reaches every user the group holds', () => {
  assert.match(plain, /such as the identity behind an API key or a schedule/);
  assert.match(plain, /gives it to every user the group holds/);
});

test('the rules of a space are a bold-term list and Can edit on the space and on a resource are two items', () => {
  const rules = section(text, 'How each kind reaches a space');
  assert.deepEqual([...rules.matchAll(/^- \*\*([^*]+)\*\*/gm)].map((m) => m[1]), ['Organization admin', 'Members', 'Can edit on a space', 'Restricted resources']);
  const roles = section(text, 'What Can use and Can edit mean');
  assert.match(roles, /^- \*\*On the space\*\*/m);
  assert.match(roles, /^- \*\*On a resource\*\*/m);
});

test('service accounts are the identity behind an API key or a schedule, and a group share reaches every user the group holds', () => {
  assert.match(plain, /such as the identity behind an API key or a schedule/);
  assert.match(plain, /gives it to every user the group holds/);
});

test('a kind says who a user is and a role says what the user may do', () => {
  assert.match(plain, /A kind says who a user is in an organization\. A role says what the user may do on one resource/);
});

test('the rules of a space are a bold-term list and Can edit on the space and on a resource are two items', () => {
  const rules = section(text, 'How each kind reaches a space');
  assert.deepEqual([...rules.matchAll(/^- \*\*([^*]+)\*\*/gm)].map((m) => m[1]), ['Organization admin', 'Members', 'Can edit on a space', 'Restricted resources']);
  const roles = section(text, 'What Can use and Can edit mean');
  assert.match(roles, /^- \*\*On the space\*\*/m);
  assert.match(roles, /^- \*\*On a resource\*\*/m);
});
