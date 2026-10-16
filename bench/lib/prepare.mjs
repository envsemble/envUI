import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { cp, mkdir, readFile, readdir, rename, rm, writeFile, copyFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { run } from './process.mjs';

/** The library tarball is installed under this name so the fixture's dependency spec is stable. */
export const vendoredTarball = 'vendor/envsemble-envui.tgz';

export function npmCli() {
  const candidates = [
    process.env.npm_execpath,
    join(dirname(process.execPath), 'node_modules/npm/bin/npm-cli.js'),
    resolve(dirname(process.execPath), '../lib/node_modules/npm/bin/npm-cli.js'),
  ];
  const found = candidates.find((path) => path?.endsWith('npm-cli.js') && existsSync(path));
  if (!found)
    throw new Error('npm-cli.js not found; run the benchmark through npm or Node with npm.');
  return found;
}

/** Environment for npm commands the runner itself starts, without the outer npm run's settings. */
export function cleanNpmEnv() {
  const env = Object.fromEntries(
    Object.entries(process.env).filter(([name]) => !/^npm_(config|package|lifecycle)_/i.test(name)),
  );
  return {
    ...env,
    npm_config_audit: 'false',
    npm_config_fund: 'false',
    npm_config_update_notifier: 'false',
  };
}

async function sha256(file) {
  return createHash('sha256')
    .update(await readFile(file))
    .digest('hex');
}

/** Builds (optionally) and packs packages/ui into the cache; returns the tarball path. */
export async function packLibrary({ repoDir, cacheDir, build }) {
  const libraryDir = join(repoDir, 'packages/ui');
  if (build)
    run(process.execPath, [npmCli(), 'run', 'build:library'], { cwd: repoDir, stdio: 'inherit' });
  if (
    !existsSync(join(libraryDir, 'dist/index.js')) ||
    !existsSync(join(libraryDir, 'docs/index.md'))
  )
    throw new Error('packages/ui is not built. Run `npm run build:library` or pass --build.');
  const destination = join(cacheDir, 'packs');
  await mkdir(destination, { recursive: true });
  const output = JSON.parse(
    run(process.execPath, [npmCli(), 'pack', '--json', '--pack-destination', destination], {
      cwd: libraryDir,
      env: cleanNpmEnv(),
    }),
  );
  const packed = Array.isArray(output) ? output[0] : Object.values(output)[0];
  const tarball = join(destination, packed.filename);
  const manifest = JSON.parse(await readFile(join(libraryDir, 'package.json'), 'utf8'));
  return {
    tarball,
    version: manifest.version,
    sha256: await sha256(tarball),
    files: packed.entryCount,
  };
}

async function hashFixture(fixtureDir) {
  const hash = createHash('sha256');
  const walk = async (directory) => {
    const entries = (await readdir(directory, { withFileTypes: true })).sort((a, b) =>
      a.name.localeCompare(b.name),
    );
    for (const entry of entries) {
      const path = join(directory, entry.name);
      if (entry.isDirectory()) await walk(path);
      else hash.update(path.slice(fixtureDir.length)).update(await readFile(path));
    }
  };
  await walk(fixtureDir);
  return hash.digest('hex');
}

/**
 * Installs the fixture once per library tarball and fixture version. Runs copy this template, so
 * every agent starts from identical files and the same installed dependencies.
 */
export async function ensureTemplate({ fixtureDir, cacheDir, pack, log }) {
  const key = createHash('sha256')
    .update(pack.sha256)
    .update(await hashFixture(fixtureDir))
    .digest('hex')
    .slice(0, 16);
  const templateDir = join(cacheDir, 'templates', key);
  if (existsSync(join(templateDir, 'node_modules/@envsemble/envui/package.json')))
    return templateDir;
  const staging = `${templateDir}.staging`;
  await rm(staging, { recursive: true, force: true });
  await cp(fixtureDir, staging, { recursive: true });
  await mkdir(join(staging, 'vendor'), { recursive: true });
  await copyFile(pack.tarball, join(staging, vendoredTarball));
  log?.(`Installing the fixture template (${key})...`);
  run(process.execPath, [npmCli(), 'install', '--no-audit', '--no-fund', '--loglevel=error'], {
    cwd: staging,
    env: cleanNpmEnv(),
  });
  await rm(templateDir, { recursive: true, force: true });
  await rename(staging, templateDir);
  return templateDir;
}

const git = (cwd, args) =>
  run('git', ['-c', 'core.autocrlf=false', '-c', 'core.safecrlf=false', ...args], { cwd });

/** Copies the template into a fresh app directory and commits it, so changes can be diffed. */
export async function createWorkspace({ templateDir, appDir }) {
  await rm(appDir, { recursive: true, force: true });
  await mkdir(dirname(appDir), { recursive: true });
  await cp(templateDir, appDir, { recursive: true, verbatimSymlinks: true });
}

export async function commitBaseline(appDir) {
  git(appDir, ['init', '-q', '-b', 'main']);
  git(appDir, ['config', 'core.autocrlf', 'false']);
  git(appDir, ['config', 'user.name', 'Workspace Developer']);
  git(appDir, ['config', 'user.email', 'developer@example.com']);
  git(appDir, ['add', '-A']);
  git(appDir, ['commit', '-q', '-m', 'Initial commit']);
  return git(appDir, ['rev-parse', 'HEAD']);
}

/** Lists files changed since the base commit, including uncommitted and untracked ones. */
export function changedFiles(appDir, baseCommit) {
  git(appDir, ['add', '-A']);
  const output = git(appDir, ['diff', '--cached', '--no-renames', '--name-status', baseCommit]);
  const files = output
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => {
      const [status, ...rest] = line.split('\t');
      return { status: status[0], path: rest.join('\t') };
    });
  const patch = git(appDir, ['diff', '--cached', '--no-renames', '--stat', '-p', baseCommit]);
  return { files, patch };
}

export function baseContent(appDir, baseCommit, path) {
  try {
    return git(appDir, ['show', `${baseCommit}:${path}`]);
  } catch {
    return null;
  }
}

export async function writeJson(file, value) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, `${JSON.stringify(value, null, 2)}\n`);
}
