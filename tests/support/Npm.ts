import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync } from 'node:fs';
import { cp, mkdir, mkdtemp, readFile } from 'node:fs/promises';
import { delimiter, dirname, join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';
import { repositoryRoot } from '../../scripts/RepositoryPaths.ts';

const debianAndUbuntuNpmCli = '/usr/share/nodejs/npm/bin/npm-cli.js';

export function npmCli() {
  const candidates = [
    process.env.npm_execpath,
    join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
    debianAndUbuntuNpmCli,
    ...(process.env.PATH ?? '')
      .split(delimiter)
      .map((directory) => join(directory, 'node_modules/npm/bin/npm-cli.js')),
  ];
  const candidate = candidates.find((path) => path?.endsWith('.js') && existsSync(path));
  assert.ok(candidate, 'Run these tests through npm test, or with npm installed beside Node.');
  return candidate;
}

export function runNode(script: string, args: readonly string[], cwd: string, hook?: string) {
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
  } catch (caught) {
    const error = caught as { stdout?: string; stderr?: string };
    const detail = [error.stdout, error.stderr].filter(Boolean).join('\n').slice(-12000);
    throw new Error(`Command failed: ${script}\n${detail}`, { cause: caught });
  }
}

export function npmPack(packageDirectory: string, args: readonly string[]) {
  const result = JSON.parse(runNode(npmCli(), ['pack', '--json', ...args], packageDirectory));
  const packedInWorkspace = !Array.isArray(result);
  const packed: { filename: string; files: { path: string }[] }[] = packedInWorkspace
    ? Object.values(result)
    : result;
  assert.equal(packed.length, 1);
  const [{ filename, files }] = packed;
  return { filename, files: files.map(({ path }) => path.replaceAll('\\', '/')).sort() };
}

export async function installAsPacked(packageDirectory: string) {
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
