import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { libraryChangelogFile, libraryPackageFile, repositoryRoot } from '../RepositoryPaths.ts';

const changesetDirectory = resolve(repositoryRoot, '.changeset');

export const libraryVersion = (): string =>
  JSON.parse(readFileSync(libraryPackageFile, 'utf8')).version;

export const withLibraryVersion = (text: string, version = libraryVersion()) =>
  text.replaceAll('{{version}}', version);

const bumpOrder = ['patch', 'minor', 'major'];

function bumped(version: string, bump: string) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

const compareVersions = (a: string, b: string) => {
  const [x, y] = [a, b].map((version) => version.split('.').map(Number));
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

export function libraryVersions({
  changelog = libraryChangelogFile,
  changesets = changesetDirectory,
} = {}) {
  if (!existsSync(changelog)) return undefined;
  const released = [...readFileSync(changelog, 'utf8').matchAll(/^## (\d+\.\d+\.\d+)(?=\s|$)/gm)]
    .map((match) => match[1])
    .sort(compareVersions);
  const versions = new Set(released);
  const readJson = (name: string) => {
    const file = resolve(changesets, name);
    return existsSync(file) ? JSON.parse(readFileSync(file, 'utf8')) : undefined;
  };
  const library = '@envsemble/envui';
  const group = readJson('config.json')?.fixed?.find((names: string[]) =>
    names.includes(library),
  ) ?? [library];
  const pre = readJson('pre.json');
  const directories = [changesets];
  if (pre?.mode === 'pre') directories.push(resolve(changesets, 'pre'));
  const files = directories.flatMap((directory) =>
    existsSync(directory)
      ? readdirSync(directory)
          .filter((name) => name.endsWith('.md') && name !== 'README.md')
          .map((name) => resolve(directory, name))
      : [],
  );
  const bumps = files.length
    ? files.flatMap((file) => {
        const source = readFileSync(file, 'utf8');
        const header = source.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '';
        return [...header.matchAll(/^['"]?([^'"\s:]+)['"]?:\s*(major|minor|patch)\s*$/gm)]
          .filter(([, name]) => group.includes(name))
          .map(([, , bump]) => bump);
      })
    : [];
  const largest = bumps.sort((a, b) => bumpOrder.indexOf(b) - bumpOrder.indexOf(a))[0];
  const base =
    (pre?.mode === 'pre' ? pre.initialVersions?.[library] : undefined) ??
    released.at(-1) ??
    '0.0.0';
  if (largest) versions.add(bumped(base, largest));
  return versions;
}
