// Completes the hosted catalogue that `vite build --mode site` leaves in dist/site: the response
// headers the Worker applies, the third-party notices of what it bundles, the files each lazily
// loaded module needs (module-files.json, from Vite's manifest; see SiteModuleFiles.mjs) and
// versions.json.
//
//   node scripts/FinalizeSite.mjs [--with-versions] [--production]
//
// --with-versions also downloads the released offline catalogues into /v<major>.<minor>/; see
// AssembleSiteVersions.mjs. Without it the build needs no network. In a production build, marked
// by --production or by CI in the environment as Workers Builds sets it, a version too large to
// archive fails the build instead of being skipped.
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { assembleSiteVersions } from './AssembleSiteVersions.mjs';
import { collectCatalogueNotices } from './DependencyNotices.mjs';
import { writeModuleFiles } from './SiteModuleFiles.mjs';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const siteDirectory = resolve(repositoryRoot, 'dist/site');
const args = process.argv.slice(2);
if (args.some((argument) => !['--with-versions', '--production'].includes(argument)))
  throw new Error('Usage: FinalizeSite.mjs [--with-versions] [--production]');

await copyFile(
  resolve(repositoryRoot, 'apps/catalogue/site/_headers'),
  resolve(siteDirectory, '_headers'),
);
if (!(await writeModuleFiles(siteDirectory)))
  console.log(
    "dist/site is already finalised: module-files.json stays as written from Vite's manifest, which is gone. Run npm run build:site to build the site again.",
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
    production: args.includes('--production') || Boolean(process.env.CI),
  });
  console.log(
    `Built dist/site for @envsemble/envui ${version}${versions.length ? ` with ${versions.length} archived versions` : ''}; serve it with npm run site:serve.`,
  );
} catch (error) {
  console.error(error);
  process.exitCode = 1;
}
