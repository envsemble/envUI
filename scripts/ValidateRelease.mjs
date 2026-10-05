import { readFile } from 'node:fs/promises';
const libraryPackage = JSON.parse(
  await readFile(new URL('../packages/ui/package.json', import.meta.url), 'utf8'),
);
const documentationPackage = JSON.parse(
  await readFile(new URL('../apps/docs/package.json', import.meta.url), 'utf8'),
);
const tag = process.env.GITHUB_REF_NAME;
if (tag !== `v${libraryPackage.version}`)
  throw new Error(`Tag ${tag} must match @envsemble/envui v${libraryPackage.version}.`);
if (documentationPackage.dependencies['@envsemble/envui'] !== libraryPackage.version)
  throw new Error('Documentation dependency must match the release version.');
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(libraryPackage.version))
  throw new Error('Invalid version.');
const prerelease = libraryPackage.version.includes('-');
if (process.argv.includes('--dist-tag')) console.log(prerelease ? 'next' : 'latest');
else if (process.argv.includes('--release-flag')) console.log(prerelease ? '--prerelease' : '');
else console.log(`Validated ${tag}; ${prerelease ? 'prerelease' : 'stable'} distribution.`);
