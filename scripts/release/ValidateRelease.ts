// Checks that a release is ready: the packages and the catalogue's dependency carry the version the
// tag names, and the library's CHANGELOG has a section for it. Publish.ts validates with it before
// it publishes anything.
//
//   GITHUB_REF_NAME=v<version> node scripts/release/ValidateRelease.ts [--release-notes]
//
// --release-notes prints the version's CHANGELOG section, the release's notes.
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { libraryChangelogFile, libraryPackageFile, repositoryRoot } from '../RepositoryPaths.ts';

const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'));

/** The library's version, which the lint packages share (a fixed group in Changesets). */
export const libraryVersion = (): string => readJson(libraryPackageFile).version;

/**
 * The release of `tag`, once it is checked: its version, whether it is a prerelease, the dist-tag
 * it goes out under and its notes. Throws on the first thing that isn't ready.
 */
export function validateRelease(tag: string | undefined) {
  const version = libraryVersion();
  if (tag !== `v${version}`) throw new Error(`Tag ${tag} must match @envsemble/envui v${version}.`);
  const catalogue = readJson(resolve(repositoryRoot, 'apps/site/package.json'));
  if (catalogue.dependencies['@envsemble/envui'] !== version)
    throw new Error('Catalogue dependency must match the release version.');
  for (const directory of ['eslint-plugin', 'stylelint-config']) {
    const lint = readJson(resolve(repositoryRoot, `packages/${directory}/package.json`));
    if (lint.version !== version)
      throw new Error(`${lint.name} ${lint.version} must have the release version ${version}.`);
  }
  const parts = /^\d+\.\d+\.\d+(?:-([0-9A-Za-z]+)[0-9A-Za-z.-]*)?$/.exec(version);
  if (!parts) throw new Error('Invalid version.');
  // A prerelease goes out under its own name, such as prerelease for 1.0.0-prerelease.0.
  const prereleaseName = parts[1];
  return {
    version,
    prerelease: prereleaseName !== undefined,
    distTag: prereleaseName ?? 'latest',
    notes: releaseNotes(readFileSync(libraryChangelogFile, 'utf8'), version),
  };
}

/** The CHANGELOG section for one version: from its `## <version>` heading to the next `## ` heading. */
function releaseNotes(changelog: string, version: string) {
  const lines = changelog.replaceAll('\r\n', '\n').split('\n');
  const start = lines.findIndex(
    (line) => line === `## ${version}` || line.startsWith(`## ${version} `),
  );
  if (start === -1) throw new Error(`CHANGELOG.md has no section for ${version}.`);
  const end = lines.findIndex((line, index) => index > start && line.startsWith('## '));
  const body = lines
    .slice(start + 1, end === -1 ? undefined : end)
    .join('\n')
    .trim();
  if (!body) throw new Error(`CHANGELOG.md section for ${version} is empty.`);
  return `${body}\n`;
}

if (import.meta.main) {
  const tag = process.env.GITHUB_REF_NAME;
  const release = validateRelease(tag);
  if (process.argv.includes('--release-notes')) process.stdout.write(release.notes);
  else
    console.log(`Validated ${tag}; ${release.prerelease ? 'prerelease' : 'stable'} distribution.`);
}
