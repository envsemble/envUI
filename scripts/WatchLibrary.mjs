import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const buildScript = new URL('./BuildLibrary.mjs', import.meta.url);
let buildInProgress = false;
let rebuildPending = false;
let debounceTimer;

function rebuildLibrary() {
  if (buildInProgress) {
    rebuildPending = true;
    return;
  }
  buildInProgress = true;
  const buildProcess = spawn(process.execPath, [fileURLToPath(buildScript)], {
    cwd: repositoryRoot,
    stdio: 'inherit',
  });
  buildProcess.on('exit', () => {
    buildInProgress = false;
    if (rebuildPending) {
      rebuildPending = false;
      rebuildLibrary();
    }
  });
}
function scheduleRebuild() {
  clearTimeout(debounceTimer);
  debounceTimer = setTimeout(rebuildLibrary, 150);
}

for (const directory of ['../packages/ui/src/', '../.agents/skills/', '../docs/', '../assets/']) {
  watch(new URL(directory, import.meta.url), { recursive: true }, scheduleRebuild);
}
watch(new URL('../README.md', import.meta.url), scheduleRebuild);
rebuildLibrary();
console.log(
  'Watching public library builds for external local consumers. The catalogue reads source directly for Fast Refresh.',
);
