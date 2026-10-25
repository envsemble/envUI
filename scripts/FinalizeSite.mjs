// Completes the static site that `vite build` leaves in dist/site: the response headers the Worker
// applies, the third-party notices of what it bundles and the files each lazily loaded module needs
// (module-files.json, from Vite's manifest; see SiteModuleFiles.mjs). It checks first that dev mode
// is in the dev mode page's files only (SiteDevMode.mjs). It needs no network.
//
//   node scripts/FinalizeSite.mjs
import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { collectCatalogueNotices } from './DependencyNotices.mjs';
import { checkDevModeChunks } from './SiteDevMode.mjs';
import { writeModuleFiles } from './SiteModuleFiles.mjs';

const repositoryRoot = fileURLToPath(new URL('../', import.meta.url));
const siteDirectory = resolve(repositoryRoot, 'dist/site');
if (process.argv.length > 2) throw new Error('Usage: FinalizeSite.mjs');

await copyFile(
  resolve(repositoryRoot, 'apps/catalogue/site/_headers'),
  resolve(siteDirectory, '_headers'),
);
// Dev mode loads on its own page only, which the manifest shows before it goes.
await checkDevModeChunks(siteDirectory);
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
console.log(
  `Built dist/site for @envsemble/envui ${version}: the Usage guide at / and the Docs at /docs; serve it with npm run site:serve.`,
);
