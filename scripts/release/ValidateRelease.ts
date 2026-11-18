import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { libraryChangelogFile, libraryPackageFile, repositoryRoot } from '../RepositoryPaths.ts';

const readJson = (file: string) => JSON.parse(readFileSync(file, 'utf8'));

export const libraryVersion = (): string => readJson(libraryPackageFile).version;

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
  const prereleaseName = parts[1];
  return {
    version,
    prerelease: prereleaseName !== undefined,
    distTag: prereleaseName ?? 'latest',
    notes: releaseNotes(readFileSync(libraryChangelogFile, 'utf8'), version),
  };
}

export const releaseNotesLimit = 125_000;

export function releaseNotes(changelog: string, version: string, limit = releaseNotesLimit) {
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
  if (body.length < limit) return `${body}\n`;
  const summary = body.split(/^### /m)[0]!.trim();
  if (!summary)
    throw new Error(`CHANGELOG.md section for ${version} needs a summary to link from.`);
  const changelogUrl = `https://github.com/envsemble/envUI/blob/v${version}/packages/ui/CHANGELOG.md`;
  return `${summary}\n\nEvery change in ${version} is in the [changelog](${changelogUrl}).\n`;
}

if (import.meta.main) {
  const tag = process.env.GITHUB_REF_NAME;
  const release = validateRelease(tag);
  if (process.argv.includes('--release-notes')) process.stdout.write(release.notes);
  else
    console.log(`Validated ${tag}; ${release.prerelease ? 'prerelease' : 'stable'} distribution.`);
}
