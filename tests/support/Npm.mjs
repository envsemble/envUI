// Running npm and Node scripts from the tests the way an application would, outside npm's own
// environment, and installing a package as npm packs it.
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { delimiter, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

/** npm's CLI script, also when the tests run without npm. */
export function npmCli() {
  const candidates = [
    process.env.npm_execpath,
    join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
    // Where Debian's and Ubuntu's nodejs package puts npm, which none of the others find.
    '/usr/share/nodejs/npm/bin/npm-cli.js',
    ...(process.env.PATH ?? '')
      .split(delimiter)
      .map((directory) => join(directory, 'node_modules/npm/bin/npm-cli.js')),
  ];
  const candidate = candidates.find((path) => path?.endsWith('.js') && existsSync(path));
  assert.ok(candidate, 'Run these tests through npm test, or with npm installed beside Node.');
  return candidate;
}

/**
 * Runs a Node script in `cwd` without npm's environment, first importing the module `hook` if
 * given, and returns what it prints.
 */
export function runNode(script, args, cwd, hook) {
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
    throw new Error(`Command failed: ${script}\n${detail}`, { cause: error });
  }
}

/**
 * Runs npm pack in `packageDirectory` with `args`: the pack's `filename` and its `files`, with
 * forward slashes, sorted.
 */
export function npmPack(packageDirectory, args) {
  const result = JSON.parse(runNode(npmCli(), ['pack', '--json', ...args], packageDirectory));
  // A list, or an object by package name when npm packs inside a workspace.
  const packed = Array.isArray(result) ? result : Object.values(result);
  assert.equal(packed.length, 1);
  const [{ filename, files }] = packed;
  return { filename, files: files.map(({ path }) => path.replaceAll('\\', '/')).sort() };
}

/**
 * Installs the package in `packageDirectory` as npm would pack it, by copying the files of its
 * pack into the node_modules of a new consumer folder in the repository's .cache, where its peer
 * dependencies resolve to the repository's. Returns the consumer's `directory`, to remove after
 * the tests, and the `files` of the pack.
 */
export async function installAsPacked(packageDirectory) {
  const { name } = JSON.parse(await readFile(join(packageDirectory, 'package.json'), 'utf8'));
  const { files } = npmPack(packageDirectory, [
    '--dry-run',
    '--ignore-scripts',
    '--loglevel=error',
  ]);
  await mkdir(join(repositoryRoot, '.cache'), { recursive: true });
  const directory = await mkdtemp(
    join(repositoryRoot, '.cache', `${name.split('/').pop()}-consumer-`),
  );
  for (const path of files)
    await cp(join(packageDirectory, path), join(directory, 'node_modules', name, path), {
      recursive: true,
    });
  return { directory, files };
}
