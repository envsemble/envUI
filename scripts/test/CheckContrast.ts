import { spawnSync } from 'node:child_process';
import { repositoryRoot } from '../RepositoryPaths.ts';
import { bin, componentTestCommand } from './TestTasks.ts';

const update = process.argv.includes('--update-snapshots');

function run([command, ...args]: string[], env: NodeJS.ProcessEnv = process.env) {
  const { status } = spawnSync(command!, args, { cwd: repositoryRoot, env, stdio: 'inherit' });
  if (status !== 0) process.exit(status ?? 1);
}

run([...bin.node, '--test', 'tests/contrast/ContrastRegistry.test.ts'], {
  ...process.env,
  ENVUI_CONTRAST_UPDATE: update ? '1' : '',
});
run(componentTestCommand('chromium', ['tests/component/Contrast.test.tsx']));
