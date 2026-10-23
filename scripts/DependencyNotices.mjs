import { readFile, readdir } from 'node:fs/promises';
import { resolve } from 'node:path';

/**
 * The workspaces whose runtime dependencies ship: the library's and the hosted site's. The
 * codemods package runs on the developer's machine and its dependencies ship with it, not here.
 */
const shippingWorkspaces = ['packages/ui', 'apps/catalogue'];

/** The lockfile location a dependency of the package at `from` resolves to, as Node finds it. */
function resolveLocked(packages, from, name) {
  for (let base = from; ; ) {
    const location = `${base ? `${base}/` : ''}node_modules/${name}`;
    if (packages[location]) return location;
    if (!base) return undefined;
    const parent = base.lastIndexOf('/node_modules/');
    base = parent === -1 ? '' : base.slice(0, parent);
  }
}

/**
 * Include the locked runtime dependencies of the shipping workspaces, including optional bundled
 * grammar modules: every non-dev package reachable from them through non-dev packages.
 */
export async function collectDependencyNotices(repositoryRoot) {
  const lock = JSON.parse(await readFile(resolve(repositoryRoot, 'package-lock.json'), 'utf8'));
  const reachable = new Map();
  const visit = (location) => {
    const { dependencies, optionalDependencies, peerDependencies } = lock.packages[location];
    const names = Object.keys({ ...dependencies, ...optionalDependencies, ...peerDependencies });
    for (const name of names) {
      const found = resolveLocked(lock.packages, location, name);
      const entry = found && lock.packages[found];
      if (!entry || entry.dev || entry.link || reachable.has(found)) continue;
      reachable.set(found, entry);
      visit(found);
    }
  };
  for (const workspace of shippingWorkspaces) visit(workspace);
  const entries = [...reachable].sort(([first], [second]) => first.localeCompare(second));
  const notices = await Promise.all(
    entries.map(async ([path, entry]) => {
      const directory = resolve(repositoryRoot, path);
      const metadata = JSON.parse(await readFile(resolve(directory, 'package.json'), 'utf8'));
      const licenseFiles = (await readdir(directory))
        .filter((name) => /^(licen[sc]e|notice)([.\-_]|$)/i.test(name))
        .sort();
      const contents = await Promise.all(
        licenseFiles.map(
          async (name) => `${name}\n${await readFile(resolve(directory, name), 'utf8')}`,
        ),
      );
      if (!contents.length) throw new Error(`Missing runtime license notice: ${metadata.name}`);
      return `${metadata.name}@${entry.version} (${metadata.license ?? entry.license ?? 'see license'})\n${contents.join('\n\n')}`;
    }),
  );
  return notices.join('\n\n');
}

/** Everything the catalogue bundles: the runtime dependencies, Inter and Material Symbols. */
export async function collectCatalogueNotices(repositoryRoot) {
  const notices = [await collectDependencyNotices(repositoryRoot)];
  for (const name of ['Inter-LICENSE.txt', 'Material-Symbols-LICENSE.txt'])
    notices.push(await readFile(resolve(repositoryRoot, 'packages/ui/licenses', name), 'utf8'));
  return notices.join('\n\n');
}
