import { spawn } from 'node:child_process';
import { readFileSync, watch } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { generateInPlace } from './generate.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const config = JSON.parse(readFileSync(join(root, 'flavours.config.json'), 'utf8'));

/** The dev server's file watcher never loses `outDir`, because `generateInPlace` never recreates it. */
export const regenerate = () => generateInPlace({ root, config }).todos;

function run() {
  try {
    console.log(`[watch-docs] ${config.outDir} synced, ${regenerate()} open todo notice(s) of ${config.todoCap}`);
  } catch (error) {
    console.error(`[watch-docs] ${error.message}`);
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  let timer;
  watch(join(root, config.docsRoot), { recursive: true }, () => {
    clearTimeout(timer);
    timer = setTimeout(run, 200);
  });
  const server = spawn('docusaurus', ['start', '--port', '8080'], { cwd: root, stdio: 'inherit' });
  server.on('exit', (code) => process.exit(code ?? 0));
  for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.kill(signal));
}
