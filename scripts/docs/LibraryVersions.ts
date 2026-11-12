// The library's versions: the one its package.json names, which pages that install envUI write in
// their commands, and the versions a page's `since` may name, from the changelog and changesets.
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { libraryChangelogFile, libraryPackageFile, repositoryRoot } from '../RepositoryPaths.ts';

const changesetDirectory = resolve(repositoryRoot, '.changeset');

/** The version of @envsemble/envui, from its package.json. */
export const libraryVersion = (): string =>
  JSON.parse(readFileSync(libraryPackageFile, 'utf8')).version;

/**
 * Text with the version of @envsemble/envui in place of `{{version}}`: a page of docs/ that installs
 * envUI writes its command with it, so the command people copy from the Docs or the packaged docs
 * runs as it is, and the hosted setup skill does the same (scripts/site/SiteAgentFiles.ts).
 */
export const withLibraryVersion = (text: string, version = libraryVersion()) =>
  text.replaceAll('{{version}}', version);

/** The changesets' version bumps, in order of size. */
const bumpOrder = ['patch', 'minor', 'major'];

/** A version raised by a bump: 1.2.3 by minor is 1.3.0. */
function bumped(version: string, bump: string) {
  const [major, minor, patch] = version.split('.').map(Number);
  if (bump === 'major') return `${major + 1}.0.0`;
  if (bump === 'minor') return `${major}.${minor + 1}.0`;
  return `${major}.${minor}.${patch + 1}`;
}

/** Orders versions such as 0.10.0 after 0.9.0. */
const compareVersions = (a: string, b: string) => {
  const [x, y] = [a, b].map((version) => version.split('.').map(Number));
  return x[0] - y[0] || x[1] - y[1] || x[2] - y[2];
};

/**
 * The versions a page's `since` may name: each stable version the library's changelog lists, and
 * the version its changesets lead to. That is the newest stable version raised by the largest bump
 * of a pending changeset, counting the packages that share envUI's version (the `fixed` group of
 * .changeset/config.json). In prerelease mode (.changeset/pre.json, with the changesets it applied
 * in .changeset/pre/) it is the version the prereleases lead to, such as 1.0.0 for
 * 1.0.0-prerelease.3: the version before the prereleases, from the mode's initialVersions or the
 * newest stable version, raised by the largest bump of every changeset since, released in a
 * prerelease or not, as Changesets computes it. Prerelease headings such as
 * `## 1.0.0-prerelease.0` are not versions a page can name. Undefined outside the repository, where the check is skipped.
 */
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
  // Changesets 3 keeps the changesets that prereleases applied in .changeset/pre/ until the mode
  // ends; they count toward the version the prereleases lead to.
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
