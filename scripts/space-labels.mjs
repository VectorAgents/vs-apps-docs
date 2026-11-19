// Local check: every Vector Space label and toast that Part 2 of the quickstart and the staff runbook name exists in the Space client source.
// A label that moved to another page still passes; a label or toast that no longer exists fails.
// Usage: SPACE_DIR=../vector-spaces pnpm check:space
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join, resolve } from 'node:path';

const spaceDir = resolve(process.env.SPACE_DIR ?? '../vector-spaces');
const clientDir = join(spaceDir, 'apps/client/src');
if (!existsSync(clientDir)) {
  console.error(`space-labels: no Space client at ${clientDir}. Set SPACE_DIR to a vector-spaces checkout.`);
  process.exit(2);
}

/** Bold words that are not Space labels: the step markers, and any label built from the app's own name, which comes from its manifest. */
const NOT_SPACE_LABELS = (label) => ['Role', 'Check'].includes(label) || label.includes('Hello app');

const quickstart = readFileSync('docs/vector-apps/quickstart.md', 'utf8');
const part2 = quickstart.slice(quickstart.indexOf('\n## Part 2'));
const sources = [
  ['docs/vector-apps/quickstart.md, Part 2', part2],
  ['.agents/staff-registration.md', readFileSync('.agents/staff-registration.md', 'utf8')],
];

const labelsOf = (text) => [...text.matchAll(/\*\*([^*\n]+)\*\*/g)].map((m) => m[1].replace(/…$/, '').trim());
const toastsOf = (text) =>
  text
    .split('\n')
    .filter((line) => /\btoasts?\b/.test(line))
    .flatMap((line) => [...line.matchAll(/`([A-Z][A-Za-z ]+)`/g)].map((m) => m[1]));

const corpus = readdirSync(clientDir, { recursive: true })
  .filter((file) => /\.(ts|tsx)$/.test(file))
  .map((file) => readFileSync(join(clientDir, file), 'utf8'))
  .join('\n');
const present = (needle) => corpus.includes(needle);

const missing = [];
for (const [name, text] of sources) {
  for (const [kind, found] of [['label', labelsOf(text)], ['toast', toastsOf(text)]]) {
    for (const value of new Set(found)) {
      if (NOT_SPACE_LABELS(value) || present(value)) continue;
      missing.push(`${name}: ${kind} "${value}"`);
    }
  }
}

if (missing.length) {
  console.error(`space-labels: not found in ${clientDir}:\n${missing.map((m) => `  ${m}`).join('\n')}`);
  process.exit(1);
}
console.log(`space-labels: ok (${sources.length} sources against ${clientDir})`);
