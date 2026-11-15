import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, dirname, join } from 'node:path';
import { documentedLibraries } from '../../scripts/build/EntryLibraries.ts';
import { npmCli, npmPack, runNode } from './Npm.ts';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const consumersDirectory = join(repositoryRoot, '.cache/package-consumer');
const installationCompleteMarker = '.installed';
const lockTimeout = 5 * 60 * 1000;
export const installTimeout = lockTimeout + 60 * 1000;

function pack(directory: string) {
  const { filename, files } = npmPack(join(repositoryRoot, 'packages/ui'), [
    '--pack-destination',
    directory,
  ]);
  return { tarball: join(directory, filename), files };
}

async function consumerDependencies() {
  const read = async (path: string) =>
    JSON.parse(await readFile(join(repositoryRoot, path), 'utf8'));
  const { devDependencies: tools } = await read('package.json');
  const { devDependencies: libraries } = await read('packages/ui/package.json');
  const dependencies: Record<string, string> = {};
  for (const name of [
    'react',
    'react-dom',
    '@types/react',
    '@types/react-dom',
    'typescript',
    'esbuild',
    'vite',
  ])
    dependencies[name] = tools[name];
  for (const entryLibraries of Object.values(await documentedLibraries(repositoryRoot)))
    for (const { name } of entryLibraries) dependencies[name] = libraries[name];
  return dependencies;
}

const isolationHookSource = (boundary: string) => `
import { registerHooks } from 'node:module';
import { relative, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
const boundary = ${JSON.stringify(boundary)};
registerHooks({ resolve(specifier, context, nextResolve) {
  const result = nextResolve(specifier, context);
  if (result.url.startsWith('file:')) {
    const path = relative(boundary, fileURLToPath(result.url));
    if (path.startsWith('..') || isAbsolute(path)) throw new Error('Consumer resolved a dependency outside its installation: ' + result.url);
  }
  return result;
} });
`;

async function withLock(lock: string, work: () => Promise<void>) {
  const started = Date.now();
  for (;;) {
    try {
      await mkdir(lock);
      break;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
      const age = await stat(lock).then(
        ({ mtimeMs }) => Date.now() - mtimeMs,
        () => 0,
      );
      if (age > lockTimeout) await rm(lock, { recursive: true, force: true });
      else if (Date.now() - started > lockTimeout)
        throw new Error(`Timed out waiting for ${lock}, which another test run holds.`, {
          cause: error,
        });
      else await new Promise((done) => setTimeout(done, 500));
    }
  }
  try {
    return await work();
  } finally {
    await rm(lock, { recursive: true, force: true });
  }
}

async function install(directory: string, tarball: string, dependencies: Record<string, string>) {
  await rm(directory, { recursive: true, force: true });
  const consumer = join(directory, 'consumer');
  await mkdir(consumer, { recursive: true });
  await mkdir(join(directory, 'packed'));
  const name = basename(tarball);
  await copyFile(tarball, join(directory, 'packed', name));
  await writeFile(
    join(consumer, 'package.json'),
    JSON.stringify(
      {
        private: true,
        type: 'module',
        dependencies: { ...dependencies, '@envsemble/envui': `file:../packed/${name}` },
      },
      null,
      2,
    ),
  );
  runNode(
    npmCli(),
    ['install', '--ignore-scripts', '--no-audit', '--no-fund', '--loglevel=error'],
    consumer,
  );
  await writeFile(join(consumer, 'IsolationHook.mjs'), isolationHookSource(consumer));
  await writeFile(join(consumer, installationCompleteMarker), '');
}

async function removeOtherInstallations(current: string) {
  for (const entry of await readdir(consumersDirectory))
    if (entry !== current && !entry.endsWith('.lock'))
      await rm(join(consumersDirectory, entry), { recursive: true, force: true });
}

export async function packedConsumer() {
  await mkdir(consumersDirectory, { recursive: true });
  const packDirectory = await mkdtemp(join(repositoryRoot, '.cache/package-pack-'));
  try {
    const { tarball, files } = pack(packDirectory);
    const dependencies = await consumerDependencies();
    const key = createHash('sha256')
      .update(await readFile(tarball))
      .update(JSON.stringify(dependencies))
      .digest('hex')
      .slice(0, 16);
    const root = join(consumersDirectory, key);
    await withLock(join(consumersDirectory, `${key}.lock`), async () => {
      if (existsSync(join(root, 'consumer', installationCompleteMarker))) return;
      await install(root, tarball, dependencies);
      await removeOtherInstallations(key);
    });
    return consumerAt(join(root, 'consumer'), files);
  } finally {
    await rm(packDirectory, { recursive: true, force: true });
  }
}

function consumerAt(directory: string, packedFiles: string[]) {
  const consumerRequire = createRequire(join(directory, 'package.json'));
  const hook = join(directory, 'IsolationHook.mjs');
  const run = (script: string, args: readonly string[] = []) =>
    runNode(script, args, directory, script.startsWith(directory) ? hook : undefined);
  return {
    directory,
    installedDirectory: dirname(consumerRequire.resolve('@envsemble/envui/package.json')),
    require: consumerRequire,
    packedFiles,
    run,
    async runScript(name: string, source: string) {
      const script = join(directory, name);
      await writeFile(script, source);
      return JSON.parse(run(script));
    },
    async typecheck(name: string, source: string, { types = ['react', 'react-dom'] } = {}) {
      await writeFile(join(directory, `${name}.tsx`), source);
      const project = join(directory, `tsconfig.${name}.json`);
      await writeFile(
        project,
        JSON.stringify({
          compilerOptions: {
            target: 'ES2022',
            module: 'NodeNext',
            moduleResolution: 'NodeNext',
            jsx: 'react-jsx',
            strict: true,
            noEmit: true,
            skipLibCheck: false,
            types,
            lib: ['ES2022', 'DOM'],
          },
          include: [`${name}.tsx`],
        }),
      );
      return run(consumerRequire.resolve('typescript/bin/tsc'), [
        '--project',
        project,
        '--listFiles',
      ])
        .trim()
        .split(/\r?\n/);
    },
  };
}
