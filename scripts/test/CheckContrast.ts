// Runs the contrast gate: its registry and snapshot in Node (tests/contrast/ContrastRegistry.test.ts),
// then every pair measured in every theme in Chromium (tests/component/Contrast.test.tsx).
//
//   node scripts/test/CheckContrast.ts [--update-snapshots]
//
// --update-snapshots records what each pair is held to in tests/contrast/DeclaredPairs.json, as
// tests/contrast/Snapshot.ts allows.
import { spawnSync } from 'node:child_process';
import { repositoryRoot } from '../RepositoryPaths.ts';
import { bin } from './TestTasks.ts';

const update = process.argv.includes('--update-snapshots');

function run([command, ...args]: string[], env: NodeJS.ProcessEnv = process.env) {
  const { status } = spawnSync(command!, args, { cwd: repositoryRoot, env, stdio: 'inherit' });
  if (status !== 0) process.exit(status ?? 1);
}

run([...bin.node, '--test', 'tests/contrast/ContrastRegistry.test.ts'], {
  ...process.env,
  ENVUI_CONTRAST_UPDATE: update ? '1' : '',
});
run([
  ...bin.vitest,
  'run',
  '--config',
  'tests/component/vitest.config.ts',
  '--project=chromium',
  'tests/component/Contrast.test.tsx',
]);
