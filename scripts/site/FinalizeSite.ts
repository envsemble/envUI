import { copyFile, readFile, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { collectCatalogueNotices } from '../build/DependencyNotices.ts';
import { writeModuleFiles } from './SiteModuleFiles.ts';
import { libraryPackageFile, repositoryRoot } from '../RepositoryPaths.ts';

const siteDirectory = resolve(repositoryRoot, 'dist/site');
if (process.argv.length > 2) throw new Error('Usage: FinalizeSite.ts');

await copyFile(
  resolve(repositoryRoot, 'apps/site/hosting/_headers'),
  resolve(siteDirectory, '_headers'),
);
if (!(await writeModuleFiles(siteDirectory)))
  console.log(
    "dist/site is already finalised: module-files.json stays as written from Vite's manifest, which is gone. Run npm run build:site to build the site again.",
  );
const version = JSON.parse(await readFile(libraryPackageFile, 'utf8')).version;
await writeFile(
  resolve(siteDirectory, 'third-party-notices.txt'),
  `@envsemble/envui ${version}\nThird-party notices\n\n${await collectCatalogueNotices(repositoryRoot)}\n`,
);
console.log(
  `Built dist/site for @envsemble/envui ${version}: the catalogue at / and the Docs at /docs; serve it with npm run site:serve.`,
);
