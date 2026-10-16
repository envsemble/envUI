// Completes the hosted catalogue that `vite build --mode site` leaves in dist/site: the response
// headers the Worker applies, the third-party notices of what it bundles, and versions.json.
//
//   node scripts/FinalizeSite.mjs [--with-versions]
//
// --with-versions also downloads the released offline catalogues into /v<major>.<minor>/; see
// AssembleSiteVersions.mjs. Without it the build needs no network.
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleSiteVersions } from './AssembleSiteVersions.mjs';
import { collectCatalogueNotices } from './DependencyNotices.mjs';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const siteDirectory = resolve(repositoryRoot, 'dist/site');
const args = process.argv.slice(2);
if (args.some((argument) => argument !== '--with-versions'))
  throw new Error('Usage: FinalizeSite.mjs [--with-versions]');

await copyFile(
  resolve(repositoryRoot, 'apps/catalogue/site/_headers'),
  resolve(siteDirectory, '_headers'),
);
const version = JSON.parse(
  await readFile(resolve(repositoryRoot, 'packages/ui/package.json'), 'utf8'),
).version;
await writeFile(
  resolve(siteDirectory, 'third-party-notices.txt'),
  `@envsemble/envui ${version}\nThird-party notices\n\n${await collectCatalogueNotices(repositoryRoot)}\n`,
);
try {
  const versions = await assembleSiteVersions({
    siteDirectory,
    download: args.includes('--with-versions'),
  });
  console.log(
    `Built dist/site for @envsemble/envui ${version}${versions.length ? ` with ${versions.length} archived versions` : ''}; serve it with npm run site:serve.`,
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
