import { readFile } from 'node:fs/promises';
const pkg = JSON.parse(
  await readFile(new URL('../packages/ui/package.json', import.meta.url), 'utf8'),
);
const docs = JSON.parse(
  await readFile(new URL('../apps/docs/package.json', import.meta.url), 'utf8'),
);
const tag = process.env.GITHUB_REF_NAME;
if (tag !== `v${pkg.version}`)
  throw new Error(`Tag ${tag} must match @envsemble/envui v${pkg.version}.`);
if (docs.dependencies['@envsemble/envui'] !== pkg.version)
  throw new Error('Documentation dependency must match the release version.');
if (!/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?$/.test(pkg.version)) throw new Error('Invalid version.');
const prerelease = pkg.version.includes('-');
if (process.argv.includes('--dist-tag')) console.log(prerelease ? 'next' : 'latest');
else if (process.argv.includes('--release-flag')) console.log(prerelease ? '--prerelease' : '');
else console.log(`Validated ${tag}; ${prerelease ? 'prerelease' : 'stable'} distribution.`);
