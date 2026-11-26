// Runs the given test files (default: all page tests) and prints only the failing tests, each with the first line of its error.
import { spawnSync } from 'node:child_process';

const generate = spawnSync('node', ['scripts/generate.mjs'], { encoding: 'utf8' });
if (generate.status !== 0) {
  console.error(generate.stdout + generate.stderr);
  process.exit(generate.status ?? 1);
}

const files = process.argv.slice(2);
const run = spawnSync('node', ['--test', '--test-reporter=tap', ...(files.length ? files : ['scripts/*.test.mjs'])], {
  encoding: 'utf8',
  maxBuffer: 1 << 28,
  shell: files.length === 0,
});

const lines = run.stdout.split('\n');
const clip = (text) => (text.length > 220 ? `${text.slice(0, 220)}...` : text);
let failed = 0;
lines.forEach((line, i) => {
  if (!/^\s*not ok /.test(line)) return;
  failed += 1;
  const at = lines.slice(i + 1, i + 12).findIndex((l) => /^\s+error: /.test(l));
  console.log(line.trim());
  if (at >= 0) {
    const first = lines[i + 1 + at].trim();
    // A block scalar (`error: |-`) holds its text on the next line.
    console.log(`  ${clip(/\|-?$/.test(first) ? lines[i + 2 + at].trim() : first)}`);
  }
});
console.log(lines.filter((l) => /^# (tests|pass|fail)/.test(l)).join('\n'));
process.exit(run.status === 0 && failed === 0 ? 0 : 1);
