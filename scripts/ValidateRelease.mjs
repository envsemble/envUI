import { readFile } from 'node:fs/promises';
const libraryPackage = JSON.parse(
  await readFile(new URL('../packages/ui/package.json', import.meta.url), 'utf8'),
);
const cataloguePackage = JSON.parse(
  await readFile(new URL('../apps/catalogue/package.json', import.meta.url), 'utf8'),
);
const tag = process.env.GITHUB_REF_NAME;
if (tag !== `v${libraryPackage.version}`)
  throw new Error(`Tag ${tag} must match @envsemble/envui v${libraryPackage.version}.`);
if (cataloguePackage.dependencies['@envsemble/envui'] !== libraryPackage.version)
  throw new Error('Catalogue dependency must match the release version.');
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(libraryPackage.version))
  throw new Error('Invalid version.');
const prerelease = libraryPackage.version.includes('-');
const notes = releaseNotes(
  await readFile(new URL('../packages/ui/CHANGELOG.md', import.meta.url), 'utf8'),
  libraryPackage.version,
);
if (process.argv.includes('--release-notes')) process.stdout.write(notes);
else if (process.argv.includes('--dist-tag')) console.log(prerelease ? 'next' : 'latest');
else if (process.argv.includes('--release-flag')) console.log(prerelease ? '--prerelease' : '');
else console.log(`Validated ${tag}; ${prerelease ? 'prerelease' : 'stable'} distribution.`);

/** The CHANGELOG section for one version: from its `## <version>` heading to the next `## ` heading. */
function releaseNotes(changelog, version) {
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
