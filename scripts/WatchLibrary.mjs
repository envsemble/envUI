import { watch } from 'node:fs';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('../', import.meta.url));
let running = false;
let pending = false;
let timer;
function rebuild() {
  if (running) {
    pending = true;
    return;
  }
  running = true;
  const child = spawn(process.execPath, ['scripts/BuildLibrary.mjs'], {
    cwd: root,
    stdio: 'inherit',
  });
  child.on('exit', () => {
    running = false;
    if (pending) {
      pending = false;
      rebuild();
    }
  });
}
watch(new URL('../packages/ui/src/', import.meta.url), { recursive: true }, () => {
  clearTimeout(timer);
  timer = setTimeout(rebuild, 150);
});
watch(new URL('../apps/docs/src/Reference.ts', import.meta.url), () => {
  clearTimeout(timer);
  timer = setTimeout(rebuild, 150);
});
rebuild();
console.log(
  'Watching public library builds for external local consumers. Docs read source directly for Fast Refresh.',
);
