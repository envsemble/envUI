// An application that installs envUI as it is published: the library packed with npm, installed with
// React and the libraries its entry points' setup names, at the versions envUI is tested with. The
// package tests run its scripts and typecheck its code to see what an application sees.
//
// One installation serves every test file and run while the pack and the dependencies stay the
// same: it is kept in .cache/package-consumer/<hash>/, and a lock lets one process install it while
// the others wait. Needs the library build (npm run build).
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { copyFile, mkdir, mkdtemp, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { basename, delimiter, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { documentedLibraries } from '../../scripts/build/EntryLibraries.ts';
import { repository } from './importSource.mjs';

const consumersDirectory = join(repository, '.cache/package-consumer');
/** Written once the installation is complete. */
const readyMarker = '.installed';
/** How long a process waits for another's installation, and when a lock counts as abandoned. */
const lockTimeout = 5 * 60 * 1000;
/** The time the package tests' before() hooks allow for packing and installing. */
export const installTimeout = lockTimeout + 60 * 1000;

function npmCli() {
  const candidates = [
    process.env.npm_execpath,
    join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
    '/usr/share/nodejs/npm/bin/npm-cli.js',
    ...(process.env.PATH ?? '')
      .split(delimiter)
      .map((directory) => join(directory, 'node_modules/npm/bin/npm-cli.js')),
  ];
  const candidate = candidates.find((path) => path?.endsWith('.js') && existsSync(path));
  assert.ok(
    candidate,
    'Run this suite through npm test, or provide a Node installation containing npm.',
  );
  return candidate;
}

/** Runs a Node script in `cwd` without npm's environment, and returns what it prints. */
function runNode(script, args, cwd, hook) {
  try {
    return execFileSync(
      process.execPath,
      [...(hook ? ['--import', pathToFileURL(hook).href] : []), script, ...args],
      {
        cwd,
        encoding: 'utf8',
        maxBuffer: 16 * 1024 * 1024,
        stdio: ['ignore', 'pipe', 'pipe'],
        env: {
          ...Object.fromEntries(
            Object.entries(process.env).filter(([name]) => !/^npm_/i.test(name)),
          ),
          NODE_OPTIONS: '',
          npm_config_audit: 'false',
          npm_config_fund: 'false',
        },
      },
    );
  } catch (error) {
    const detail = [error.stdout, error.stderr].filter(Boolean).join('\n').slice(-12000);
    throw new Error(`Consumer command failed: ${script}\n${detail}`, { cause: error });
  }
}

/** Packs the library into `directory`: the tarball's path and the files it holds. */
function pack(directory) {
  const result = JSON.parse(
    runNode(
      npmCli(),
      ['pack', '--json', '--pack-destination', directory],
      join(repository, 'packages/ui'),
    ),
  );
  const packed = Array.isArray(result) ? result : Object.values(result);
  assert.equal(packed.length, 1);
  return {
    tarball: join(directory, packed[0].filename),
    files: packed[0].files.map((file) => file.path.replaceAll('\\', '/')),
  };
}

/**
 * React, the tools the tests run in the consumer, and the libraries the setup guide names for the
 * code, markdown, rich-text, diff and color entries, at the versions of the repository's manifests.
 */
async function consumerDependencies() {
  const read = async (path) => JSON.parse(await readFile(join(repository, path), 'utf8'));
  const { devDependencies: tools } = await read('package.json');
  const { devDependencies: libraries } = await read('packages/ui/package.json');
  const dependencies = {};
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
  for (const entryLibraries of Object.values(await documentedLibraries(repository)))
    for (const { name } of entryLibraries) dependencies[name] = libraries[name];
  return dependencies;
}

/**
 * A hook that fails any import the consumer resolves outside its own installation, such as the
 * repository's React, so a test sees only what an application would.
 */
const isolationHookSource = (boundary) => `
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

/** Runs `work` while holding the lock directory `lock`, taking over one older than the timeout. */
async function withLock(lock, work) {
  const started = Date.now();
  for (;;) {
    try {
      await mkdir(lock);
      break;
    } catch (error) {
      if (error.code !== 'EEXIST') throw error;
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

/** Installs the consumer in `directory`/consumer, with the tarball in `directory`/packed. */
async function install(directory, tarball, dependencies) {
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
  await writeFile(join(consumer, readyMarker), '');
}

/** Removes the installations of earlier packs, keeping `current` and the locks. */
async function removeOtherInstallations(current) {
  for (const entry of await readdir(consumersDirectory))
    if (entry !== current && !entry.endsWith('.lock'))
      await rm(join(consumersDirectory, entry), { recursive: true, force: true });
}

/**
 * The packed consumer, installed or reused: its `directory`, the installed package's
 * (`installedDirectory`), a `require` that resolves as the consumer does, the files of the pack
 * (`packedFiles`), and ways to run code in it.
 */
export async function packedConsumer() {
  await mkdir(consumersDirectory, { recursive: true });
  const packDirectory = await mkdtemp(join(repository, '.cache/package-pack-'));
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
      if (existsSync(join(root, 'consumer', readyMarker))) return;
      await install(root, tarball, dependencies);
      await removeOtherInstallations(key);
    });
    return consumerAt(join(root, 'consumer'), files);
  } finally {
    await rm(packDirectory, { recursive: true, force: true });
  }
}

function consumerAt(directory, packedFiles) {
  const consumerRequire = createRequire(join(directory, 'package.json'));
  const hook = join(directory, 'IsolationHook.mjs');
  /** Runs a script, isolated to the consumer when it is one of the consumer's own. */
  const run = (script, args = []) =>
    runNode(script, args, directory, script.startsWith(directory) ? hook : undefined);
  return {
    directory,
    installedDirectory: dirname(consumerRequire.resolve('@envsemble/envui/package.json')),
    require: consumerRequire,
    packedFiles,
    run,
    /** Writes the module `name` with `source` into the consumer, runs it and parses what it prints. */
    async runScript(name, source) {
      const script = join(directory, name);
      await writeFile(script, source);
      return JSON.parse(run(script));
    },
    /**
     * Typechecks `source` as `<name>.tsx` with the installed declarations, strictly, and returns
     * the files the compiler read. `types` are the global type packages it loads.
     */
    async typecheck(name, source, { types = ['react', 'react-dom'] } = {}) {
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
