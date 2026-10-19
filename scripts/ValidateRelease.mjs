import { readFile } from 'node:fs/promises';
const libraryPackage = JSON.parse(
  await readFile(new URL('../packages/ui/package.json', import.meta.url), 'utf8'),
);
const codemodsPackage = JSON.parse(
  await readFile(new URL('../packages/codemods/package.json', import.meta.url), 'utf8'),
);
const cataloguePackage = JSON.parse(
  await readFile(new URL('../apps/catalogue/package.json', import.meta.url), 'utf8'),
);
// The release tag: RELEASE_TAG where a workflow names it, as GitHub sets GITHUB_REF_NAME to the
// event's ref, else GITHUB_REF_NAME on a tag push or by hand.
const tag = process.env.RELEASE_TAG ?? process.env.GITHUB_REF_NAME;
if (tag !== `v${libraryPackage.version}`)
  throw new Error(`Tag ${tag} must match @envsemble/envui v${libraryPackage.version}.`);
if (codemodsPackage.version !== libraryPackage.version)
  throw new Error('@envsemble/envui-codemods must share the release version.');
if (cataloguePackage.dependencies['@envsemble/envui'] !== libraryPackage.version)
  throw new Error('Catalogue dependency must match the release version.');
// The lint packages are published with the library at its version (a fixed group in Changesets).
for (const directory of ['eslint-plugin', 'stylelint-config']) {
  const { name, version } = JSON.parse(
    await readFile(new URL(`../packages/${directory}/package.json`, import.meta.url), 'utf8'),
  );
  if (version !== libraryPackage.version)
    throw new Error(`${name} ${version} must have the release version ${libraryPackage.version}.`);
}
// The agent plugin that this repository's marketplace serves carries the library's version, so
// clients fetch it again with each release (`npm run changeset:version` sets it).
for (const manifest of ['.claude-plugin', '.codex-plugin']) {
  const { version } = JSON.parse(
    await readFile(new URL(`../plugin/${manifest}/plugin.json`, import.meta.url), 'utf8'),
  );
  if (version !== libraryPackage.version)
    throw new Error(
      `plugin/${manifest}/plugin.json ${version} must have the release version ${libraryPackage.version}; run npm run plugin:generate.`,
    );
}
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(libraryPackage.version))
  throw new Error('Invalid version.');
const prerelease = libraryPackage.version.includes('-');
const notes = releaseNotes(
  await readFile(new URL('../packages/ui/CHANGELOG.md', import.meta.url), 'utf8'),
  libraryPackage.version,
);
if (process.argv.includes('--release-notes')) process.stdout.write(notes);
// A prerelease goes out under its own name, such as prerelease for 1.0.0-prerelease.0.
else if (process.argv.includes('--dist-tag'))
  console.log(prerelease ? libraryPackage.version.split('-')[1].split('.')[0] : 'latest');
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
